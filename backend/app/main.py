import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.database import engine
from app import models
from app.routes import users, auth, simulations, run, analytics, admin
from app.seed import seed_default_users


def _create_tables_with_retry(max_tries: int = 10, delay_seconds: int = 2):
    for attempt in range(1, max_tries + 1):
        try:
            models.Base.metadata.create_all(bind=engine)
            return
        except OperationalError as exc:
            if attempt == max_tries:
                raise
            print(f"DB not ready ({exc.__class__.__name__}), retry {attempt}/{max_tries}")
            time.sleep(delay_seconds)


_create_tables_with_retry()
seed_default_users()

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
app.include_router(simulations.router)
app.include_router(run.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.get("/")
def read_root():
    return {"message": "Trading Simulator API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
