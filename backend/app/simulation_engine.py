import threading
import time
import random
from datetime import datetime, timezone

from app.database import SessionLocal
from app import models

_running: set[int] = set()
_lock = threading.Lock()


def _run(sim_id: int):
    db = SessionLocal()
    try:
        sim = db.query(models.Simulation).filter(models.Simulation.id == sim_id).first()
        if not sim:
            return

        sim.status = "running"
        sim.started_at = datetime.now(timezone.utc)
        db.commit()

        delay = 1.0 / max(sim.rate_per_second, 1)
        deadline = time.time() + sim.duration_seconds

        for n in range(1, sim.num_transactions + 1):
            if time.time() > deadline:
                break

            latency = random.randint(60, 150)
            success = random.random() > 0.005

            db.add(models.SimulationResult(
                simulation_id=sim.id,
                transaction_number=n,
                latency_ms=latency,
                success=success,
                timestamp=datetime.now(timezone.utc),
            ))

            if n % 20 == 0:
                db.commit()

            time.sleep(delay)

        db.commit()
        sim.status = "completed"
        sim.finished_at = datetime.now(timezone.utc)
        db.commit()
    except Exception:
        try:
            sim = db.query(models.Simulation).filter(models.Simulation.id == sim_id).first()
            if sim:
                sim.status = "failed"
                sim.finished_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
    finally:
        with _lock:
            _running.discard(sim_id)
        db.close()


def start_in_background(sim_id: int) -> bool:
    with _lock:
        if sim_id in _running:
            return False
        _running.add(sim_id)

    thread = threading.Thread(target=_run, args=(sim_id,), daemon=True)
    thread.start()
    return True
