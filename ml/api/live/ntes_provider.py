"""
NTES live-train provider for RailBuddy.

Thin wrapper around the DOCUMENTED public methods of the open-source
`ntes-client` package (version 0.1.3):

    NTESClient.search()        - train search by name/number
    NTESClient.train_info()    - train info incl. recent running instances
    NTESClient.schedule()      - timetable, valid journey dates, stations
    NTESClient.live_status()   - real-time running status (requires journey date)

This is intentionally a MINIMAL debug provider: it returns the raw NTES
payloads untouched so the live feed can be inspected before any
normalization / ML / frontend integration is layered on top.
"""

from __future__ import annotations

import datetime
import threading
import time
from typing import Any, Callable, Optional

from ntes import NTESClient, NTESError, NTESCryptoError

_DATE_FMT = "%d-%b-%Y"  # NTES journey-date format, e.g. 12-Sep-2026

_CACHE_TTL_SECONDS = 60
_cache_lock = threading.Lock()
_cache: dict[str, tuple[float, dict[str, Any]]] = {}


def _cache_get(key: str) -> Optional[dict[str, Any]]:
    with _cache_lock:
        hit = _cache.get(key)
        if hit and time.monotonic() - hit[0] < _CACHE_TTL_SECONDS:
            return hit[1]
    return None


def _cache_put(key: str, payload: dict[str, Any]) -> None:
    with _cache_lock:
        _cache[key] = (time.monotonic(), payload)


def _parse_date(s: str) -> Optional[datetime.date]:
    try:
        return datetime.datetime.strptime(s, _DATE_FMT).date()
    except (ValueError, TypeError):
        return None


def _resolve_journey_date(
    schedule: Optional[dict[str, Any]], requested: Optional[str]
) -> tuple[str, str]:
    """
    Resolve the journey date for live_status() from valid running dates.

    Returns (journey_date, detail):
      - requested/today when it is a valid run day
      - otherwise the most recent valid past run day
      - otherwise the earliest valid run day
      - otherwise today (fallback when the schedule payload has no date list)
    """
    requested_d = _parse_date(requested) if requested else datetime.date.today()
    if requested_d is None:
        requested_d = datetime.date.today()

    valid = [
        d
        for d in (_parse_date(v) for v in (schedule or {}).get("vStartDateList") or [])
        if d is not None
    ]
    fmt = requested_d.strftime(_DATE_FMT)

    if valid:
        if requested_d in valid:
            return fmt, f"{fmt} is a valid run day"
        past = [d for d in valid if d <= requested_d]
        if past:
            chosen = max(past)
            return chosen.strftime(_DATE_FMT), (
                f"{fmt} not in valid run days; using latest valid past day "
                f"{chosen.strftime(_DATE_FMT)}"
            )
        chosen = min(valid)
        return chosen.strftime(_DATE_FMT), (
            f"no valid run day on/before {fmt}; using earliest valid day "
            f"{chosen.strftime(_DATE_FMT)}"
        )

    return fmt, f"no valid run dates in schedule payload; defaulting to {fmt}"


def fetch_debug_payload(train_number: str, journey_date: Optional[str] = None) -> dict[str, Any]:
    """
    Fetch raw NTES real data for a train and return a debug-friendly payload.

    Shape:
        {
          "success": True,
          "data_source": "ntes",
          "train_number": "22436",
          "journey_date_used": "12-Sep-2026",
          "search": {...raw NTES...},
          "train_info": {...raw NTES...},
          "schedule": {...raw NTES...},
          "live_status": {...raw NTES...},
          "pipeline": [
            {"step": "search", "success": True,  "detail": "matched 1 train(s)"},
            {"step": "train_info", ...},
            {"step": "schedule", ...},
            {"step": "journey_date", ...},
            {"step": "live_status", ...}
          ]
        }

    The `pipeline` array records per-step provenance: which NTES call succeeded
    or failed and why, so callers can pinpoint the failing stage. The schedule
    is fetched exactly once and reused for journey-date resolution.
    """
    key = f"{train_number}|{journey_date or ''}"
    cached = _cache_get(key)
    if cached is not None:
        return cached

    client = NTESClient(timeout=20, retries=1)
    payload: dict[str, Any] = {
        "success": True,
        "data_source": "ntes",
        "train_number": str(train_number),
    }
    pipeline: list[dict[str, Any]] = []
    train_no = str(train_number)

    def run_step(
        step: str,
        report: Callable[[Any], tuple[str, bool]],
        call: Callable[[], Any],
    ) -> Any:
        try:
            result = call()
        except (NTESError, NTESCryptoError, Exception) as exc:  # noqa: BLE001
            payload[step] = None
            msg = f"{type(exc).__name__}: {exc}"
            pipeline.append({"step": step, "success": False, "detail": msg})
            payload["success"] = False
            payload["error"] = f"{step}() raised {msg}"
            return None
        detail, ok = report(result)
        payload[step] = result
        pipeline.append({"step": step, "success": ok, "detail": detail})
        if not ok:
            payload["success"] = False
            payload["error"] = f"{step}: {detail}"
        return result

    run_step(
        "search",
        lambda r: (
            f"matched {len(r.get('Trains') or [])} train(s)",
            bool(r.get("Trains")),
        ),
        lambda: client.search(train_no),
    )

    run_step(
        "train_info",
        lambda r: (
            f"{r.get('TrainName') or r.get('trainName') or 'train info loaded'} "
            f"({r.get('TrainNumber') or train_no})",
            True,
        ),
        lambda: client.train_info(train_no),
    )

    schedule_res = run_step(
        "schedule",
        lambda r: (
            f"{len(r.get('stations') or [])} schedule stations; "
            f"{len(r.get('vStartDateList') or [])} valid run date(s)",
            bool(r),
        ),
        lambda: client.schedule(train_no),
    )

    journey, journey_detail = _resolve_journey_date(schedule_res, journey_date)
    payload["journey_date_used"] = journey
    pipeline.append({"step": "journey_date", "success": True, "detail": journey_detail})

    run_step(
        "live_status",
        lambda r: (
            f"{len(r.get('STNS') or [])} stops; last event "
            f"{(r.get('LTIME') or '').strip() or 'n/a'}",
            bool(r),
        ),
        lambda: client.live_status(train_no, journey),
    )

    payload["pipeline"] = pipeline
    _cache_put(key, payload)
    return payload