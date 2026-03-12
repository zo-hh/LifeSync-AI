from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.models import models

# Create all DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LifeSync AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allowing all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import tasks, goals, ai, auth

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(goals.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the LifeSync AI API Backend!"}
