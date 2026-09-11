import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import reminders, games, caregiver, ai, users

app = FastAPI(
    title="NeuroSathi NER API",
    description="AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER) - SIH 2026 (SIH26003)",
    version="1.0.0"
)

# Enable CORS for frontend Vite development & production hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(users.router)
app.include_router(reminders.router)
app.include_router(games.router)
app.include_router(caregiver.router)
app.include_router(ai.router)

@app.get("/health", tags=["System"])
def health_check():
    from database import db, SUPABASE_URL
    is_db_connected = db.is_supabase_connected()
    return {
        "status": "healthy",
        "service": "NeuroSathi NER Backend",
        "hackathon": "Smart India Hackathon 2026",
        "problem_id": "SIH26003",
        "team": "Mavericks",
        "version": "1.0.0",
        "database": {
            "status": "connected" if is_db_connected else "offline_fallback",
            "provider": "Supabase PostgreSQL (Cloud)",
            "activated": is_db_connected,
            "supabase_url": SUPABASE_URL if is_db_connected else None
        }
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to NeuroSathi NER - AI-Powered Cognitive & Memory Assistance for Elderly Care in NER",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
