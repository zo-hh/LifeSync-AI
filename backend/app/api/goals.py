from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.api import schemas

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.post("/", response_model=schemas.Goal)
def create_goal(user_id: int, goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    db_goal = models.Goal(**goal.dict(), owner_id=user_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/", response_model=List[schemas.Goal])
def read_goals(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.owner_id == user_id).offset(skip).limit(limit).all()
    return goals
