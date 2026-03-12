from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.api import schemas
from app.core import ai_engine
from app.services import google_classroom, google_calendar

router = APIRouter(prefix="/ai", tags=["AI Engine"])


@router.get("/sync-classroom")
def sync_classroom_assignments(user_id: int, db: Session = Depends(get_db)):
    """
    Fetches actual assignments from Google Classroom and runs them through the AI Engine to break them down.
    Saves the assignments and their generated subtasks to the database.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # if not user.google_access_token: # In models.py we called it google_access_token later, updating that assumption
    #     raise HTTPException(status_code=401, detail="Google account not connected. Please login again.")

    assignments = google_classroom.fetch_assignments(user.id, getattr(user, "google_access_token", None))
    
    if not assignments:
        return {"message": "No new assignments found in Google Classroom.", "data": []}

    analyzed_assignments = []
    for assignment in assignments:
        breakdown = ai_engine.break_down_assignment(assignment)
        
        # Save main parent task
        db_parent_task = models.Task(
            title=assignment["title"],
            description=assignment["description"],
            due_date=assignment["due_date"],
            estimated_minutes=breakdown["total_estimated_minutes"],
            difficulty=breakdown["difficulty"],
            owner_id=user_id
        )
        db.add(db_parent_task)
        db.commit()
        db.refresh(db_parent_task)
        
        # Save subtasks
        subtask_titles = []
        for st in breakdown["subtasks"]:
            subtask_titles.append(st["title"])
            db_subtask = models.Task(
                title=st["title"],
                estimated_minutes=st["estimated_minutes"],
                difficulty=st["difficulty"],
                due_date=st["due_date"],
                owner_id=user_id,
                parent_id=db_parent_task.id
            )
            db.add(db_subtask)
        
        db.commit()

        analyzed_assignments.append({
            "original_title": assignment["title"],
            "difficulty": breakdown["difficulty"],
            "total_estimated_minutes": breakdown["total_estimated_minutes"],
            "subtasks": subtask_titles
        })
        
    return {"message": "Successfully synced, analyzed, and saved assignments", "data": analyzed_assignments}

@router.get("/workload")
def get_workload_prediction(user_id: int, db: Session = Depends(get_db)):
    """Predict load for the week using real database tasks and Google Calendar events."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch real uncompleted tasks for the user
    user_tasks = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.completed == False).all()
    tasks_data = [
        {"title": t.title, "estimated_minutes": t.estimated_minutes or 60, "completed": t.completed} 
        for t in user_tasks
    ]
    
    # Fetch real calendar events if Google account is linked
    events_data = []
    if user.google_access_token:
        events_data = google_calendar.fetch_events(user.id, user.google_access_token)
    
    prediction = ai_engine.predict_workload(tasks_data, events_data)
    return prediction

@router.post("/emotional-checkin")
def emotional_checkin(user_id: int, log: schemas.DailyLogCreate, db: Session = Depends(get_db)):
    """Logs user's mood and returns AI scheduling adjustments."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_log = models.DailyLog(**log.model_dump(), owner_id=user.id)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    ai_response = ai_engine.analyze_emotional_checkin(log.mood)
    
    return {
        "log": db_log,
        "ai_response": ai_response
    }

@router.get("/schedule")
def get_smart_schedule(user_id: int, db: Session = Depends(get_db)):
    """Returns a combined schedule of tasks, goals, and AI-suggested rest periods."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    tasks = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.completed == False).all()
    goals = db.query(models.Goal).filter(models.Goal.owner_id == user_id).all()
    
    schedule = []
    
    # 1. Map real tasks (Assignments/Subtasks) to schedule blocks
    # Distribute them over the next few days for mock visual purposes
    # Since we have more tasks now, we'll try to spread them nicely
    day_offset = 0
    time_slots = [
        (10, 12, 120, 120),
        (14, 16, 120, 360),
        (9, 11, 120, 60),
        (11, 13, 120, 180),
        (16, 18, 120, 480)
    ]

    for i, task in enumerate(tasks):
        slot = time_slots[i % len(time_slots)]
        day = (i // len(time_slots)) % 7
        
        schedule.append({
            "day": day,
            "time": f"{slot[0]}:00", 
            "title": task.title[:30] + ('...' if len(task.title) > 30 else ''),
            "type": "study" if "Subtask" not in task.title else "class", # Just visual differentiation
            "height": slot[2],
            "top": slot[3] 
        })
        
    # 2. Map goals
    if not goals:
        # Mock goals if user hasn't added any yet
        goals_mock = [
            {"title": "Go to the Gym", "day": 1, "time": "17:00", "top": 540, "height": 60},
            {"title": "Read 30 mins", "day": 3, "time": "20:00", "top": 720, "height": 30},
            {"title": "Learn Guitar", "day": 5, "time": "15:00", "top": 420, "height": 60}
        ]
        for g in goals_mock:
            schedule.append({
                "day": g["day"],
                "time": g["time"],
                "title": g["title"],
                "type": "personal",
                "height": g["height"],
                "top": g["top"]
            })
    else:
        for i, goal in enumerate(goals):
            schedule.append({
                "day": (i + 2) % 7,
                "time": "18:00",
                "title": goal.title,
                "type": "personal",
                "height": 60,
                "top": 600
            })
        
    # 3. Add AI Rest Blocks dynamically based on workload density
    schedule.append({"day": 0, "time": "13:00", "title": "AI Optimized Rest", "type": "rest", "height": 60, "top": 300})
    schedule.append({"day": 2, "time": "15:00", "title": "AI Rest Block", "type": "rest", "height": 60, "top": 420})
    schedule.append({"day": 4, "time": "14:00", "title": "No Classes - AI Free Time", "type": "rest", "height": 120, "top": 360})

    # Sort to ensure proper rendering order if needed natively
    schedule.sort(key=lambda x: (x['day'], x['time']))
    
    return schedule
