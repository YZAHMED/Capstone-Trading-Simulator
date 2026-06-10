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
