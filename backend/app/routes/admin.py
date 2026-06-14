from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/admin", tags=["admin"])

VALID_ROLES = {"trader", "analyst", "admin"}


def _log(db: Session, actor: models.User, action: str, target: str | None):
    db.add(models.ActivityLog(
        actor_user_id=actor.id,
        action=action,
        target=target,
    ))


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    actor: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(get_db),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.put("/users/{user_id}/role", response_model=schemas.UserOut)
def change_role(
    user_id: int,
    payload: schemas.RoleChange,
    actor: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(get_db),
):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == actor.id and payload.role != "admin":
        raise HTTPException(status_code=400, detail="You can't change your own role away from admin")

    old_role = target.role
    target.role = payload.role
    _log(db, actor, "change_role", f"{target.username}: {old_role} -> {payload.role}")
    db.commit()
    db.refresh(target)
    return target


@router.put("/users/{user_id}/deactivate", response_model=schemas.UserOut)
def deactivate(
    user_id: int,
    actor: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == actor.id:
        raise HTTPException(status_code=400, detail="You can't deactivate yourself")
    target.is_active = False
    _log(db, actor, "deactivate_user", target.username)
    db.commit()
    db.refresh(target)
    return target


@router.put("/users/{user_id}/reactivate", response_model=schemas.UserOut)
def reactivate(
    user_id: int,
    actor: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    target.is_active = True
    _log(db, actor, "reactivate_user", target.username)
    db.commit()
    db.refresh(target)
    return target


@router.get("/activity-log", response_model=List[schemas.ActivityLogEntry])
def activity_log(
    actor: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.ActivityLog)
        .order_by(models.ActivityLog.timestamp.desc())
        .limit(200)
        .all()
    )
    return [
        schemas.ActivityLogEntry(
            id=r.id,
            actor_username=r.actor.username if r.actor else "?",
            action=r.action,
            target=r.target,
            timestamp=r.timestamp,
        )
        for r in rows
    ]
