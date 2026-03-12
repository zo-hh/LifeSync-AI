# 🌟 LifeSync AI

**LifeSync AI** is a smart personal organizer designed to help students and professionals balance their academic requirements with personal life goals. By integrating with Google services and utilizing AI-driven prioritization, LifeSync AI ensures you never miss a deadline while also making time for your health and personal growth.

---

## 🚀 The Vision

Modern life is a juggle between formal commitments (classes, assignments) and personal wellbeing (goals, rest, habits). LifeSync AI acts as the "connective tissue" between these two worlds, merging them into a single, intelligent schedule.

---

## 🛠️ Core Features

### 📅 Smart Calendar (The Hub)
- **Unified View**: Merges Google Classroom assignments, Google Calendar events, and personal goals into one interactive interface.
- **Visual Clarity**: Color-coded events distinguish between academic tasks and personal time.

### 🎓 Google Integration
- **Classroom Sync**: Automatically fetches assignments, due dates, and course info.
- **Calendar Sync**: Keeps your existing schedule in sync with your new LifeSync tasks.
- **Secure OAuth**: Full integration with Google Cloud Identity for secure access.

### 🧠 AI-Driven Scheduling
- **Intelligent Prioritization**: Uses AI to analyze due dates and task complexity to suggest the best time to work.
- **Conflict Resolution**: Identifies overlaps between study time and personal goals.

### 🎯 Personal Goals & Wellbeing
- **Custom Goals**: Add personal projects, hobbies, or habits (e.g., "Read 20 mins," "Go to the Gym").
- **Daily Check-Ins**: A dedicated flow for tracking mood and health, ensuring your schedule respects your mental state.

---

## 💻 Tech Stack

- **Frontend**: 
    - **React** (with Vite) for a fast, responsive UI.
    - **Vanilla CSS** for premium, custom-tailored aesthetics.
- **Backend**: 
    - **FastAPI** (Python) for high-performance API endpoints.
    - **SQLite** for reliable, lightweight data persistence.
    - **SQLAlchemy** for ORM-based database management.
- **APIs & Integrations**: 
    - **Google Cloud Console**: Classroom API, Calendar API.
    - **OAuth 2.0**: For secure Google authentication.

---

## ✅ What We've Accomplished

1.  **Project Foundation**: Established a robust monorepo structure with a clear separation between the FastAPI backend and React frontend.
2.  **Authentication System**: Implemented Google OAuth 2.0, allowing users to safely connect their Google accounts.
3.  **Data Synchronization**: Built services to fetch and store assignments from Google Classroom.
4.  **Smart Calendar UI**: Developed a comprehensive calendar view that pulls data from multiple sources.
5.  **Personal Goal Tracking**: Created modules to manage non-academic goals alongside school work.
6.  **AI Integration Layer**: Set up schemas and endpoints for AI-powered task management.

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js & npm
- Google Cloud Project credentials

### Backend Setup
1. Navigate to `/backend`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows).
4. Install dependencies: `pip install -r requirements.txt`. (Note: Ensure requirements.txt is up to date).
5. Configure `.env` with your Google Client ID and Secret.
6. Run the server: `python -m app.main`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

---

## 📂 Project Structure

```text
LifeSync-AI/
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # API Endpoints (auth, tasks, goals, ai)
│   │   ├── core/       # Configuration
│   │   ├── db/         # Database models & session
│   │   └── services/   # Business logic (Google API calls)
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   └── pages/      # SmartCalendar, Dashboard, Goals, etc.
└── README.md           # You are here!
```

---

*LifeSync AI - Merging your academic and personal worlds with intelligence.*
