from pydantic import BaseModel
from typing import List


class PlatformPower(BaseModel):
    name: str
    value: int


class AmplifiedTrend(BaseModel):
    title: str
    slug: str


class Creator(BaseModel):
    id: int
    name: str
    slug: str
    handle: str
    reach: str
    creator_score: int
    amplification: int
    momentum: List[int]
    platforms: List[PlatformPower]
    amplified_trends: List[AmplifiedTrend]