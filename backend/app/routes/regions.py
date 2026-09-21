from fastapi import APIRouter, HTTPException
from app.services.mock_data import REGIONS

router = APIRouter(prefix="/api", tags=["regions"])


@router.get("/regions")
def get_regions():
    return REGIONS


@router.get("/region/{slug}")
def get_region(slug: str):
    for region in REGIONS:
        if region.slug == slug:
            return region

    raise HTTPException(status_code=404, detail="Region not found")