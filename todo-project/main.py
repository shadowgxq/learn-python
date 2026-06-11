from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.tasks import router as tasks_router

app = FastAPI(title="Demo API")

app.include_router(auth_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok"}