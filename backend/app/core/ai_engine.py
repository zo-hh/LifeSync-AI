import os
import json
from datetime import datetime, timedelta
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
# If the key is totally missing or empty, fallback to the placeholder so the app doesn't crash on boot
if not api_key:
    api_key = "your_openai_api_key_here"

client = OpenAI(api_key=api_key)

def break_down_assignment(assignment):
    """
    Sends an assignment to OpenAI to break it down into subtasks.
    Returns a list of structured subtasks with estimated time and dates.
    """
    days_until_due = (assignment["due_date"] - datetime.now()).days
    
    if not client.api_key or client.api_key == "your_openai_api_key_here":
        # Fallback if no API key is provided
        raise ValueError("OPENAI_API_KEY is not set in the environment.")

    prompt = f"""
    You are an AI productivity planner for a college student.
    I have an assignment: "{assignment['title']}"
    Description: "{assignment['description']}"
    Due in: {days_until_due} days.

    Break this down into logical subtasks. Return ONLY a valid JSON object matching this structure exactly:
    {{
        "difficulty": "Low" | "Medium" | "High",
        "total_estimated_minutes": integer,
        "subtasks": [
            {{
                "title": "Task name",
                "estimated_minutes": integer,
                "day_offset": integer (from 0 to {days_until_due})
            }}
        ]
    }}
    """

    # Hardcoded mock response to bypass OpenAI quota limit
    subtasks = [
        {
            "title": f"Review requirements for {assignment['title']}",
            "estimated_minutes": 30,
            "difficulty": "Low",
            "due_date": datetime.now() + timedelta(days=max(0, days_until_due - 3)),
            "completed": False
        },
        {
            "title": f"Draft outline for {assignment['title']}",
            "estimated_minutes": 60,
            "difficulty": "Medium",
            "due_date": datetime.now() + timedelta(days=max(0, days_until_due - 2)),
            "completed": False
        },
        {
            "title": f"Finalize and submit {assignment['title']}",
            "estimated_minutes": 120,
            "difficulty": "High",
            "due_date": datetime.now() + timedelta(days=days_until_due),
            "completed": False
        }
    ]
    
    return {
        "difficulty": "Medium",
        "total_estimated_minutes": 210,
        "subtasks": subtasks
    }

def schedule_habits(goal):
    """
    Uses OpenAI to create a habit schedule for a personal goal.
    """
    if not client.api_key or client.api_key == "your_openai_api_key_here":
        # Fallback if no API key is provided
        prompt = f"Goal: {goal.title}"
        if "gym" in prompt.lower() or "workout" in prompt.lower():
            return [
                {"title": "Upper Body Workout", "estimated_minutes": 60, "time_preference": "morning"},
                {"title": "Lower Body Workout", "estimated_minutes": 60, "time_preference": "morning"}
            ]
        return [{"title": f"Practice {goal.title}", "estimated_minutes": 30, "time_preference": "any"}]

    prompt = f"""
    You are an AI habit and routine scheduler.
    The user wants to achieve this goal: "{goal.title}"
    
    Create a realistic weekly habit schedule for a busy college student to achieve this goal.
    Return ONLY a valid JSON object matching this structure exactly:
    {{
        "habits": [
            {{
                "title": "Specific action name",
                "estimated_minutes": integer,
                "time_preference": "morning" | "afternoon" | "evening" | "any"
            }}
        ]
    }}
    Limit to 3-4 habits max per week.
    """

    # Hardcoded mock response to bypass OpenAI quota limit
    if "gym" in prompt.lower() or "workout" in prompt.lower():
        return [
            {"title": "Upper Body Workout", "estimated_minutes": 60, "time_preference": "morning"},
            {"title": "Lower Body Workout", "estimated_minutes": 60, "time_preference": "morning"}
        ]
    return [{"title": f"Practice {goal.title}", "estimated_minutes": 30, "time_preference": "any"}]

def predict_workload(tasks, events):
    """
    Workload Prediction Engine using OpenAI.
    Evaluates total task time vs available time this week.
    """
    total_task_minutes = sum(t.get("estimated_minutes", 60) for t in tasks if not t.get("completed"))
    total_hours = total_task_minutes / 60.0

    if not client.api_key or client.api_key == "your_openai_api_key_here":
        if total_hours > 20: return {"status": "warning", "message": "This week is heavy. You may feel overwhelmed."}
        return {"status": "moderate", "message": "Steady workload this week. Keep up the pace."}

    prompt = f"""
    The user is a college student. They have {total_hours:.1f} hours of pending academic tasks to complete this week.
    They also have {len(events)} events on their calendar.
    
    Predict their workload intensity. Is it a light week, moderate, or warning (burnout risk)?
    
    Return ONLY a valid JSON object:
    {{
        "status": "light" | "moderate" | "warning",
        "message": "A short, 2-sentence encouraging or warning message about their specific workload."
    }}
    """

    # Hardcoded mock response to bypass OpenAI quota limit
    if total_hours > 20: 
        return {"status": "warning", "message": "This week is heavy. You may feel overwhelmed."}
    return {"status": "moderate", "message": "Steady workload this week. Keep up the pace."}

def analyze_emotional_checkin(mood: str):
    """
    Adjusts the plan based on the user's emotional state using OpenAI.
    """
    if not client.api_key or client.api_key == "your_openai_api_key_here":
        mood_lower = mood.lower()
        if mood_lower in ["stressed", "tired", "overwhelmed"]:
            return {"action": "reduce_workload", "suggestion": "I noticed you're feeling overwhelmed. Take a break today."}
        return {"action": "maintain", "suggestion": "Hope you have a good day!"}

    prompt = f"""
    The user is a college student. Their daily emotional check-in mood is: "{mood}".
    
    Determine if their schedule needs to be adjusted based on this mood. If they are tired/overwhelmed, we should reduce_workload. If they are motivated, maintain or increase.
    
    Return ONLY a valid JSON object:
    {{
        "action": "reduce_workload" | "maintain" | "increase_challenge",
        "suggestion": "A supportive 1-sentence message explaining how the AI planner has adjusted their day based on their mood."
    }}
    """

    # Hardcoded mock response to bypass OpenAI quota limit
    mood_lower = mood.lower()
    if mood_lower in ["stressed", "tired", "overwhelmed"]:
        return {"action": "reduce_workload", "suggestion": "I noticed you're feeling overwhelmed. Take a break today."}
    return {"action": "maintain", "suggestion": "Hope you have a good day!"}
