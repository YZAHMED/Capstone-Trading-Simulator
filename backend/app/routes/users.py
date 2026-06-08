from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.username == data.username) | (models.User.email == data.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already in use",
        )

    user = models.User(
        username=data.username,
        email=data.email,
        password_hash=auth.hash_password(data.password),
        role="trader",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
