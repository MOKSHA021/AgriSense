"""
train_crop.py  –  Production-grade crop recommendation model trainer
AgriSense | RandomForest + sklearn Pipeline + StratifiedKFold + RandomizedSearchCV
"""

import os
import json
import logging
import argparse
from datetime import datetime, timezone
from typing import Tuple

import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, RandomizedSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, f1_score
)
from scipy.stats import randint

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH   = os.path.join(BASE_DIR, 'data', 'Crop_recommendation.csv')
MODELS_DIR  = os.path.join(BASE_DIR, 'models')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
FEATURES    = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
TARGET      = 'label'
SEED        = 42

os.makedirs(MODELS_DIR,  exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


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


# ── Data Loading & Validation ─────────────────────────────────────────────────
def load_and_validate(path: str, logger: logging.Logger) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_csv(path)
    logger.info(f"Loaded dataset: {df.shape[0]} rows × {df.shape[1]} cols")

    null_counts = df.isnull().sum()
    if null_counts.any():
        logger.warning(f"Null values found:\n{null_counts[null_counts > 0]}")
        df.dropna(inplace=True)
        logger.info(f"After dropping nulls: {df.shape[0]} rows")

    dupes = df.duplicated().sum()
    if dupes:
        logger.warning(f"Removing {dupes} duplicate rows")
        df.drop_duplicates(inplace=True)

    removed = 0
    for col in FEATURES:
        q1, q3 = df[col].quantile(0.01), df[col].quantile(0.99)
        iqr     = q3 - q1
        mask    = (df[col] >= q1 - 3 * iqr) & (df[col] <= q3 + 3 * iqr)
        removed += (~mask).sum()
        df       = df[mask]
    if removed:
        logger.warning(f"Removed {removed} extreme outlier rows across features")

    dist = df[TARGET].value_counts()
    logger.info(f"Class distribution (min={dist.min()}, max={dist.max()}, "
                f"classes={len(dist)}):\n{dist.to_string()}")

    return df


# ── Hyperparameter Tuning ─────────────────────────────────────────────────────
def tune_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    logger:  logging.Logger,
    n_iter:  int = 30
) -> Pipeline:

    param_dist = {
        'clf__n_estimators':      randint(100, 500),
        'clf__max_depth':         [None, 10, 20, 30],
        'clf__min_samples_split': randint(2, 15),
        'clf__min_samples_leaf':  randint(1, 8),
        'clf__max_features':      ['sqrt', 'log2', None],
        'clf__class_weight':      ['balanced', None],
    }

    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', RandomForestClassifier(random_state=SEED, oob_score=True, n_jobs=-1))
    ])

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    search = RandomizedSearchCV(
        pipe,
        param_distributions=param_dist,
        n_iter=n_iter,
        cv=cv,
        scoring='f1_weighted',
        n_jobs=-1,
        random_state=SEED,
        verbose=1,
        refit=True
    )
    search.fit(X_train, y_train)
    logger.info(f"Best CV f1_weighted: {search.best_score_:.4f}")
    logger.info(f"Best params: {search.best_params_}")
    return search.best_estimator_


# ── Evaluation ────────────────────────────────────────────────────────────────
def evaluate(
    pipeline,
    X_test:  np.ndarray,
    y_test:  np.ndarray,
    le:      LabelEncoder,
    logger:  logging.Logger
) -> dict:

    y_pred = pipeline.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    f1     = f1_score(y_test, y_pred, average='weighted')
    report = classification_report(y_test, y_pred,
                                   target_names=le.classes_, output_dict=True)
    cm     = confusion_matrix(y_test, y_pred).tolist()

    logger.info(f"Test Accuracy : {acc*100:.2f}%")
    logger.info(f"Weighted F1   : {f1:.4f}")
    logger.info(f"\n{classification_report(y_test, y_pred, target_names=le.classes_)}")

    clf = pipeline.named_steps['clf']
    importances = dict(zip(
        FEATURES,
        [round(float(i), 5) for i in clf.feature_importances_]
    ))
    logger.info(f"Feature importances: {importances}")

    return {
        'accuracy':              round(acc, 4),
        'f1_weighted':           round(f1, 4),
        'oob_score':             round(clf.oob_score_, 4) if clf.oob_score else None,
        'classification_report': report,
        'confusion_matrix':      cm,
        'feature_importances':   importances
    }


# ── Main ──────────────────────────────────────────────────────────────────────
def main(args):
    logger = setup_logger('crop_train')
    logger.info("=== AgriSense | Crop Model Training Started ===")

    df    = load_and_validate(DATA_PATH, logger)
    X     = df[FEATURES].values
    y     = df[TARGET].values
    le    = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, stratify=y_enc, random_state=SEED
    )
    logger.info(f"Train: {len(X_train)} | Test: {len(X_test)}")

    if args.tune:
        logger.info(f"Running RandomizedSearchCV (n_iter={args.n_iter})…")
        pipeline = tune_model(X_train, y_train, logger, n_iter=args.n_iter)
    else:
        logger.info("Training with default params (use --tune to run search)…")
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', RandomForestClassifier(
                n_estimators=300,
                max_features='sqrt',
                class_weight='balanced',
                oob_score=True,
                random_state=SEED,
                n_jobs=-1
            ))
        ])
        pipeline.fit(X_train, y_train)

    metrics = evaluate(pipeline, X_test, y_test, le, logger)

    model_path   = os.path.join(MODELS_DIR,  'crop_model.pkl')
    encoder_path = os.path.join(MODELS_DIR,  'label_encoder.pkl')
    report_path  = os.path.join(REPORTS_DIR, 'crop_model_report.json')

    joblib.dump(pipeline, model_path,   compress=3)
    joblib.dump(le,       encoder_path, compress=3)

    metadata = {
        'trained_at': datetime.now(timezone.utc).isoformat(),   # ← FIXED
        'model':      'RandomForestClassifier',
        'features':   FEATURES,
        'n_classes':  len(le.classes_),
        'classes':    list(le.classes_),
        'train_rows': len(X_train),
        'test_rows':  len(X_test),
        **metrics
    }
    with open(report_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model saved   → {model_path}")
    logger.info(f"Encoder saved → {encoder_path}")
    logger.info(f"Report saved  → {report_path}")
    logger.info("=== Training Complete ===")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train AgriSense Crop Recommendation Model')
    parser.add_argument('--tune',   action='store_true', help='Run RandomizedSearchCV')
    parser.add_argument('--n_iter', type=int, default=30, help='Search iterations (default=30)')
    main(parser.parse_args())
