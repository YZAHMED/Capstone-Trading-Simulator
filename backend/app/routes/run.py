from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth, simulation_engine

router = APIRouter(prefix="/simulations", tags=["run"])


@router.post("/{sim_id}/run", response_model=schemas.SimulationOut)
def start_run(
    sim_id: int,
    user: models.User = Depends(auth.require_role("trader")),
    db: Session = Depends(get_db),
):
    sim = db.query(models.Simulation).filter(models.Simulation.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your simulation")
    if sim.status != "draft":
        raise HTTPException(status_code=400, detail="This simulation has already been run")

    simulation_engine.start_in_background(sim.id)
    db.refresh(sim)
    return sim


@router.get("/{sim_id}/progress", response_model=schemas.SimulationProgress)
def get_progress(
    sim_id: int,
    user: models.User = Depends(auth.require_role("trader")),
    db: Session = Depends(get_db),
):
    sim = db.query(models.Simulation).filter(models.Simulation.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your simulation")

    done = (
        db.query(models.SimulationResult)
        .filter(models.SimulationResult.simulation_id == sim.id)
        .count()
    )

    return schemas.SimulationProgress(
        id=sim.id,
        status=sim.status,
        completed=done,
        total=sim.num_transactions,
    )


@router.get("/{sim_id}/results", response_model=schemas.SimulationResults)
def get_results(
    sim_id: int,
    user: models.User = Depends(auth.require_role("trader", "analyst")),
    db: Session = Depends(get_db),
):
    sim = db.query(models.Simulation).filter(models.Simulation.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    if user.role == "trader" and sim.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your simulation")

    rows = (
        db.query(models.SimulationResult)
        .filter(models.SimulationResult.simulation_id == sim.id)
        .order_by(models.SimulationResult.transaction_number)
        .all()
    )

    if not rows:
        return schemas.SimulationResults(
            simulation=sim,
            total=0,
            success_rate=0.0,
            avg_latency_ms=0.0,
            p95_latency_ms=0,
            points=[],
        )

    latencies = [r.latency_ms for r in rows]
    successes = sum(1 for r in rows if r.success)
    total = len(rows)

    sorted_lat = sorted(latencies)
    p95_idx = min(len(sorted_lat) - 1, int(len(sorted_lat) * 0.95))
    p95 = sorted_lat[p95_idx]

    return schemas.SimulationResults(
        simulation=sim,
        total=total,
        success_rate=round(100 * successes / total, 2),
        avg_latency_ms=round(sum(latencies) / total, 1),
        p95_latency_ms=p95,
        points=[
            schemas.SimulationPoint(
                transaction_number=r.transaction_number,
                latency_ms=r.latency_ms,
                success=r.success,
            )
            for r in rows
        ],
    )
