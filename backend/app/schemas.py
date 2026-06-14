from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class SimulationBase(BaseModel):
    name: str
    symbol: str
    num_transactions: int
    rate_per_second: int
    duration_seconds: int


class SimulationCreate(SimulationBase):
    pass


class SimulationUpdate(SimulationBase):
    pass


class SimulationOut(SimulationBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SimulationProgress(BaseModel):
    id: int
    status: str
    completed: int
    total: int


class SimulationPoint(BaseModel):
    transaction_number: int
    latency_ms: int
    success: bool


class SimulationResults(BaseModel):
    simulation: SimulationOut
    total: int
    success_rate: float
    avg_latency_ms: float
    p95_latency_ms: int
    points: List[SimulationPoint]


class DailyMetric(BaseModel):
    day: str
    value: float


class AnalyticsSummary(BaseModel):
    range: str
    total_simulations: int
    total_completed: int
    avg_latency_all_time: float
    daily_avg_latency: List[DailyMetric]
    daily_runs: List[DailyMetric]


class HistoryItem(BaseModel):
    id: int
    user_id: int
    username: str
    name: str
    symbol: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None


class RoleChange(BaseModel):
    role: str


class ActivityLogEntry(BaseModel):
    id: int
    actor_username: str
    action: str
    target: Optional[str] = None
    timestamp: datetime
