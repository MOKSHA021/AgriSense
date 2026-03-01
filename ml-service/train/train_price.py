import os
import pandas as pd
import joblib
from prophet import Prophet
import warnings
warnings.filterwarnings('ignore')

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARQUET_DIR = os.path.join(BASE_DIR, 'data', 'parquet')
MODELS_DIR  = os.path.join(BASE_DIR, 'models')

CROPS = ['Wheat', 'Rice', 'Maize', 'Mustard', 'Tomato', 'Potato', 'Onion']
YEARS = range(2015, 2027)  # 10 years of data

print("Loading 10 years of All-India parquet data...")
frames = []
for year in YEARS:
    path = os.path.join(PARQUET_DIR, f'{year}.parquet')
    if not os.path.exists(path):
        continue
    df = pd.read_parquet(path, engine='pyarrow',
                         columns=['Commodity', 'Arrival_Date', 'Modal_Price'])
    df = df[df['Commodity'].isin(CROPS)]
    frames.append(df)
    print(f"  ✅ Loaded {year}")

full_df = pd.concat(frames, ignore_index=True)
print(f"\nTotal records loaded: {len(full_df):,}")
print(f"Crops found: {full_df['Commodity'].unique()}")

for crop in CROPS:
    crop_df = full_df[full_df['Commodity'] == crop][['Arrival_Date', 'Modal_Price']].copy()
    crop_df.rename(columns={'Arrival_Date': 'ds', 'Modal_Price': 'y'}, inplace=True)
    crop_df['ds'] = pd.to_datetime(crop_df['ds'], dayfirst=True, errors='coerce')
    crop_df['y']  = pd.to_numeric(crop_df['y'], errors='coerce')
    crop_df.dropna(inplace=True)

    # Aggregate all markets → single daily average price
    crop_df = crop_df.groupby('ds')['y'].mean().reset_index()
    crop_df.sort_values('ds', inplace=True)

    if len(crop_df) < 30:
        print(f"⚠️  Skipping {crop} — only {len(crop_df)} rows")
        continue

    print(f"\nTraining Prophet for {crop} ({len(crop_df):,} daily points | "
          f"{crop_df['ds'].min().date()} → {crop_df['ds'].max().date()})...")

    m = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode='multiplicative',  # better for price data with growth
        changepoint_prior_scale=0.05        # controls trend flexibility
    )
    m.fit(crop_df)
    joblib.dump(m, os.path.join(MODELS_DIR, f'prophet_{crop}.pkl'))
    print(f"✅ Saved prophet_{crop}.pkl")

print("\n🎉 All production price models trained!")
