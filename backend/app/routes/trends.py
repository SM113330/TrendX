from fastapi import APIRouter, HTTPException
from app.services.trend_service import get_all_trends, get_trend_by_slug

router = APIRouter(prefix="/api", tags=["trends"])


@router.get("/trends")
def get_trends():
    return get_all_trends()


@router.get("/trend/{slug}")
def get_trend(slug: str):
    trend = get_trend_by_slug(slug)

    if trend:
        return trend

    raise HTTPException(status_code=404, detail="Trend not found")