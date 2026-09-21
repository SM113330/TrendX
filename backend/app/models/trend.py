from pydantic import BaseModel
from typing import Literal, List


class Trend(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    engagement: int
    velocity: int
    sentiment: int
    score: int
    direction: Literal["up", "down", "rocket"]
    momentum: List[int]
