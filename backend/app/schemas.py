from datetime import datetime
from typing import Optional
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
