"""
Inference helpers: load saved artifacts and produce a prediction.

Exposed for both the API (ml/api) and one-off scripts:
    predict_delay(feature_row: dict) -> dict
    expected_eta(scheduled_arrival, delay)   -> "HH:MM" / "THH:MM AM/PM"
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta

import joblib
import numpy as np
import pandas as pd

from ml import config as cfg


class ModelBundle:
    """Lazily-loaded fitted models + preprocessor + metadata."""

    def __init__(self):
        self._fitted: dict[str, any] | None = None
        self._pre = None
        self._meta: dict | None = None
        self._weights: dict[str, float] | None = None
        self._best: str | None = None

    @property
    def loaded(self) -> bool:
        return self._fitted is not None

    def load(self) -> None:
        if self.loaded:
            return
        if not cfg.MODEL_META_FILE.exists():
            raise FileNotFoundError(
                "No trained models found. Run  python -m ml.train  first."
            )
        self._meta = json.loads(cfg.MODEL_META_FILE.read_text(encoding="utf-8"))
        self._pre = joblib.load(cfg.PREPROCESSOR_FILE)
        self._best = self._meta["best_model"]
        self._weights = self._meta["ensemble"]["weights"]
        self._fitted = {}
        for name, path in cfg.MODEL_FILES.items():
            if path.exists():
                self._fitted[name] = joblib.load(path)

    def predict(self, X: pd.DataFrame) -> tuple[np.ndarray, str, float]:
        """Returns (delay_prediction_array, model_used, confidence)."""
        self.load()
        preds = []
        for name, w in self._weights.items():
            if name in self._fitted:
                preds.append(w * self._fitted[name].predict(X))
        if preds:
            delay = sum(preds)
            model_used = f"Ensemble[{','.join(self._weights)}]"
        else:
            delay = self._fitted[self._best].predict(X)
            model_used = self._best

        # Confidence from best single model's test MAE, clipped to [0,1].
        best_mae = self._meta["test_metrics"][self._best]["mae"]
        confidence = float(np.clip(1.0 - best_mae / cfg.CONFIDENCE_SCALE_MINUTES, 0.0, 1.0))
        return np.asarray(delay), model_used, confidence


_bundle = ModelBundle()


def get_bundle() -> ModelBundle:
    return _bundle


def build_feature_row(
    *,
    train_number: str,
    station_index: int,
    total_stops: int,
    distance_km: float,
    total_distance_km: float,
    distance_to_next_km: float,
    scheduled_departure_hour: float,
    scheduled_arrival_minutes: float,
    journey_date: str | None = None,
    delay_current_minutes: float = 0.0,
    current_speed_kmh: float = 90.0,
    train_type: str = "Express",
    season: str = "summer",
    cumulative_halt_minutes: float = 0.0,
    halt_minutes: float = 0.0,
    day_of_week: int | None = None,
    is_weekend: int | None = None,
    month: int | None = None,
) -> dict:
    """Builds a single feature row the model can consume."""
    d = datetime.now()
    dow = day_of_week if day_of_week is not None else d.weekday()
    mon = month if month is not None else d.month
    return {
        **{c: None for c in cfg.NUMERIC_FEATURES},
        **{c: "NA" for c in cfg.CATEGORICAL_FEATURES},
        "train_number": str(train_number),
        "train_type": train_type,
        "season": season,
        "day_of_week": dow,
        "is_weekend": 1 if dow >= 5 else 0 if is_weekend is None else is_weekend,
        "month": mon,
        "scheduled_departure_hour": scheduled_departure_hour,
        "scheduled_arrival_minutes": scheduled_arrival_minutes,
        "distance_km": distance_km,
        "total_distance_km": total_distance_km,
        "remaining_distance_km": max(0.0, total_distance_km - distance_km),
        "distance_to_next_km": distance_to_next_km,
        "progress_ratio": distance_km / max(1e-6, total_distance_km),
        "station_index": station_index,
        "total_stops": total_stops,
        "stops_remaining": max(0, total_stops - 1 - station_index),
        "cumulative_halt_minutes": cumulative_halt_minutes,
        "halt_minutes": halt_minutes,
        "delay_current_minutes": delay_current_minutes,
        "current_speed_kmh": current_speed_kmh,
        "train_hist_avg": None,
        "train_station_hist_avg": None,
    }


def predict_from_row(row: dict) -> dict:
    """Predict delay for a single feature row. Returns API-style payload."""
    bundle = get_bundle()
    X = pd.DataFrame([row])[cfg.NUMERIC_FEATURES + cfg.CATEGORICAL_FEATURES]
    delay_arr, model_used, confidence = bundle.predict(X)
    delay = float(max(0.0, delay_arr[0]))
    return {
        "predicted_delay_minutes": round(delay, 1),
        "model_used": model_used,
        "confidence": round(confidence, 3),
        "delay_uncalibrated": round(delay_arr[0], 1),
    }


def expected_eta(scheduled_time: str, delay_minutes: float) -> str:
    """
    scheduled_time may be "HH:MM AM/PM", "HH:MM", or 'X day HH:MM'.
    Returns ETA as a wall-clock string with day rollover noted.
    """
    s = str(scheduled_time).strip()
    base = s
    if "day" in s.lower():
        parts = s.lower().split()
        base = parts[-1] if len(parts) >= 2 else s
    try:
        t = datetime.strptime(base.strip().upper(), "%I:%M %p")
    except ValueError:
        try:
            t = datetime.strptime(base.strip(), "%H:%M")
        except ValueError:
            return scheduled_time
    eta = t + timedelta(minutes=delay_minutes)
    return eta.strftime("%I:%M %p")