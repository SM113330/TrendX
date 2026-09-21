from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.trends import router as trends_router
from app.routes.search import router as search_router
from app.routes.compare import router as compare_router
from app.routes.creators import router as creators_router
from app.routes.regions import router as regions_router

app = FastAPI(title="TRENDX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
    return {"status": "TRENDX API running"}