import uuid
from datetime import datetime, timedelta
from models import (
    UserProfile, UserRole, Reminder, ReminderCategory,
    GameResult, GameType, DifficultyLevel, CaregiverAlert
)

DEMO_USER_ID = "demo-user-123"
LAKSHMI_USER_ID = "patient-lakshmi-demo"
CAREGIVER_USER_ID = "caregiver-user-456"

def get_initial_lakshmi() -> UserProfile:
    return UserProfile(
        id=LAKSHMI_USER_ID,
        name="Lakshmi Devi",
        email="lakshmi.devi@neurosathi.in",
        role=UserRole.ELDER,
        age=72,
        gender="Female",
        blood_group="B+",
        location="Guwahati, Assam",
        language_preference="en",
        medical_stage="Mild Cognitive Impairment (Early Stage)",
        allergies="None reported",
        doctor_name="Dr. Anupam Sarma (Neurologist)",
        doctor_phone="+91 98640 12345",
        doctor_hospital="Guwahati Neurological Center, Assam",
        emergency_contact_name="Dr. Priya Sharma (Daughter)",
        emergency_contact_relation="Daughter & Caregiver",
        emergency_contact_phone="+91 98765 43210",
        emergency_contact_email="caregiver@neurosathi.in",
        emergency_contact_address="Beltola, Guwahati, Assam",
        caregiver_notes="Enjoys Assamese tea stories and visual memory matching. Responds wonderfully to gentle audio prompts.",
        caregiver_pin="1234",
        created_at=(datetime.now() - timedelta(days=15)).isoformat(),
        current_streak=5,
        total_stars=62,
        avatar_url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
    )

def get_initial_user() -> UserProfile:
    return UserProfile(
        id=DEMO_USER_ID,
        name="Bhaben Kalita",
        email="bhaben.kalita@neureosathi.in",
        role=UserRole.ELDER,
        age=74,
        location="Guwahati, Assam",
        language_preference="en",
        emergency_contact_name="Priya Sharma (Daughter)",
        emergency_contact_phone="+91 98765 43210",
        created_at=(datetime.now() - timedelta(days=30)).isoformat(),
        current_streak=4,
        total_stars=56,
        avatar_url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
    )

def get_initial_reminders() -> list[Reminder]:
    now = datetime.now()
    return [
        Reminder(
            id="rem-1",
            user_id=DEMO_USER_ID,
            title="Blood Pressure Tablet (Amlodipine)",
            category=ReminderCategory.MEDICINE,
            time="08:30 AM",
            dosage_or_detail="1 tablet after morning tea with water",
            audio_prompt="Please take your Blood Pressure tablet with water.",
            is_completed=True,
            completed_at=(now - timedelta(hours=3)).isoformat(),
            icon_name="Pill",
            created_at=(now - timedelta(days=5)).isoformat()
        ),
        Reminder(
            id="rem-2",
            user_id=DEMO_USER_ID,
            title="Drink Fresh Water",
            category=ReminderCategory.WATER,
            time="11:00 AM",
            dosage_or_detail="1 full copper glass of filtered water",
            audio_prompt="Time to drink a warm glass of water to stay hydrated.",
            is_completed=True,
            completed_at=(now - timedelta(hours=1)).isoformat(),
            icon_name="Droplet",
            created_at=(now - timedelta(days=5)).isoformat()
        ),
        Reminder(
            id="rem-3",
            user_id=DEMO_USER_ID,
            title="Afternoon Memory Game Session",
            category=ReminderCategory.DAILY_TASK,
            time="03:30 PM",
            dosage_or_detail="Play 1 session of North East Heritage Match",
            audio_prompt="Let's exercise your mind with the Heritage Memory Game.",
            is_completed=False,
            icon_name="Brain",
            created_at=(now - timedelta(days=3)).isoformat()
        ),
        Reminder(
            id="rem-4",
            user_id=DEMO_USER_ID,
            title="Evening Walk in Garden",
            category=ReminderCategory.DAILY_TASK,
            time="05:30 PM",
            dosage_or_detail="15 minutes gentle stroll in the courtyard",
            audio_prompt="Time for your gentle evening courtyard walk.",
            is_completed=False,
            icon_name="Footprints",
            created_at=(now - timedelta(days=3)).isoformat()
        ),
        Reminder(
            id="rem-5",
            user_id=DEMO_USER_ID,
            title="Night Heart Medication & Milk",
            category=ReminderCategory.MEDICINE,
            time="09:00 PM",
            dosage_or_detail="1 tablet with warm milk before sleep",
            audio_prompt="Take your bedtime medicine with warm milk.",
            is_completed=False,
            icon_name="Moon",
            created_at=(now - timedelta(days=5)).isoformat()
        ),
    ]

