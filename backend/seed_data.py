from typing import Optional, List
from models import (
    UserProfile, UserRole, Reminder, ReminderCategory,
    GameResult, GameType, DifficultyLevel, CaregiverAlert
)

DEMO_USER_ID = "demo-user-123"
LAKSHMI_USER_ID = "patient-lakshmi-demo"
CAREGIVER_USER_ID = "caregiver-user-456"

def get_initial_lakshmi() -> Optional[UserProfile]:
    return None

def get_initial_user() -> Optional[UserProfile]:
    return None

def get_initial_reminders() -> List[Reminder]:
    return []

def get_initial_game_results() -> List[GameResult]:
    return []

def get_initial_caregiver_alerts() -> List[CaregiverAlert]:
    return []
