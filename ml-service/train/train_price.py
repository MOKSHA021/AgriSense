"""
train_price.py  –  Production-grade market price forecasting trainer
AgriSense | Prophet + Indian holidays + cross-validation + parallel crop training
"""

import os
import json
import logging
import argparse
import warnings
from datetime import datetime, timezone
from concurrent.futures import ProcessPoolExecutor, as_completed
from typing import Optional

import pandas as pd
import numpy as np
import joblib
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics

warnings.filterwarnings('ignore')

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_DIR     = os.path.join(BASE_DIR, 'data', 'parquet')
DATA_DIR    = os.path.join(BASE_DIR, 'data')
MODELS_DIR  = os.path.join(BASE_DIR, 'models')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')

CROPS            = ['Wheat', 'Rice', 'Maize', 'Mustard', 'Tomato', 'Potato', 'Onion']
YEARS            = range(2001, 2027)
MIN_ROWS         = 90
FORECAST_HORIZON = 90

os.makedirs(MODELS_DIR,  exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


# ── Indian Public Holidays ────────────────────────────────────────────────────
def get_indian_holidays() -> pd.DataFrame:
    years = list(range(2001, 2028))
    records = []
    for y in years:
        records += [
            {'holiday': 'Republic_Day',     'ds': f'{y}-01-26'},
            {'holiday': 'Holi',             'ds': f'{y}-03-10'},
            {'holiday': 'Independence_Day', 'ds': f'{y}-08-15'},
            {'holiday': 'Gandhi_Jayanti',   'ds': f'{y}-10-02'},
            {'holiday': 'Diwali',           'ds': f'{y}-10-24'},
            {'holiday': 'Dussehra',         'ds': f'{y}-10-12'},
        ]
    df = pd.DataFrame(records)
    df['ds'] = pd.to_datetime(df['ds'])
    df['lower_window'] = -1
    df['upper_window'] = 1
    return df


# ── Logging ───────────────────────────────────────────────────────────────────
def setup_logger(name: str) -> logging.Logger:
    log_path = os.path.join(REPORTS_DIR, f'{name}.log')
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s | %(levelname)s | %(message)s',
        handlers=[
            logging.FileHandler(log_path),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(name)


# ── Column normalisation map ───────────────────────────────────────────────────
YEARLY_RENAME = {
    'Commodity Name':  'Commodity', 'commodity':       'Commodity',
    'COMMODITY':       'Commodity', 'crop':            'Commodity',
    'Crop':            'Commodity', 'commodity_name':  'Commodity',
    'Price Date':      'Arrival_Date', 'Date':         'Arrival_Date',
    'arrival_date':    'Arrival_Date', 'ARRIVAL_DATE': 'Arrival_Date',
    'Arrival Date':    'Arrival_Date', 'date':         'Arrival_Date',
    'month':           'Arrival_Date',
    'Modal Price':     'Modal_Price', 'modal_price':   'Modal_Price',
    'MODAL_PRICE':     'Modal_Price', 'Modal_price':   'Modal_Price',
    'Price':           'Modal_Price', 'price':         'Modal_Price',
    'avg_modal_price': 'Modal_Price',
}


def _normalise_and_filter(df: pd.DataFrame, label: str,
                           logger: logging.Logger) -> Optional[pd.DataFrame]:
    df.rename(columns={k: v for k, v in YEARLY_RENAME.items() if k in df.columns},
              inplace=True)

    required = {'Commodity', 'Arrival_Date', 'Modal_Price'}
    missing  = required - set(df.columns)
    if missing:
        logger.warning(
            f"  ⚠️  {label} missing columns {missing} "
            f"(found: {list(df.columns)}) — skipping"
        )
        return None

    df = df[['Commodity', 'Arrival_Date', 'Modal_Price']].copy()
    df = df[df['Commodity'].isin(CROPS)]
    if df.empty:
        logger.warning(f"  ⚠️  {label} — no target crops found after filter")
        return None

    return df


# ── Loader: Yearly files (2001–2026) — parquet OR csv ────────────────────────
def load_yearly_csvs(logger: logging.Logger) -> list:
    frames = []

    if not os.path.exists(CSV_DIR):
        logger.error(f"CSV_DIR does not exist: {CSV_DIR}")
        return frames

    actual_files = os.listdir(CSV_DIR)
    logger.info(
        f"Files in {CSV_DIR}: "
        f"{actual_files[:10]}{'...' if len(actual_files) > 10 else ''}"
    )

    missing = []
    for year in YEARS:
        parquet_path = os.path.join(CSV_DIR, f'{year}.parquet')
        csv_path     = os.path.join(CSV_DIR, f'{year}.csv')

        if os.path.exists(parquet_path):
            # ── Parquet branch ────────────────────────────────────────────
            try:
                df     = pd.read_parquet(parquet_path, engine='pyarrow')
                result = _normalise_and_filter(df, f'{year}.parquet', logger)
                if result is not None:
                    frames.append(result)
                    logger.info(f"  ✅ {year}.parquet: {len(result):,} rows")
            except Exception as e:
                logger.error(f"  ❌ Failed {year}.parquet: {e}")

        elif os.path.exists(csv_path):
            # ── CSV branch ────────────────────────────────────────────────
            try:
                df     = pd.read_csv(csv_path, low_memory=False)
                result = _normalise_and_filter(df, f'{year}.csv', logger)
                if result is not None:
                    frames.append(result)
                    logger.info(f"  ✅ {year}.csv: {len(result):,} rows")
            except Exception as e:
                logger.error(f"  ❌ Failed {year}.csv: {e}")

        else:
            missing.append(year)

    if missing:
        logger.warning(f"  Missing yearly files: {missing}")

    return frames


# ── Loader: Agriculture_price_dataset.csv ────────────────────────────────────
# Columns: STATE, District Name, Market Name, Commodity, Variety,
#          Grade, Min_Price, Max_Price, Modal_Price, Price Date
def load_agri_price_dataset(logger: logging.Logger) -> Optional[pd.DataFrame]:
    path = os.path.join(DATA_DIR, 'Agriculture_price_dataset.csv')
    if not os.path.exists(path):
        logger.warning("Agriculture_price_dataset.csv not found")
        return None
    try:
        df = pd.read_csv(path, low_memory=False)
        df.rename(columns={'Price Date': 'Arrival_Date'}, inplace=True)
        result = _normalise_and_filter(df, 'Agriculture_price_dataset.csv', logger)
        if result is not None:
            logger.info(f"  ✅ Agriculture_price_dataset.csv: {len(result):,} rows")
        return result
    except Exception as e:
        logger.error(f"  ❌ Agriculture_price_dataset.csv: {e}")
        return None


# ── Loader: crop_price_dataset.csv ───────────────────────────────────────────
# Columns: month, commodity_name, avg_modal_price, avg_min_price,
#          avg_max_price, state_name, district_name, calculationType, change
def load_crop_price_dataset(logger: logging.Logger) -> Optional[pd.DataFrame]:
    path = os.path.join(DATA_DIR, 'crop_price_dataset.csv')
    if not os.path.exists(path):
        return None
    try:
        df = pd.read_csv(path, low_memory=False)
        df.rename(columns={
            'commodity_name':  'Commodity',
            'avg_modal_price': 'Modal_Price',
            'month':           'Arrival_Date',
        }, inplace=True)
        result = _normalise_and_filter(df, 'crop_price_dataset.csv', logger)
        if result is not None:
            logger.info(f"  ✅ crop_price_dataset.csv: {len(result):,} rows")
        return result
    except Exception as e:
        logger.error(f"  ❌ crop_price_dataset.csv: {e}")
        return None


# ── Loader: prices_Wheat.csv etc. (already Prophet ds/y format) ──────────────
INDIVIDUAL_CROP_FILES = {
    'Wheat':   'prices_Wheat.csv',
    'Rice':    'prices_Rice.csv',
    'Maize':   'prices_Maize.csv',
    'Mustard': 'prices_Mustard.csv',
}

def load_individual_crop_csvs(logger: logging.Logger) -> list:
    frames = []
    for crop, fname in INDIVIDUAL_CROP_FILES.items():
        path = os.path.join(DATA_DIR, fname)
        if not os.path.exists(path):
            continue
        try:
            df = pd.read_csv(path, low_memory=False)
            if 'ds' in df.columns and 'y' in df.columns:
                df = df[['ds', 'y']].copy()
                df.rename(columns={'ds': 'Arrival_Date', 'y': 'Modal_Price'}, inplace=True)
                df['Commodity'] = crop
                frames.append(df[['Commodity', 'Arrival_Date', 'Modal_Price']])
                logger.info(f"  ✅ {fname}: {len(df):,} rows → '{crop}'")
            else:
                df['Commodity'] = crop
                result = _normalise_and_filter(df, fname, logger)
                if result is not None:
                    frames.append(result)
                    logger.info(f"  ✅ {fname} (fallback): {len(result):,} rows")
        except Exception as e:
            logger.error(f"  ❌ {fname}: {e}")
    return frames


# ── Master Data Loader ────────────────────────────────────────────────────────
def load_all_data(logger: logging.Logger) -> pd.DataFrame:
    frames = []

    logger.info("Loading yearly files (parquet/csv)…")
    frames.extend(load_yearly_csvs(logger))

    logger.info("Loading Agriculture_price_dataset.csv…")
    r = load_agri_price_dataset(logger)
    if r is not None:
        frames.append(r)

    logger.info("Loading crop_price_dataset.csv…")
    r = load_crop_price_dataset(logger)
    if r is not None:
        frames.append(r)

    logger.info("Loading individual crop CSVs…")
    frames.extend(load_individual_crop_csvs(logger))

    if not frames:
        raise RuntimeError(
            "No data loaded from any source.\n"
            f"  Yearly files  : {CSV_DIR}\n"
            f"  Bulk datasets : {DATA_DIR}\n"
            "  Check logs above for column mismatch details."
        )

    full_df = pd.concat(frames, ignore_index=True)
    before  = len(full_df)
    full_df.drop_duplicates(inplace=True)
    dupes = before - len(full_df)
    if dupes:
        logger.info(f"Removed {dupes:,} duplicate rows after merge")

    logger.info(f"\nTotal records loaded : {len(full_df):,}")
    logger.info(f"Crops found          : {full_df['Commodity'].unique().tolist()}")
    return full_df


# ── Outlier Removal ───────────────────────────────────────────────────────────
def remove_outliers(df: pd.DataFrame, col: str = 'y',
                    factor: float = 3.0) -> tuple[pd.DataFrame, int]:
    q1  = df[col].quantile(0.01)
    q3  = df[col].quantile(0.99)
    iqr = q3 - q1
    before = len(df)
    df = df[(df[col] >= q1 - factor * iqr) & (df[col] <= q3 + factor * iqr)]
    return df, before - len(df)


# ── Single Crop Training ──────────────────────────────────────────────────────
def train_single_crop(crop: str, full_df: pd.DataFrame,
                      holidays: pd.DataFrame, run_cv: bool = False) -> dict:
    logger = logging.getLogger('price_train')
    result = {'crop': crop, 'status': 'failed', 'metrics': {}}

    try:
        crop_df = (
            full_df[full_df['Commodity'] == crop][['Arrival_Date', 'Modal_Price']]
            .copy()
            .rename(columns={'Arrival_Date': 'ds', 'Modal_Price': 'y'})
        )

        crop_df['ds'] = pd.to_datetime(crop_df['ds'], dayfirst=True, errors='coerce')
        crop_df['y']  = pd.to_numeric(crop_df['y'], errors='coerce')
        crop_df.dropna(inplace=True)

        crop_df = crop_df.groupby('ds')['y'].median().reset_index()
        crop_df.sort_values('ds', inplace=True)

        crop_df, n_removed = remove_outliers(crop_df)
        if n_removed:
            logger.info(f"[{crop}] Removed {n_removed} outlier days")

        if len(crop_df) < MIN_ROWS:
            logger.warning(f"[{crop}] Skipping — only {len(crop_df)} rows (min={MIN_ROWS})")
            result['status'] = 'skipped'
            return result

        # log1p transform — routes/price.py MUST use np.expm1() to invert
        crop_df['y'] = np.log1p(crop_df['y'])

        logger.info(
            f"[{crop}] Training Prophet | {len(crop_df):,} daily points | "
            f"{crop_df['ds'].min().date()} → {crop_df['ds'].max().date()}"
        )

        m = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            changepoint_prior_scale=0.1,
            seasonality_prior_scale=10,
            holidays_prior_scale=10,
            holidays=holidays,
            interval_width=0.90,
        )
        m.add_seasonality(name='kharif_rabi', period=182.5, fourier_order=5)
        m.fit(crop_df)

        metrics_dict = {}
        if run_cv and len(crop_df) >= 365:
            logger.info(f"[{crop}] Running cross-validation…")
            try:
                df_cv = cross_validation(
                    m, initial='730 days', period='90 days',
                    horizon='90 days', parallel=None
                )
                perf = performance_metrics(df_cv)
                metrics_dict = {
                    'mape': round(float(perf['mape'].mean()), 4),
                    'rmse': round(float(perf['rmse'].mean()), 2),
                    'mae':  round(float(perf['mae'].mean()),  2),
                }
                logger.info(
                    f"[{crop}] CV → MAPE={metrics_dict['mape']:.2%}  "
                    f"RMSE={metrics_dict['rmse']:.0f}"
                )
            except Exception as e:
                logger.warning(f"[{crop}] CV failed: {e}")

        model_path = os.path.join(MODELS_DIR, f'prophet_{crop}.pkl')
        joblib.dump(m, model_path, compress=3)
        logger.info(f"[{crop}] ✅ Saved → {model_path}")

        result.update({
            'status':     'success',
            'rows':       len(crop_df),
            'date_range': f"{crop_df['ds'].min().date()} → {crop_df['ds'].max().date()}",
            'metrics':    metrics_dict
        })

    except Exception as e:
        logger.error(f"[{crop}] Unexpected error: {e}", exc_info=True)

    return result


# ── Main ──────────────────────────────────────────────────────────────────────
def main(args):
    logger = setup_logger('price_train')
    logger.info("=== AgriSense | Price Model Training Started ===")

    full_df  = load_all_data(logger)
    holidays = get_indian_holidays()

    crops_to_train = args.crops if args.crops else CROPS
    results        = []

    if args.parallel and len(crops_to_train) > 1:
        logger.info(f"Parallel training on {len(crops_to_train)} crops…")
        with ProcessPoolExecutor(max_workers=min(4, len(crops_to_train))) as ex:
            futures = {
                ex.submit(train_single_crop, crop, full_df, holidays, args.cv): crop
                for crop in crops_to_train
            }
            for fut in as_completed(futures):
                results.append(fut.result())
    else:
        for crop in crops_to_train:
            results.append(train_single_crop(crop, full_df, holidays, args.cv))

    report = {
        'trained_at': datetime.now(timezone.utc).isoformat(),   # ← FIXED
        'crops':      results
    }
    report_path = os.path.join(REPORTS_DIR, 'price_model_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    successes = sum(1 for r in results if r['status'] == 'success')
    logger.info(f"\n🎉 Done! {successes}/{len(crops_to_train)} crops trained successfully")
    logger.info(f"Report → {report_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train AgriSense Prophet Price Models')
    parser.add_argument('--crops',    nargs='+', help='Specific crops (default: all)')
    parser.add_argument('--cv',       action='store_true', help='Run Prophet cross-validation')
    parser.add_argument('--parallel', action='store_true', help='Parallel crop training')
    main(parser.parse_args())
