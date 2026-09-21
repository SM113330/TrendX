import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.trends import router as trends_router
from app.routes.search import router as search_router
from app.routes.compare import router as compare_router
from app.routes.creators import router as creators_router
from app.routes.regions import router as regions_router


def allowed_origins():
    configured = os.getenv("ALLOWED_ORIGINS", "")
    origins = [
        origin.strip().rstrip("/")
        for origin in configured.split(",")
        if origin.strip()
    ]

    return origins or ["http://localhost:3000", "http://localhost:3001"]


app = FastAPI(
    title="TRENDX API",
    description="Live trend intelligence API for the TRENDX attention terminal.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trends_router)
app.include_router(search_router)
app.include_router(compare_router)
app.include_router(creators_router)
app.include_router(regions_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "TRENDX API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
