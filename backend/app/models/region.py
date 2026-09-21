from pydantic import BaseModel
from typing import List


class RegionCategory(BaseModel):
    name: str
    value: int


class RegionTrend(BaseModel):
    title: str
    slug: str


class RegionCreator(BaseModel):
    name: str
    slug: str
    score: int


class Region(BaseModel):
    id: int
    name: str
    slug: str
    score: int
    sentiment: int
    velocity: int
    categories: List[RegionCategory]
    top_trends: List[RegionTrend]
    creators: List[RegionCreator]
    momentum: List[int]