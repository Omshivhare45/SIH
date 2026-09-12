/**
 * RailBuddy ML API client.
 *
 * Thin, typed wrapper around the existing FastAPI prediction backend
 * (ml/api/main.py). Nothing here re-implements the ML pipeline — it only
 * sends the exact request schema the backend already accepts and returns
 * the exact response schema it already produces.
 */

export interface PredictRequest {
  train_number: string;
  station_code: string;
  station_index?: number;
  journey_date?: string;
  delay_current_minutes: number;
  current_speed_kmh: number;
  distance_covered_km?: number;
  target?: string;
}

export interface PredictionResponse {
  predicted_delay_minutes: number;
  predicted_eta: string;
  confidence: number;
  model_used: string;
  target_station: string;
  scheduled_arrival: string;
  data_source: string;
}

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_ML_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorDetail(body: unknown, status: number): string {
  if (isObject(body)) {
    const detail = body.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0 && isObject(detail[0])) {
      const msg = detail[0].msg;
      if (typeof msg === 'string') return msg;
    }
  }
  return `Request failed with HTTP ${status}`;
}

export async function predictDelay(
  request: PredictRequest,
  signal?: AbortSignal,
): Promise<PredictionResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON error body — fall through to generic message */
    }
    throw new Error(extractErrorDetail(body, res.status));
  }

  const data: unknown = await res.json();
  return data as PredictionResponse;
}

export async function fetchApiHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/health`, { signal });
    return res.ok;
  } catch {
    return false;
  }
}