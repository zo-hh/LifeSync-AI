from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool = False
    estimated_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    parent_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    title: str
    frequency: str

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    tasks: List[Task] = []
    goals: List[Goal] = []

    class Config:
        from_attributes = True

class DailyLogCreate(BaseModel):
    mood: str
    notes: Optional[str] = None

class DailyLog(DailyLogCreate):
    id: int
    date: datetime
    owner_id: int

    class Config:
        from_attributes = True
