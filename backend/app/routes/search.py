from fastapi import APIRouter
from app.services.mock_data import TRENDS

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search")
def search_trends(q: str = ""):
    query = q.lower().strip()

    if not query:
        return []

    results = [
        {
            "title": trend.title,
            "slug": trend.slug,
            "category": trend.category,
            "score": trend.score,
            "direction": trend.direction,
        }
        for trend in TRENDS
        if query in trend.title.lower()
        or query in trend.category.lower()
        or query in trend.slug.lower()
    ]

    return results