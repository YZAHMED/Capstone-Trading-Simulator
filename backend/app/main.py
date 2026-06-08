from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app import models
from app.routes import users, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trading Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)


@app.get("/")
def read_root():
    return {"message": "Trading Simulator API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
