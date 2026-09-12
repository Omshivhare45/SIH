"""RailBuddy live-train data package (NTES real-time feed)."""

from .ntes_provider import fetch_debug_payload

__all__ = ["fetch_debug_payload"]