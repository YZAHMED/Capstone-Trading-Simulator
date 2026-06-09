from app.database import SessionLocal
from app import models, auth


def seed_default_users():
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return

        users = [
            models.User(
                username="admin",
                email="admin@example.com",
                password_hash=auth.hash_password("admin123"),
                role="admin",
            ),
            models.User(
                username="daniel",
                email="daniel@example.com",
                password_hash=auth.hash_password("daniel123"),
                role="analyst",
            ),
            models.User(
                username="sara",
                email="sara@example.com",
                password_hash=auth.hash_password("sara123"),
                role="trader",
            ),
        ]
        db.add_all(users)
        db.commit()
    finally:
        db.close()
