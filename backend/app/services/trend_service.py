from time import time
from app.services.mock_data import TRENDS
from app.services.google_trends_service import fetch_google_trends

CACHE_SECONDS = 300
_cached_trends = None
_cached_at = 0


def normalize_trend(trend):
    if isinstance(trend, dict):
        return trend

    return trend.model_dump()


def get_all_trends():
    global _cached_trends, _cached_at

    now = time()

    if _cached_trends and now - _cached_at < CACHE_SECONDS:
        return _cached_trends

    try:
        live_trends = fetch_google_trends()

        if live_trends:
            _cached_trends = live_trends
            _cached_at = now
            return _cached_trends

    except Exception as error:
        print("Live trend fetch failed. Using mock fallback:", error)

    _cached_trends = [normalize_trend(trend) for trend in TRENDS]
    _cached_at = now
    return _cached_trends


def get_trend_by_slug(slug: str):
    trends = get_all_trends()

    for trend in trends:
        trend_data = normalize_trend(trend)

        if trend_data.get("slug") == slug:
            return trend_data

    return None