from fastapi import APIRouter, HTTPException
from app.services.mock_data import CREATORS

router = APIRouter(prefix="/api", tags=["creators"])


@router.get("/creators")
def get_creators():
    return CREATORS


@router.get("/creator/{slug}")
def get_creator(slug: str):
    for creator in CREATORS:
        if creator.slug == slug:
            return creator

    raise HTTPException(status_code=404, detail="Creator not found")