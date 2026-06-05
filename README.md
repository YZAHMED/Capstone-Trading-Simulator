# Trading Simulator

A full-stack web application for running trading simulations and viewing the
results in dashboards. This is my final-year web development capstone project.

## Tech stack

- Frontend: React (Vite) + TypeScript + TailwindCSS + Recharts
- Backend: FastAPI (Python) + SQLAlchemy + JWT
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

To stop everything: Ctrl+C, then `docker compose down`.
To also delete the database: `docker compose down -v`.

## Endpoints so far

- `GET /` - hello message
- `GET /health` - `{ "status": "ok" }` (the frontend calls this to show the
  backend is reachable)

## Project structure

```
backend/             FastAPI app
frontend/            React app
docker-compose.yml   Runs the whole project
```
