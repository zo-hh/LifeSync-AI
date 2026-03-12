from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    google_access_token = Column(String, nullable=True)

    tasks = relationship("Task", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    
    # AI generated fields
    estimated_minutes = Column(Integer, nullable=True)
    difficulty = Column(String, nullable=True) # e.g., low, medium, high
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")
    
    # Optional parent task for subtasks broken down by AI
    parent_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    subtasks = relationship("Task", backref="parent", remote_side=[id])

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    frequency = Column(String) # e.g., daily, weekly
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="goals")

class DailyLog(Base):
    """For the Emotional Check-In feature"""
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    mood = Column(String) # e.g., stressed, tired, motivated
    notes = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
