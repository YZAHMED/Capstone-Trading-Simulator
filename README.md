# Trading Simulator

A full-stack web application for running trading simulations and looking at the results in dashboards. This is my final-year web development capstone project.

## Tech stack

- Frontend: React (Vite) + TypeScript + TailwindCSS + Recharts + React Router
- Backend: FastAPI (Python) + SQLAlchemy + JWT (python-jose) + bcrypt
- Database: MySQL 8
- Everything runs together with Docker Compose

## How to run

You need Docker installed.

From the project root:

```bash
docker compose up --build
```

This starts three containers:

- `db` - MySQL on port 3306
- `backend` - FastAPI on http://localhost:8000
- `frontend` - Vite dev server on http://localhost:5173

Open http://localhost:5173 in the browser.

To stop everything: `Ctrl+C`, then `docker compose down`.
To also delete the database (start from scratch next time): `docker compose down -v`.

## Demo accounts

The backend seeds three demo accounts on first startup so you can try every role without registering:

| Username | Password   | Role    |
| -------- | ---------- | ------- |
| sara     | sara123    | trader  |
| daniel   | daniel123  | analyst |
| admin    | admin123   | admin   |

You can also register a new account (it will get the `trader` role by default).

## What each role can do

**Trader** - go to "My Simulations", create a new simulation, edit or delete a draft, run a simulation, watch live progress, and view the results with a chart.

**System Analyst** - go to "Analytics" for cross-platform metrics (average latency by day, runs by day, totals) or "History" for a list of every simulation that has been run.

**Administrator** - go to "Manage Users" to change a user's role or deactivate them. "Activity Log" shows every admin action.

## Project structure

```
backend/
  app/
    main.py               FastAPI entry point
    database.py           SQLAlchemy engine + session
    models.py             User, Simulation, SimulationResult, ActivityLog
    schemas.py            Pydantic request/response schemas
    auth.py               Password hashing + JWT helpers
    seed.py               Creates demo users on first boot
    simulation_engine.py  Background thread that runs simulations
    routes/
      users.py            /users/register
      auth.py             /auth/login, /auth/me
      simulations.py      CRUD on simulations
      run.py              Start a run, check progress, get results
      analytics.py        Aggregated metrics + history
      admin.py            User management + activity log
frontend/
  src/
    api/                  axios wrappers per resource
    context/              AuthContext (token + user info)
    components/           NavBar, RoleRoute, ProtectedRoute, DeleteModal
    pages/                one file per page
    App.tsx               router setup
docker-compose.yml        runs the whole stack
```

## Endpoints

| Method | Path | Who can call it |
| --- | --- | --- |
| GET | `/health` | anyone |
| POST | `/users/register` | anyone |
| POST | `/auth/login` | anyone |
| GET | `/auth/me` | logged in |
| GET | `/simulations` | trader |
| POST | `/simulations` | trader |
| GET | `/simulations/{id}` | trader (owner) |
| PUT | `/simulations/{id}` | trader (owner) |
| DELETE | `/simulations/{id}` | trader (owner) |
| POST | `/simulations/{id}/run` | trader (owner) |
| GET | `/simulations/{id}/progress` | trader (owner) |
| GET | `/simulations/{id}/results` | trader (owner) or analyst |
| GET | `/analytics/summary` | analyst, admin |
| GET | `/analytics/history` | analyst, admin |
| GET | `/admin/users` | admin |
| PUT | `/admin/users/{id}/role` | admin |
| PUT | `/admin/users/{id}/deactivate` | admin |
| PUT | `/admin/users/{id}/reactivate` | admin |
| GET | `/admin/activity-log` | admin |

## Notes

- The simulation engine runs in a background thread inside the backend container. It does not survive a backend restart (good enough for a demo).
- The frontend polls the backend every 1 second for live progress. I picked polling over WebSockets to keep the project simple.
- Database tables are created automatically when the backend starts (no migration tool). The backend also retries the connection on startup in case MySQL is slow to initialise on the very first boot.
- The JWT secret is set in `docker-compose.yml` and `.env.example`. In a real deployment you would change it.
