from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def fetch_events(user_id: int, user_token: str):
    """
    Fetches actual upcoming events from the user's primary Google Calendar.
    Returns a list of dictionaries representing busy periods.
    """
    if not user_token:
        return []

    try:
        creds = Credentials(token=user_token)
        service = build('calendar', 'v3', credentials=creds)

        # Call the Calendar API
        now = datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
        
        # Get events for the next 7 days
        events_result = service.events().list(
            calendarId='primary', timeMin=now,
            maxResults=50, singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        formatted_events = []
        for event in events:
            # Google Calendar returns either 'dateTime' or 'date' (for all-day events)
            start_str = event['start'].get('dateTime') or event['start'].get('date')
            end_str = event['end'].get('dateTime') or event['end'].get('date')
            
            # Simple parsing (could be improved with robust timezone handling)
            try:
                start_dt = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
            except Exception:
                # If parsing fails, skip or use a generic time
                continue

            formatted_events.append({
                "title": event.get('summary', 'Busy'),
                "start": start_dt,
                "end": end_dt,
                "type": "event" # You could potentially infer type based on title
            })
            
        return formatted_events

    except Exception as e:
        print(f"Google Calendar API Error: {e}")
        return []
