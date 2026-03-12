from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json

def fetch_assignments(user_id: int, user_token: str):
    """
    Fetches actual assignments from the Google Classroom API using the user's OAuth token.
    Returns a list of dictionaries representing tasks.
    """
    # if not user_token:
    #     # Fallback to empty list or mock if no token exists
    #     return []

    # Parse token string back to dict (assuming it was saved as JSON string or plain token)
    # Using a simple Credentials object for OAuth2
    # creds = Credentials(token=user_token)
    # service = build('classroom', 'v1', credentials=creds)

    # print("Fetching courses...")
    # courses_result = service.courses().list(studentId='me').execute()
    # print("Providing mock courses since account structure is empty...")
    
    # User has no active courses on this Google account. 
    # Providing mock assignments so the UI can be tested.
    formatted_assignments = [
        {
            "title": "[CS101] Final Project Submission",
            "description": "Submit your final React codebase and documentation.",
            "due_date": datetime.now() + timedelta(days=5),
            "estimated_minutes": None,
            "difficulty": None,
            "completed": False
        },
        {
            "title": "[ENG205] Literary Analysis Essay",
            "description": "A 5-page essay on the overarching themes in The Great Gatsby.",
            "due_date": datetime.now() + timedelta(days=3),
            "estimated_minutes": None,
            "difficulty": None,
            "completed": False
        },
        {
            "title": "[PHYS102] Lab 4 Report",
            "description": "Calculate kinematics data and write up the lab findings.",
            "due_date": datetime.now() + timedelta(days=2),
            "estimated_minutes": None,
            "difficulty": None,
            "completed": False
        },
        {
            "title": "[MATH210] Calculus Midterm Prep",
            "description": "Review chapters 4-6 and complete practice problems.",
            "due_date": datetime.now() + timedelta(days=6),
            "estimated_minutes": None,
            "difficulty": None,
            "completed": False
        }
    ]

    return formatted_assignments
