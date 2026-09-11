from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ELDER = "elder"
    CAREGIVER = "caregiver"
    ADMIN = "admin"

class ReminderCategory(str, Enum):
    MEDICINE = "medicine"
    WATER = "water"
    APPOINTMENT = "appointment"
    DAILY_TASK = "daily_task"
    MEAL = "meal"

class GameType(str, Enum):
    MEMORY_MATCH = "memory_match"
    SEQUENCE_RECALL = "sequence_recall"
    OBJECT_RECOGNITION = "object_recognition"

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

# --- User & Profile Models ---
class UserBase(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    role: UserRole = UserRole.ELDER
    age: Optional[int] = 74
    gender: Optional[str] = "Male"
    blood_group: Optional[str] = "B+"
    location: Optional[str] = "Guwahati, Assam"
    language_preference: Optional[str] = "en"
    medical_stage: Optional[str] = "Early-stage Dementia / MCI"
    allergies: Optional[str] = "None known"
    doctor_name: Optional[str] = "Dr. Anupam Sarma (Neurologist)"
    doctor_phone: Optional[str] = "+91 98640 12345"
    doctor_hospital: Optional[str] = "Guwahati Neurological Center, Assam"
    
    # Caregiver Details
    emergency_contact_name: Optional[str] = "Priya Sharma"
    emergency_contact_relation: Optional[str] = "Daughter"
    emergency_contact_phone: Optional[str] = "+91 98765 43210"
    emergency_contact_email: Optional[str] = "priya.sharma@care.in"
    emergency_contact_address: Optional[str] = "Beltola, Guwahati, Assam"
    caregiver_pin: Optional[str] = "1234"

class UserProfileCreate(BaseModel):
    name: str
    email: Optional[str] = None
    role: UserRole = UserRole.ELDER
    age: Optional[int] = 74
    gender: Optional[str] = "Male"
    blood_group: Optional[str] = "B+"
    location: Optional[str] = "Guwahati, Assam"
    language_preference: Optional[str] = "en"
    medical_stage: Optional[str] = "Early-stage Dementia / MCI"
    allergies: Optional[str] = "None known"
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    doctor_hospital: Optional[str] = None
    emergency_contact_name: Optional[str] = "Primary Caregiver"
    emergency_contact_relation: Optional[str] = "Family"
    emergency_contact_phone: Optional[str] = None
    emergency_contact_email: Optional[str] = None
    emergency_contact_address: Optional[str] = None
    caregiver_notes: Optional[str] = None
    caregiver_pin: Optional[str] = "1234"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    location: Optional[str] = None
    language_preference: Optional[str] = None
    medical_stage: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    doctor_hospital: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_email: Optional[str] = None
    emergency_contact_address: Optional[str] = None
    caregiver_notes: Optional[str] = None
    caregiver_pin: Optional[str] = None

class UserProfile(UserBase):
    created_at: Optional[str] = None
    current_streak: int = 4
    total_stars: int = 48
    avatar_url: Optional[str] = None

# --- Device Pairing & Auth Models ---
class DevicePairRequest(BaseModel):
    patient_id: str
    device_identifier: str
    device_name: Optional[str] = "Elder Tablet"
    pin: Optional[str] = None  # Optional 4-digit PIN

class DevicePairResponse(BaseModel):
    success: bool
    message: str
    patient: UserProfile
    device_identifier: str
    paired_at: str
    pin_enabled: bool

class PatientSessionCheckResponse(BaseModel):
    paired: bool
    patient: Optional[UserProfile] = None
    pin_enabled: bool = False
    device_name: Optional[str] = None

class CaregiverLoginRequest(BaseModel):
    contact: Optional[str] = None # Email or Phone
    email: Optional[str] = None
    password: Optional[str] = None
    pin: Optional[str] = None
    patient_id: Optional[str] = None

class CaregiverLoginResponse(BaseModel):
    success: bool
    message: str
    caregiver: Optional[Dict[str, Any]] = None
    active_patient: Optional[UserProfile] = None
    all_patients: Optional[List[UserProfile]] = []

# --- Reminder Models ---
class ReminderCreate(BaseModel):
    user_id: str
    title: str
    category: ReminderCategory
    time: str  # Format: "08:00 AM" or "14:30"
    dosage_or_detail: Optional[str] = None
    audio_prompt: Optional[str] = None
    is_completed: bool = False
    icon_name: Optional[str] = "Pill"

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[ReminderCategory] = None
    time: Optional[str] = None
    dosage_or_detail: Optional[str] = None
    audio_prompt: Optional[str] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[str] = None
    icon_name: Optional[str] = None

class Reminder(BaseModel):
    id: str
    user_id: str
    title: str
    category: ReminderCategory
    time: str
    dosage_or_detail: Optional[str] = None
    audio_prompt: Optional[str] = None
    is_completed: bool = False
    completed_at: Optional[str] = None
    icon_name: Optional[str] = "Pill"
    created_at: str

# --- Game Telemetry & Results ---
class GameResultCreate(BaseModel):
    user_id: str
    game_type: GameType
    difficulty: DifficultyLevel
    score: int
    max_score: int = 100
    attempts: int = 1
    duration_seconds: int = 30
    mistakes: int = 0
    cultural_theme: Optional[str] = "North East Heritage"
    completed: bool = True

class GameResult(GameResultCreate):
    id: str
    timestamp: str
    encouraging_message: str
    adaptive_next_difficulty: DifficultyLevel

# --- Caregiver & Alert Models ---
class CaregiverAlert(BaseModel):
    id: str
    user_id: str
    alert_type: str  # "missed_reminder", "cognitive_drop", "inactivity", "milestone"
    severity: str    # "info", "warning", "critical"
    message: str
    timestamp: str
    is_resolved: bool = False

class CaregiverDashboardSummary(BaseModel):
    patient_profile: UserProfile
    today_activity_count: int
    adherence_percentage: int
    average_cognitive_score: int
    cognitive_trend: str  # "Improving", "Stable", "Needs Attention"
    recent_game_scores: List[GameResult]
    today_reminders: List[Reminder]
    missed_reminders_count: int
    active_alerts: List[CaregiverAlert]
    recent_activity_timeline: List[Dict[str, Any]]
    score_history_by_game: Dict[str, List[int]]

# --- AI Recommendation Models ---
class AIRecommendationRequest(BaseModel):
    user_id: str
    recent_scores: Optional[List[int]] = None
    completion_rate: Optional[float] = None
    recent_activity_count: Optional[int] = None
    current_difficulty: Optional[DifficultyLevel] = DifficultyLevel.EASY

class AIRecommendationResponse(BaseModel):
    user_id: str
    recommended_game: GameType
    recommended_game_name: str
    recommended_difficulty: DifficultyLevel
    reasoning: str
    caregiver_note: Optional[str] = None
    encouraging_voice_message: str
    disclaimer: str = "AI Cognitive Assistance is designed for stimulation and engagement, not clinical diagnosis."
