from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/simulations", tags=["simulations"])


def _get_owned(db: Session, sim_id: int, user: models.User) -> models.Simulation:
    sim = db.query(models.Simulation).filter(models.Simulation.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your simulation")
    return sim


@router.get("", response_model=List[schemas.SimulationOut])
def list_my_simulations(
    user: models.User = Depends(auth.require_role("trader")),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Simulation)
        .filter(models.Simulation.user_id == user.id)
        .order_by(models.Simulation.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.SimulationOut, status_code=status.HTTP_201_CREATED)
def create_simulation(
    data: schemas.SimulationCreate,
    user: models.User = Depends(auth.require_role("trader")),
    db: Session = Depends(get_db),
):
    if data.num_transactions <= 0 or data.rate_per_second <= 0 or data.duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="All numeric fields must be greater than zero")

    sim = models.Simulation(
        user_id=user.id,
        name=data.name,
        symbol=data.symbol.upper(),
        num_transactions=data.num_transactions,
        rate_per_second=data.rate_per_second,
        duration_seconds=data.duration_seconds,
        status="draft",
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return sim


@router.get("/{sim_id}", response_model=schemas.SimulationOut)
def get_simulation(
    sim_id: int,
    user: models.User = Depends(auth.require_role("trader")),
    db: Session = Depends(get_db),
):
    return _get_owned(db, sim_id, user)


@router.put("/{sim_id}", response_model=schemas.SimulationOut)
def update_simulation(
    sim_id: int,
    data: schemas.SimulationUpdate,
    user: models.User = Depends(auth.require_role("trader")),
    db: Session = Depends(get_db),
):
    sim = _get_owned(db, sim_id, user)
    if sim.status != "draft":
        raise HTTPException(
            status_code=400,
            detail="This simulation has already been run and cannot be edited",
        )
    sim.name = data.name
    sim.symbol = data.symbol.upper()
    sim.num_transactions = data.num_transactions
    sim.rate_per_second = data.rate_per_second
    sim.duration_seconds = data.duration_seconds
    db.commit()
    db.refresh(sim)
    return sim


@router.delete("/{sim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_simulation(
    sim_id: int,
    user: models.User = Depends(auth.require_role("trader")),
    db: Session = Depends(get_db),
):
    sim = _get_owned(db, sim_id, user)
    db.delete(sim)
    db.commit()
    return None
