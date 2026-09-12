"""Request/response models for the prediction API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    train_number: str = Field(..., description="Train number, e.g. 22436")
    station_code: str = Field(..., description="Current/boarded station code, e.g. CNB")
    station_index: int | None = Field(None, ge=0, description="Position of station on the route (0-based). Overrides station_code if provided.")
    journey_date: str | None = Field(None, description="ISO date of the journey, e.g. 2026-09-11")
    delay_current_minutes: float = Field(0.0, ge=0, description="Current delay in minutes at this station")
    current_speed_kmh: float = Field(90.0, ge=0, le=400, description="Observed running speed in km/h")
    distance_covered_km: float | None = Field(None, ge=0, description="Distance covered so far in km (else derived from route)")
    target: str | None = Field(None, description="Target station code for ETA (default: next scheduled station)")


class PredictionResponse(BaseModel):
    predicted_delay_minutes: float
    predicted_eta: str
    confidence: float
    model_used: str
    target_station: str
    scheduled_arrival: str
    data_source: str


class HealthResponse(BaseModel):
    status: str
    trained: bool
    best_model: str | None = None
    n_features: int | None = None