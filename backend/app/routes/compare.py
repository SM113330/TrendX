from fastapi import APIRouter, HTTPException
from app.services.mock_data import TRENDS

router = APIRouter(prefix="/api", tags=["compare"])


def find_trend(slug: str):
    for trend in TRENDS:
        if trend.slug == slug:
            return trend

    raise HTTPException(status_code=404, detail=f"Trend not found: {slug}")


@router.get("/compare/{left_slug}/{right_slug}")
def compare_trends(left_slug: str, right_slug: str):
    left = find_trend(left_slug)
    right = find_trend(right_slug)

    left_points = 0
    right_points = 0

    for metric in ["score", "velocity", "sentiment", "engagement"]:
        if getattr(left, metric) > getattr(right, metric):
            left_points += 1
        elif getattr(right, metric) > getattr(left, metric):
            right_points += 1

    if left_points > right_points:
        winner = left.slug
    elif right_points > left_points:
        winner = right.slug
    else:
        winner = "tie"

    return {
        "left": left,
        "right": right,
        "winner": winner,
        "summary": {
            "left_points": left_points,
            "right_points": right_points,
        },
    }