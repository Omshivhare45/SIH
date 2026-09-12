"""
Central configuration for the RailBuddy ML pipeline.

Paths are resolved relative to the `ml/` directory so scripts can run
from anywhere inside the repository.
"""

from __future__ import annotations

from pathlib import Path

# Root of the ML module (directory containing this file)
ML_ROOT = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Data locations
# ---------------------------------------------------------------------------
DATA_DIR = ML_ROOT / "data"
REAL_DATA_DIR = DATA_DIR / "real"          # <-- drop a real dataset here (see data/real/README.md)
REAL_DATA_FILE = REAL_DATA_DIR / "train_delays.csv"
CATALOG_FILE = DATA_DIR / "catalog.json"   # real route/schedule catalog extracted from src/data/trainData.ts

SYNTHETIC_DIR = DATA_DIR / "synthetic"
SYNTHETIC_FILE = SYNTHETIC_DIR / "train_delays_synthetic.csv"

# ---------------------------------------------------------------------------
# Feature engineering knobs
# ---------------------------------------------------------------------------
CATEGORICAL_FEATURES = [
    "train_number",
    "train_type",
    "season",
]
NUMERIC_FEATURES = [
    "day_of_week",
    "is_weekend",
    "month",
    "scheduled_departure_hour",
    "scheduled_arrival_minutes",
    "distance_km",
    "total_distance_km",
    "remaining_distance_km",
    "distance_to_next_km",
    "progress_ratio",
    "station_index",
    "total_stops",
    "stops_remaining",
    "cumulative_halt_minutes",
    "halt_minutes",
    "delay_current_minutes",
    "current_speed_kmh",
    "train_hist_avg",
    "train_station_hist_avg",
]
TARGET = "delay_next_minutes"

# ---------------------------------------------------------------------------
# Training knobs
# ---------------------------------------------------------------------------
TEST_FRACTION = 0.25           # held-out test split (temporal: latest journeys)
VAL_FRACTION = 0.15            # validation split used for model selection
RANDOM_STATE = 42
N_JOBS = -1

# Confidence calibration: confidence = clip(1 - abs_error / SCALE, 0, 1)
CONFIDENCE_SCALE_MINUTES = 30.0

# ---------------------------------------------------------------------------
# Artifacts
# ---------------------------------------------------------------------------
ARTIFACTS_DIR = ML_ROOT / "artifacts"
MODEL_META_FILE = ARTIFACTS_DIR / "model_meta.json"
ENSEMBLE_FILE = ARTIFACTS_DIR / "ensemble.joblib"
PREPROCESSOR_FILE = ARTIFACTS_DIR / "preprocessor.joblib"
FEATURE_COLUMNS_FILE = ARTIFACTS_DIR / "feature_columns.json"
TRAIN_HISTORY_FILE = ARTIFACTS_DIR / "train_history.json"

# Nominal files for the 5 trained regressors (4 requested + GradientBoosting bonus)
MODEL_FILES = {
    "RandomForest": ARTIFACTS_DIR / "rf.joblib",
    "XGBoost": ARTIFACTS_DIR / "xgb.joblib",
    "LightGBM": ARTIFACTS_DIR / "lgbm.joblib",
    "ExtraTrees": ARTIFACTS_DIR / "et.joblib",
    "GradientBoosting": ARTIFACTS_DIR / "gb.joblib",
}

# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------
API_HOST = "127.0.0.1"
API_PORT = 8000


def ensure_dirs() -> None:
    for d in (REAL_DATA_DIR, SYNTHETIC_DIR, ARTIFACTS_DIR):
        d.mkdir(parents=True, exist_ok=True)