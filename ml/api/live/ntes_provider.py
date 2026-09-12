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
from typing import Any, Optional

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


def _resolve_journey_date(client: NTESClient, train_no: str, requested: Optional[str]) -> str:
    """Today's date if the train runs today, else the most recent valid run day."""
    requested_d = _parse_date(requested) if requested else datetime.date.today()
    if requested_d is None:
        requested_d = datetime.date.today()

    try:
        sched = client.schedule(train_no, "")
        valid = [_parse_date(d) for d in (sched.get("vStartDateList") or [])]
        valid = [d for d in valid if d is not None]
        if requested_d in valid:
            return requested_d.strftime(_DATE_FMT)
        past = [d for d in valid if d <= requested_d]
        if past:
            return max(past).strftime(_DATE_FMT)
        if valid:
            return min(valid).strftime(_DATE_FMT)
    except (NTESError, NTESCryptoError):
        pass
    return requested_d.strftime(_DATE_FMT)


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
          "live_status": {...raw NTES...}
        }

    On failure the fetched fields are preserved and `success` is False with the
    real exception message in `error`.
    """
    key = f"{train_number}|{journey_date or ''}"
    cached = _cache_get(key)
    if cached is not None:
        return cached

    client = NTESClient(timeout=20, retries=1)
    journey = _resolve_journey_date(client, train_number, journey_date)

    payload: dict[str, Any] = {
        "success": True,
        "data_source": "ntes",
        "train_number": str(train_number),
        "journey_date_used": journey,
    }

    for label, call in (
        ("search", lambda: client.search(str(train_number))),
        ("train_info", lambda: client.train_info(str(train_number))),
        ("schedule", lambda: client.schedule(str(train_number))),
        ("live_status", lambda: client.live_status(str(train_number), journey)),
    ):
        try:
            payload[label] = call()
        except (NTESError, NTESCryptoError, Exception) as exc:  # noqa: BLE001
            payload[label] = None
            payload["success"] = False
            payload["error"] = f"{label}() raised {type(exc).__name__}: {exc}"

    _cache_put(key, payload)
    return payload