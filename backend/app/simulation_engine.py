import threading
import time
import random
from datetime import datetime, timezone

from app.database import SessionLocal
from app import models

_running: set[int] = set()
_lock = threading.Lock()


def _stress_for(rate_per_second: int) -> dict:
    # what: works out the simulated system stress for a given rate
    # gets: the requested rate per second
    # returns: a dict with the failure rate and latency range for that load level
    # the idea: real platforms degrade as load goes up. so we scale fail rate and
    # latency with the configured rate to make the simulator behave like a real one
    if rate_per_second <= 500:
        return {"fail_rate": 0.0, "lat_min": 60, "lat_max": 100}
    if rate_per_second <= 2000:
        r = (rate_per_second - 500) / 1500
        return {
            "fail_rate": 0.05 * r,
            "lat_min": 60 + int(40 * r),
            "lat_max": 100 + int(150 * r),
        }
    if rate_per_second <= 10000:
        r = (rate_per_second - 2000) / 8000
        return {
            "fail_rate": 0.05 + 0.25 * r,
            "lat_min": 100 + int(150 * r),
            "lat_max": 250 + int(550 * r),
        }
    return {"fail_rate": 0.4, "lat_min": 250, "lat_max": 1500}


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

        stress = _stress_for(sim.rate_per_second)
        fail_rate = stress["fail_rate"]
        lat_min = stress["lat_min"]
        lat_max = stress["lat_max"]

        for n in range(1, sim.num_transactions + 1):
            if time.time() > deadline:
                break

            latency = random.randint(lat_min, lat_max)
            success = random.random() > fail_rate

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
