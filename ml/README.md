# RailBuddy ML — Train ETA & Delay Prediction

AI-powered real-time train arrival-delay prediction system for **Smart India Hackathon 2026**.

## Dataset

### Real data (preferred)

Place a CSV at `data/real/train_delays.csv` with these columns:

```
journey_id, train_number, station_code, station_index, scheduled_arrival, scheduled_departure,
delay_current_minutes, distance_km, total_distance_km, distance_to_next_km, current_speed_kmh,
scheduled_departure_hour, scheduled_arrival_minutes, progress_ratio, total_stops, stops_remaining,
cumulative_halt_minutes, halt_minutes, remaining_distance_km, delay_at_prev, day_of_week, is_weekend,
month, season, data_source
```

Rows must be temporal — sorted ascending by `journey_id` then `station_index`. The pipeline splits
by journey date: first 75% train, last 25% test.

### Synthetic demo data (labeled)

Without a real CSV the pipeline generates `data/synthetic/train_delays_synthetic.csv` from the
route catalog extracted from `src/data/trainData.ts`. Every synthetic row carries
`data_source=SYNTHETIC_DEMO`.

**Do not fabricate fake results and present them as real data.** The label is always clearly marked.

## Feature engineering

| Feature | Type | Description |
|---|---|---|
| `day_of_week` | numeric | 0 (Mon) – 6 (Sun) |
| `is_weekend` | numeric | 1 if Sat/Sun |
| `month` | numeric | 1–12 |
| `scheduled_departure_hour` | numeric | Departure time as decimal hour |
| `scheduled_arrival_minutes` | numeric | Scheduled arrival as minutes-of-day |
| `distance_km` | numeric | Distance from origin to current station |
| `total_distance_km` | numeric | Total route distance |
| `remaining_distance_km` | numeric | Remaining distance to last stop |
| `distance_to_next_km` | numeric | Distance to next scheduled stop |
| `progress_ratio` | numeric | distance_km / total_distance_km |
| `station_index` | numeric | 0-based stop index |
| `total_stops` | numeric | Number of stops on route |
| `stops_remaining` | numeric | Stops after current |
| `cumulative_halt_minutes` | numeric | Total halt minutes before current station |
| `halt_minutes` | numeric | Scheduled halt at current station |
| `delay_current_minutes` | numeric | Known delay at current station |
| `current_speed_kmh` | numeric | Reported speed at current station |
| `train_hist_avg` | numeric | Train's historical average delay (train-fold only) |
| `train_station_hist_avg` | numeric | Historical average delay at (train, station, season) |
| `train_number` | categorical | Train identifier |
| `train_type` | categorical | Vande Bharat / Shatabdi / Rajdhani / Express / Mail / SuperFast |
| `season` | categorical | winter / summer / monsoon / post_monsoon |

## Models

Five regressors trained and compared (4 requested + 1 bonus):

| Model | Test MAE | Test RMSE | Test R² |
|---|---|---|---|
| **GradientBoosting** ★ | **2.863** | **5.028** | **0.8353** |
| RandomForest | 2.944 | 5.123 | 0.8290 |
| LightGBM | 3.002 | 5.133 | 0.8283 |
| ExtraTrees | 3.080 | 5.281 | 0.8183 |
| XGBoost | 3.027 | 5.164 | 0.8262 |
| **Ensemble (top-3 weighted)** | **2.877** | **5.048** | **0.8340** |

★ Best model by validation MAE, used for single-model fallback.
Ensemble = inverse-MAE weighted average of top 3 models (GB + RF + LGBM).

**Confidence** = `clip(1 − best_model_test_MAE / 30, 0, 1)` ≈ 0.905.

## How to retrain

```bash
cd SIH
pip install -r ml/requirements.txt          # one-time

# Regenerate catalog from src/data/trainData.ts
node ml/scripts/extract_catalog.mjs

# Train (generates synthetic data if no real CSV present)
python -m ml.train
```

Artifacts are saved to `ml/artifacts/`.

## How to run backend / API

```bash
cd SIH
python -m ml.api.main          # → http://127.0.0.1:8000
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service status + model availability |
| GET | `/api/models` | Model comparison table from `model_meta.json` |
| POST | `/api/predict` | Predict delay + ETA |

### POST /api/predict — request

```json
{
  "train_number": "22436",
  "station_code": "CNB",
  "delay_current_minutes": 5,
  "current_speed_kmh": 95
}
```

Optional: `target` (station code ahead), `journey_date` (YYYY-MM-DD), `station_index`.

### Response

```json
{
  "predicted_delay_minutes": 5.2,
  "predicted_eta": "12:13 PM",
  "confidence": 0.905,
  "model_used": "Ensemble[GradientBoosting,RandomForest,LightGBM]",
  "target_station": "Prayagraj Junction (PRYJ)",
  "scheduled_arrival": "12:08 PM",
  "data_source": "SYNTHETIC_DEMO"
}
```

`predicted_eta` = scheduled arrival at target station + predicted delay.

## Files created/modified

```
ml/
├── __init__.py
├── config.py              # paths, features, constants
├── requirements.txt       # pandas, sklearn, xgboost, lightgbm, fastapi, uvicorn, joblib
├── synthetic_data.py      # synthetic demo data generator
├── data_loader.py         # load real or synthetic CSV, temporal split
├── features.py            # feature engineering + history lookups
├── train.py               # train all models, select best, ensemble, save artifacts
├── predict.py             # load artifacts, build feature row, predict
├── README.md              # this file
├── .gitignore             # ignore artifacts/, *.joblib, __pycache__/
├── data/
│   ├── catalog.json       # extracted from src/data/trainData.ts (15 trains, 37 stations)
│   ├── real/              # place train_delays.csv here
│   │   └── README.md      # expected schema
│   └── synthetic/
│       └── train_delays_synthetic.csv
├── scripts/
│   └── extract_catalog.mjs
├── artifacts/
│   ├── model_meta.json
│   ├── feature_columns.json
│   ├── train_history.json
│   ├── preprocessor.joblib
│   ├── ensemble.joblib
│   ├── rf.joblib
│   ├── xgb.joblib
│   ├── lgbm.joblib
│   ├── et.joblib
│   └── gb.joblib
└── api/
    ├── __init__.py
    ├── main.py            # FastAPI app
    └── schemas.py         # Pydantic request/response models
```

No existing frontend files were modified in the ML work.
