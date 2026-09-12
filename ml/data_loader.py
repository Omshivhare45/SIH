"""
Data loading for the RailBuddy ML pipeline.

PREFERS a real dataset when present at `ml/data/real/train_delays.csv`, otherwise
falls back to the clearly-labelled SYNTHETIC demo dataset (generated on demand).

Expected schema for a REAL CSV (documented in ml/data/real/README.md):

    journey_date, train_number, train_type, season, day_of_week, is_weekend,
    month, station_code, station_index, total_stops, stops_remaining,
    distance_km, total_distance_km, remaining_distance_km, distance_to_next_km,
    progress_ratio, scheduled_departure_hour, scheduled_arrival_minutes,
    cumulative_halt_minutes, halt_minutes, delay_current_minutes,
    current_speed_kmh, delay_next_minutes   <-- target

Missing columns are tolerated where possible; required columns are listed in
REQUIRED_COLUMNS below.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from ml import config as cfg

REQUIRED_COLUMNS = [
    "journey_date",
    "train_number",
    "delay_current_minutes",
    "delay_next_minutes",
]


def ensure_available() -> Path:
    """Make sure a dataset exists (real preferred, else synthetic) and return its path."""
    if cfg.REAL_DATA_FILE.exists():
        return cfg.REAL_DATA_FILE
    cfg.ensure_dirs()
    if cfg.SYNTHETIC_FILE.exists():
        return cfg.SYNTHETIC_FILE
    from ml import synthetic_data

    return synthetic_data.synthesize()


def load_raw() -> tuple[pd.DataFrame, str]:
    """Load the raw dataset. Returns (df, source_label)."""
    path = ensure_available()
    df = pd.read_csv(path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"Dataset {path} is missing required columns: {missing}. "
            f"See ml/data/real/README.md for the expected schema."
        )
    df["journey_date"] = df["journey_date"].astype(str)
    df = df.sort_values("journey_date").reset_index(drop=True)
    source = "REAL" if cfg.REAL_DATA_FILE.exists() else str(df["data_source"].iloc[0]) if "data_source" in df.columns else "REAL"
    print(f"[load] dataset: {path}  (source: {source}, rows: {len(df)})")
    return df, source


def temporal_split(df: pd.DataFrame):
    """
    Split chronologically so the model is tested on data from after the training
    period (realistic time-series behaviour).

    Returns (train_idx_mask, test_idx_mask) boolean Series aligned to `df`.
    """
    dates = df["journey_date"].astype(str)
    n = len(df)
    test_start_row = int(n * (1 - cfg.TEST_FRACTION))
    # boundary by date so the same journey_date never straddles train/test
    boundary = dates.iloc[test_start_row]
    train_mask = dates < boundary
    test_mask = dates >= boundary
    if train_mask.sum() == 0 or test_mask.sum() == 0:
        raise RuntimeError("Temporal split produced empty partition; dataset too small.")
    return train_mask, test_mask