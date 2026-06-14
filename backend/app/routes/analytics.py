from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _range_to_start(range_name: str) -> Optional[datetime]:
    now = datetime.now(timezone.utc)
    if range_name == "last7":
        return now - timedelta(days=7)
    if range_name == "last30":
        return now - timedelta(days=30)
    return None


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def summary(
    range: str = Query("last30"),
    user: models.User = Depends(auth.require_role("analyst", "admin")),
    db: Session = Depends(get_db),
):
    start = _range_to_start(range)

    total_q = db.query(models.Simulation)
    completed_q = db.query(models.Simulation).filter(models.Simulation.status == "completed")
    if start is not None:
        total_q = total_q.filter(models.Simulation.started_at >= start)
        completed_q = completed_q.filter(models.Simulation.started_at >= start)

    avg_lat_q = db.query(sql_func.avg(models.SimulationResult.latency_ms))
    if start is not None:
        avg_lat_q = avg_lat_q.filter(models.SimulationResult.timestamp >= start)
    avg_lat = avg_lat_q.scalar() or 0.0

    daily_lat_q = db.query(
        sql_func.date(models.SimulationResult.timestamp).label("day"),
        sql_func.avg(models.SimulationResult.latency_ms).label("avg"),
    )
    if start is not None:
        daily_lat_q = daily_lat_q.filter(models.SimulationResult.timestamp >= start)
    daily_lat = (
        daily_lat_q
        .group_by(sql_func.date(models.SimulationResult.timestamp))
        .order_by(sql_func.date(models.SimulationResult.timestamp))
        .all()
    )

    daily_runs_q = db.query(
        sql_func.date(models.Simulation.started_at).label("day"),
        sql_func.count(models.Simulation.id).label("runs"),
    ).filter(models.Simulation.started_at.isnot(None))
    if start is not None:
        daily_runs_q = daily_runs_q.filter(models.Simulation.started_at >= start)
    daily_runs = (
        daily_runs_q
        .group_by(sql_func.date(models.Simulation.started_at))
        .order_by(sql_func.date(models.Simulation.started_at))
        .all()
    )

    return schemas.AnalyticsSummary(
        range=range,
        total_simulations=total_q.count(),
        total_completed=completed_q.count(),
        avg_latency_all_time=round(float(avg_lat), 1),
        daily_avg_latency=[
            schemas.DailyMetric(day=str(d), value=round(float(v or 0), 1))
            for d, v in daily_lat
        ],
        daily_runs=[
            schemas.DailyMetric(day=str(d), value=float(v))
            for d, v in daily_runs
        ],
    )


@router.get("/history", response_model=List[schemas.HistoryItem])
def history(
    user: models.User = Depends(auth.require_role("analyst", "admin")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Simulation)
        .order_by(models.Simulation.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        schemas.HistoryItem(
            id=r.id,
            user_id=r.user_id,
            username=r.owner.username if r.owner else "?",
            name=r.name,
            symbol=r.symbol,
            status=r.status,
            created_at=r.created_at,
            started_at=r.started_at,
            finished_at=r.finished_at,
        )
        for r in rows
    ]
