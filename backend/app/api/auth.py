import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import models
from fastapi_sso.sso.google import GoogleSSO
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

# We need these specific scopes to read classroom and calendar data
SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/calendar.readonly"
]

google_sso = GoogleSSO(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri="http://localhost:8000/auth/callback",
    allow_insecure_http=True, # For local dev
    scope=SCOPES
)

@router.get("/login")
async def auth_login():
    """Redirects the user to the Google Consent Screen."""
    async with google_sso:
        return await google_sso.get_login_redirect()

@router.get("/callback")
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    """Handles the callback from Google after user grants permission."""
    try:
        async with google_sso:
            user_info = await google_sso.verify_and_process(request)
        
        # Check if user exists in DB
        db_user = db.query(models.User).filter(models.User.email == user_info.email).first()
        
        if not db_user:
            # Create new user
            db_user = models.User(
                email=user_info.email,
                name=user_info.display_name,
                google_access_token=google_sso.access_token # WARNING: In a production app, encrypt this or use refresh tokens
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        else:
            # Update their access token
            db_user.google_access_token = google_sso.access_token
            db.commit()

        # Redirect back to the frontend dashboard with successful login state
        return RedirectResponse(url=f"http://localhost:5173/?login=success&user_id={db_user.id}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")