def get_initial_game_results() -> list[GameResult]:
    now = datetime.now()
    return [
        GameResult(
            id="gr-1",
            user_id=DEMO_USER_ID,
            game_type=GameType.MEMORY_MATCH,
            difficulty=DifficultyLevel.EASY,
            score=95,
            max_score=100,
            attempts=1,
            duration_seconds=34,
            mistakes=1,
            cultural_theme="NER Heritage Icons (Assam Tea, Rhino, Bihu Dhol)",
            completed=True,
            timestamp=(now - timedelta(days=4, hours=2)).isoformat(),
            encouraging_message="Shandar! Wonderful memory recall today!",
            adaptive_next_difficulty=DifficultyLevel.MEDIUM
        ),
        GameResult(
            id="gr-2",
            user_id=DEMO_USER_ID,
            game_type=GameType.SEQUENCE_RECALL,
            difficulty=DifficultyLevel.EASY,
            score=88,
            max_score=100,
            attempts=2,
            duration_seconds=42,
            mistakes=2,
            cultural_theme="Bihu Rhythms & Folk Bells",
            completed=True,
            timestamp=(now - timedelta(days=3, hours=4)).isoformat(),
            encouraging_message="Great rhythm recognition! You're keeping your focus sharp.",
            adaptive_next_difficulty=DifficultyLevel.MEDIUM
        ),
        GameResult(
            id="gr-3",
            user_id=DEMO_USER_ID,
            game_type=GameType.OBJECT_RECOGNITION,
            difficulty=DifficultyLevel.EASY,
            score=92,
            max_score=100,
            attempts=1,
            duration_seconds=28,
            mistakes=1,
            cultural_theme="Daily North East Utensils & Objects (Japi, Xorai)",
            completed=True,
            timestamp=(now - timedelta(days=2, hours=1)).isoformat(),
            encouraging_message="Outstanding! You recognized the Japi and Xorai effortlessly!",
            adaptive_next_difficulty=DifficultyLevel.MEDIUM
        ),
        GameResult(
            id="gr-4",
            user_id=DEMO_USER_ID,
            game_type=GameType.MEMORY_MATCH,
            difficulty=DifficultyLevel.MEDIUM,
            score=90,
            max_score=100,
            attempts=1,
            duration_seconds=46,
            mistakes=2,
            cultural_theme="NER Wildlife & Flora (Hornbill, Orchid, Loktak)",
            completed=True,
            timestamp=(now - timedelta(days=1, hours=3)).isoformat(),
            encouraging_message="Superb job matching North East wildlife cards!",
            adaptive_next_difficulty=DifficultyLevel.MEDIUM
        ),
        GameResult(
            id="gr-5",
            user_id=DEMO_USER_ID,
            game_type=GameType.SEQUENCE_RECALL,
            difficulty=DifficultyLevel.MEDIUM,
            score=84,
            max_score=100,
            attempts=2,
            duration_seconds=50,
            mistakes=3,
            cultural_theme="Cheraw Bamboo Dance Rhythms",
            completed=True,
            timestamp=(now - timedelta(hours=6)).isoformat(),
            encouraging_message="Very well done! Cheraw rhythm sequence was memorized nicely.",
            adaptive_next_difficulty=DifficultyLevel.MEDIUM
        ),
    ]

def get_initial_caregiver_alerts() -> list[CaregiverAlert]:
    now = datetime.now()
    return [
        CaregiverAlert(
            id="alt-1",
            user_id=DEMO_USER_ID,
            alert_type="milestone",
            severity="info",
            message="Bhaben completed 4 consecutive days of cognitive exercises! Streak active.",
            timestamp=(now - timedelta(hours=6)).isoformat(),
            is_resolved=True
        ),
        CaregiverAlert(
            id="alt-2",
            user_id=DEMO_USER_ID,
            alert_type="cognitive_drop",
            severity="warning",
            message="Sequence Recall latency increased by 15% during yesterday evening's session. Recommended: Keep game difficulty at Gentle/Easy.",
            timestamp=(now - timedelta(days=1, hours=2)).isoformat(),
            is_resolved=False
        ),
        CaregiverAlert(
            id="alt-3",
            user_id=DEMO_USER_ID,
            alert_type="missed_reminder",
            severity="info",
            message="Afternoon hydration reminder was completed with voice assistant confirmation.",
            timestamp=(now - timedelta(hours=1)).isoformat(),
            is_resolved=True
        ),
    ]
