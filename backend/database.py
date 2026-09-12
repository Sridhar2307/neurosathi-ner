import os
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

import hashlib

from models import (
    UserProfile, UserProfileCreate, UserProfileUpdate,
    CaregiverLoginRequest, CaregiverLoginResponse,
    DevicePairRequest, DevicePairResponse, PatientSessionCheckResponse,
    Reminder, ReminderCreate, ReminderUpdate,
    GameResult, GameResultCreate, CaregiverAlert,
    CaregiverDashboardSummary, DifficultyLevel, GameType
)
from seed_data import (
    get_initial_user, get_initial_lakshmi, get_initial_reminders,
    get_initial_game_results, get_initial_caregiver_alerts,
    DEMO_USER_ID, LAKSHMI_USER_ID
)
from ai_engine import calculate_adaptive_difficulty, generate_encouraging_message, generate_ai_recommendation

# Supabase configuration (optional for live cloud sync)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

ID_TO_UUID = {
    DEMO_USER_ID: "e0000000-0000-0000-0000-000000000002",
    LAKSHMI_USER_ID: "e0000000-0000-0000-0000-000000000001",
}
UUID_TO_ID = {
    "e0000000-0000-0000-0000-000000000002": DEMO_USER_ID,
    "e0000000-0000-0000-0000-000000000001": LAKSHMI_USER_ID,
}

def to_uuid(uid: str) -> str:
    if not uid:
        return "e0000000-0000-0000-0000-000000000002"
    if uid in ID_TO_UUID:
        return ID_TO_UUID[uid]
    import uuid
    try:
        uuid.UUID(str(uid))
        return str(uid)
    except Exception:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(uid)))

def from_uuid(uuid_str: str) -> str:
    return UUID_TO_ID.get(str(uuid_str), str(uuid_str))

import re

def extract_pin_and_address(raw_address: Optional[str], fallback_pin: str = "1234") -> tuple[str, str]:
    if not raw_address:
        return ("Guwahati, Assam", fallback_pin)
    match = re.search(r'\[PIN:([a-zA-Z0-9]+)\]', raw_address)
    pin = match.group(1) if match else fallback_pin
    clean_address = re.sub(r'\s*\[PIN:[a-zA-Z0-9]+\]', '', raw_address).strip()
    return (clean_address or "Guwahati, Assam", pin)

def format_address_with_pin(address: Optional[str], pin: str = "1234") -> str:
    clean = re.sub(r'\s*\[PIN:[a-zA-Z0-9]+\]', '', address or "Guwahati, Assam").strip()
    safe_pin = str(pin or "1234").strip()
    return f"{clean} [PIN:{safe_pin}]"

supabase = None
if SUPABASE_URL and SUPABASE_ANON_KEY and "http" in SUPABASE_URL:
    try:
        from supabase import create_client, Client
        supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("Connected to Supabase PostgreSQL Database.")
    except Exception as e:
        print(f"Supabase connection notice (falling back to hybrid local store): {e}")
        supabase = None

class HybridDatabase:
    def __init__(self):
        lakshmi = get_initial_lakshmi()
        bhaben = get_initial_user()
        self.users: Dict[str, UserProfile] = {
            LAKSHMI_USER_ID: lakshmi,
            DEMO_USER_ID: bhaben
        }
        self.devices: Dict[str, Dict[str, Any]] = {
            "NS-DEV-LAKSHMI-01": {
                "device_identifier": "NS-DEV-LAKSHMI-01",
                "patient_id": LAKSHMI_USER_ID,
                "device_name": "Lakshmi Living Room Tablet",
                "paired_at": datetime.now().isoformat(),
                "active": True,
                "pin_enabled": False,
                "hashed_pin": hashlib.sha256("1234".encode()).hexdigest()
            }
        }
        self.reminders: Dict[str, Reminder] = {r.id: r for r in get_initial_reminders()}
        # Add starter reminder for Lakshmi
        lakshmi_rem = Reminder(
            id="rem-lakshmi-1",
            user_id=LAKSHMI_USER_ID,
            title="Morning Herbal Tea & Blood Pressure Tablet",
            category="medicine",
            time="08:30 AM",
            dosage_or_detail="1 tablet with fresh morning tea",
            audio_prompt="Lakshmi, time for your morning tea and medication.",
            is_completed=True,
            completed_at=datetime.now().isoformat(),
            icon_name="Pill",
            created_at=datetime.now().isoformat()
        )
        self.reminders[lakshmi_rem.id] = lakshmi_rem
        self.game_results: List[GameResult] = get_initial_game_results()
        self.alerts: List[CaregiverAlert] = get_initial_caregiver_alerts()
        self.activity_logs: List[Dict[str, Any]] = [
            {"id": "log-1", "user_id": LAKSHMI_USER_ID, "action": "Device Paired for Lakshmi Devi", "category": "device", "timestamp": "08:00 AM", "status": "completed"},
            {"id": "log-2", "user_id": LAKSHMI_USER_ID, "action": "Completed Morning Herbal Tea & BP Tablet", "category": "health", "timestamp": "08:32 AM", "status": "completed"},
            {"id": "log-3", "user_id": DEMO_USER_ID, "action": "Played Memory Match (Easy) - Score: 95%", "category": "game", "timestamp": "10:15 AM", "status": "completed"},
            {"id": "log-4", "user_id": DEMO_USER_ID, "action": "Drank Fresh Copper Glass Water", "category": "hydration", "timestamp": "11:02 AM", "status": "completed"},
            {"id": "log-5", "user_id": DEMO_USER_ID, "action": "Voice Query: 'What are my afternoon tasks?'", "category": "voice", "timestamp": "01:20 PM", "status": "completed"},
        ]

        # Sync live data from Supabase if connected
        if supabase:
            try:
                # 1. Sync profiles
                p_res = supabase.table("profiles").select("*").execute()
                for row in p_res.data:
                    app_uid = from_uuid(row.get("id"))
                    clean_addr, c_pin = extract_pin_and_address(row.get("emergency_contact_address"), "1234")
                    self.users[app_uid] = UserProfile(
                        id=app_uid,
                        name=row.get("name", "Patient"),
                        email=row.get("emergency_contact_email") or f"{app_uid}@neurosathi.in",
                        role=row.get("role", "elder"),
                        age=row.get("age", 74),
                        gender=row.get("gender", "Female"),
                        blood_group=row.get("blood_group", "O+"),
                        location=row.get("location", "Guwahati, Assam"),
                        language_preference=row.get("preferred_language", "en"),
                        medical_stage=row.get("medical_stage", "Early-stage Dementia / MCI"),
                        allergies=row.get("allergies", "None reported"),
                        doctor_name=row.get("doctor_name", "Dr. Anupam Sarma (Neurologist)"),
                        doctor_phone=row.get("doctor_phone", "+91 98640 12345"),
                        doctor_hospital=row.get("doctor_hospital", "Guwahati Neurological Center, Assam"),
                        emergency_contact_name=row.get("emergency_contact_name", "Primary Caregiver"),
                        emergency_contact_relation=row.get("emergency_contact_relation", "Family"),
                        emergency_contact_phone=row.get("emergency_contact_phone", "+91 98765 43210"),
                        emergency_contact_email=row.get("emergency_contact_email", "caregiver@neurosathi.in"),
                        emergency_contact_address=clean_addr,
                        current_streak=row.get("streak_count", 4),
                        total_stars=row.get("total_stars", 56),
                        caregiver_pin=c_pin,
                        created_at=row.get("created_at", datetime.now().isoformat()),
                        avatar_url=row.get("avatar_url", "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80")
                    )

                # 2. Sync reminders
                r_res = supabase.table("reminders").select("*").execute()
                for rem_row in r_res.data:
                    rem_id = rem_row.get("id")
                    app_uid = from_uuid(rem_row.get("user_id"))
                    self.reminders[rem_id] = Reminder(
                        id=rem_id,
                        user_id=app_uid,
                        title=rem_row.get("title", ""),
                        category=rem_row.get("category", "medicine"),
                        time=rem_row.get("time_schedule", "08:30 AM"),
                        dosage_or_detail=rem_row.get("dosage_or_detail", ""),
                        audio_prompt=rem_row.get("audio_prompt", ""),
                        is_completed=rem_row.get("is_completed", False),
                        icon_name=rem_row.get("icon_name", "Pill"),
                        completed_at=rem_row.get("completed_at"),
                        created_at=rem_row.get("created_at", datetime.now().isoformat())
                    )

                print(f"Supabase sync active: {len(self.users)} profiles, {len(self.reminders)} reminders loaded.")
            except Exception as e:
                print(f"Supabase load notice: {e}")

    def is_supabase_connected(self) -> bool:
        return supabase is not None

    # --- User & Patient Profile Methods ---
    def get_user(self, user_id: str) -> Optional[UserProfile]:
        if user_id not in self.users and user_id == DEMO_USER_ID:
            self.users[DEMO_USER_ID] = get_initial_user()
        return self.users.get(user_id)

    def get_all_users(self) -> List[UserProfile]:
        if DEMO_USER_ID not in self.users:
            self.users[DEMO_USER_ID] = get_initial_user()
        return list(self.users.values())

    def create_user(self, profile_in: UserProfileCreate) -> UserProfile:
        import uuid
        import re
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', profile_in.name.strip().lower())
        new_id = f"patient-{slug[:16]}-{str(uuid.uuid4())[:6]}"
        
        new_user = UserProfile(
            id=new_id,
            name=profile_in.name,
            email=profile_in.email or f"{slug[:10]}@neurosathi.in",
            role=profile_in.role,
            age=profile_in.age,
            gender=profile_in.gender,
            blood_group=profile_in.blood_group,
            location=profile_in.location,
            language_preference=profile_in.language_preference or "en",
            medical_stage=profile_in.medical_stage or "Early-stage Dementia / MCI",
            allergies=profile_in.allergies or "None reported",
            doctor_name=profile_in.doctor_name,
            doctor_phone=profile_in.doctor_phone,
            doctor_hospital=profile_in.doctor_hospital,
            emergency_contact_name=profile_in.emergency_contact_name,
            emergency_contact_relation=profile_in.emergency_contact_relation,
            emergency_contact_phone=profile_in.emergency_contact_phone,
            emergency_contact_email=profile_in.emergency_contact_email,
            emergency_contact_address=profile_in.emergency_contact_address,
            caregiver_notes=profile_in.caregiver_notes,
            caregiver_pin=profile_in.caregiver_pin or "1234",
            created_at=datetime.now().isoformat(),
            current_streak=1,
            total_stars=10,
            avatar_url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
        )
        self.users[new_id] = new_user

        # Create starter default reminder for new patient
        starter_reminder = Reminder(
            id=f"rem-{str(uuid.uuid4())[:8]}",
            user_id=new_id,
            title="Drink Fresh Water",
            category="water",
            time="10:00 AM",
            dosage_or_detail="1 glass of water to stay hydrated",
            audio_prompt="Time to drink a refreshing glass of water.",
            is_completed=False,
            icon_name="Droplet",
            created_at=datetime.now().isoformat()
        )
        self.reminders[starter_reminder.id] = starter_reminder

        # Sync to Supabase
        if supabase:
            try:
                enc_addr = format_address_with_pin(new_user.emergency_contact_address or new_user.location, new_user.caregiver_pin)
                supabase.table("profiles").upsert({
                    "id": to_uuid(new_id),
                    "name": new_user.name,
                    "role": new_user.role,
                    "preferred_language": new_user.language_preference,
                    "age": new_user.age,
                    "gender": new_user.gender,
                    "blood_group": new_user.blood_group,
                    "location": new_user.location,
                    "medical_stage": new_user.medical_stage,
                    "emergency_contact_name": new_user.emergency_contact_name,
                    "emergency_contact_phone": new_user.emergency_contact_phone,
                    "emergency_contact_email": new_user.emergency_contact_email,
                    "emergency_contact_address": enc_addr,
                    "streak_count": new_user.current_streak,
                    "total_stars": new_user.total_stars
                }).execute()
            except Exception as e:
                print(f"Supabase create user error: {e}")

        return new_user

    def update_user(self, user_id: str, update_in: UserProfileUpdate) -> Optional[UserProfile]:
        user = self.get_user(user_id)
        if not user:
            return None
        
        user_data = user.model_dump()
        for field, val in update_in.model_dump(exclude_unset=True).items():
            if val is not None:
                user_data[field] = val
        
        updated_user = UserProfile(**user_data)
        self.users[user_id] = updated_user

        # Sync to Supabase
        if supabase:
            try:
                supa_update = {}
                if update_in.name is not None: supa_update["name"] = update_in.name
                if update_in.age is not None: supa_update["age"] = update_in.age
                if update_in.gender is not None: supa_update["gender"] = update_in.gender
                if update_in.blood_group is not None: supa_update["blood_group"] = update_in.blood_group
                if update_in.location is not None: supa_update["location"] = update_in.location
                if update_in.language_preference is not None: supa_update["preferred_language"] = update_in.language_preference
                if update_in.medical_stage is not None: supa_update["medical_stage"] = update_in.medical_stage
                if update_in.allergies is not None: supa_update["allergies"] = update_in.allergies
                if update_in.doctor_name is not None: supa_update["doctor_name"] = update_in.doctor_name
                if update_in.doctor_phone is not None: supa_update["doctor_phone"] = update_in.doctor_phone
                if update_in.doctor_hospital is not None: supa_update["doctor_hospital"] = update_in.doctor_hospital
                if update_in.emergency_contact_name is not None: supa_update["emergency_contact_name"] = update_in.emergency_contact_name
                if update_in.emergency_contact_relation is not None: supa_update["emergency_contact_relation"] = update_in.emergency_contact_relation
                if update_in.emergency_contact_phone is not None: supa_update["emergency_contact_phone"] = update_in.emergency_contact_phone
                if update_in.emergency_contact_email is not None: supa_update["emergency_contact_email"] = update_in.emergency_contact_email
                if update_in.emergency_contact_address is not None or update_in.caregiver_pin is not None:
                    c_pin = update_in.caregiver_pin or user.caregiver_pin or "1234"
                    c_addr = update_in.emergency_contact_address or user.emergency_contact_address or user.location or "Guwahati, Assam"
                    supa_update["emergency_contact_address"] = format_address_with_pin(c_addr, c_pin)
                if supa_update:
                    supabase.table("profiles").update(supa_update).eq("id", to_uuid(user_id)).execute()
            except Exception as e:
                print(f"Supabase update user error: {e}")

        return updated_user

    def pair_device(self, req: DevicePairRequest) -> DevicePairResponse:
        patient = self.get_user(req.patient_id)
        if not patient:
            patient = self.get_user(LAKSHMI_USER_ID) or get_initial_lakshmi()
        
        hashed_pin = hashlib.sha256(req.pin.encode()).hexdigest() if req.pin else None
        device_entry = {
            "device_identifier": req.device_identifier,
            "patient_id": patient.id,
            "device_name": req.device_name or f"{patient.name}'s Tablet",
            "paired_at": datetime.now().isoformat(),
            "active": True,
            "pin_enabled": bool(req.pin),
            "hashed_pin": hashed_pin
        }
        self.devices[req.device_identifier] = device_entry
        
        # Log pairing event
        import uuid
        self.activity_logs.insert(0, {
            "id": f"log-{str(uuid.uuid4())[:8]}",
            "user_id": patient.id,
            "action": f"Paired device '{device_entry['device_name']}'",
            "category": "device",
            "timestamp": datetime.now().strftime("%I:%M %p"),
            "status": "completed"
        })

        return DevicePairResponse(
            success=True,
            message=f"Device paired successfully with {patient.name}.",
            patient=patient,
            device_identifier=req.device_identifier,
            paired_at=device_entry["paired_at"],
            pin_enabled=device_entry["pin_enabled"]
        )

    def get_device_session(self, device_identifier: str) -> PatientSessionCheckResponse:
        dev = self.devices.get(device_identifier)
        if not dev or not dev.get("active"):
            return PatientSessionCheckResponse(paired=False)
        
        patient = self.get_user(dev["patient_id"])
        return PatientSessionCheckResponse(
            paired=True,
            patient=patient,
            pin_enabled=dev.get("pin_enabled", False),
            device_name=dev.get("device_name")
        )

    def unpair_device(self, device_identifier: str) -> bool:
        if device_identifier in self.devices:
            self.devices[device_identifier]["active"] = False
            del self.devices[device_identifier]
            return True
        return False

    def reset_demo_pairing(self) -> bool:
        self.devices = {
            "NS-DEV-LAKSHMI-01": {
                "device_identifier": "NS-DEV-LAKSHMI-01",
                "patient_id": LAKSHMI_USER_ID,
                "device_name": "Lakshmi Living Room Tablet",
                "paired_at": datetime.now().isoformat(),
                "active": True,
                "pin_enabled": False,
                "hashed_pin": hashlib.sha256("1234".encode()).hexdigest()
            }
        }
        return True

    def authenticate_caregiver(self, req: CaregiverLoginRequest) -> CaregiverLoginResponse:
        # Sync latest profiles from Supabase if connected
        if supabase:
            try:
                p_res = supabase.table("profiles").select("*").execute()
                for row in p_res.data:
                    app_uid = from_uuid(row.get("id"))
                    clean_addr, c_pin = extract_pin_and_address(row.get("emergency_contact_address"), "1234")
                    self.users[app_uid] = UserProfile(
                        id=app_uid,
                        name=row.get("name", "Patient"),
                        email=row.get("emergency_contact_email") or f"{app_uid}@neurosathi.in",
                        role=row.get("role", "elder"),
                        age=row.get("age", 74),
                        gender=row.get("gender", "Female"),
                        blood_group=row.get("blood_group", "O+"),
                        location=row.get("location", "Guwahati, Assam"),
                        language_preference=row.get("preferred_language", "en"),
                        medical_stage=row.get("medical_stage", "Early-stage Dementia / MCI"),
                        allergies=row.get("allergies", "None reported"),
                        doctor_name=row.get("doctor_name", "Dr. Anupam Sarma (Neurologist)"),
                        doctor_phone=row.get("doctor_phone", "+91 98640 12345"),
                        doctor_hospital=row.get("doctor_hospital", "Guwahati Neurological Center, Assam"),
                        emergency_contact_name=row.get("emergency_contact_name", "Primary Caregiver"),
                        emergency_contact_relation=row.get("emergency_contact_relation", "Family"),
                        emergency_contact_phone=row.get("emergency_contact_phone", "+91 98765 43210"),
                        emergency_contact_email=row.get("emergency_contact_email", "caregiver@neurosathi.in"),
                        emergency_contact_address=clean_addr,
                        current_streak=row.get("streak_count", 4),
                        total_stars=row.get("total_stars", 56),
                        caregiver_pin=c_pin,
                        created_at=row.get("created_at", datetime.now().isoformat()),
                        avatar_url=row.get("avatar_url", "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80")
                    )
            except Exception as e:
                print(f"Supabase caregiver auth sync notice: {e}")

        all_users = self.get_all_users()
        email_or_contact = (req.email or req.contact or "demo").strip()
        
        clean_alnum = lambda s: "".join(ch for ch in (s or "").lower() if ch.isalnum())
        clean_digits = lambda s: "".join(ch for ch in (s or "") if ch.isdigit())

        c_clean = clean_alnum(email_or_contact)
        c_digits = clean_digits(email_or_contact)
        req_pin = str(req.pin or "").strip()

        # Match by caregiver email, phone digits, or PIN
        matched = []
        for u in all_users:
            u_phone_digits = clean_digits(u.emergency_contact_phone)
            u_email = (u.emergency_contact_email or '').lower().strip()
            u_pin = str(u.caregiver_pin or '').strip()

            phone_match = bool(
                c_digits and u_phone_digits and (
                    u_phone_digits == c_digits or
                    u_phone_digits.endswith(c_digits) or
                    c_digits.endswith(u_phone_digits)
                )
            )
            email_match = bool(u_email and u_email == email_or_contact.lower())
            pin_match = bool(u_pin and (u_pin == c_clean or (req_pin and u_pin == req_pin and req_pin != '1234')))
            if phone_match or email_match:
                matched.append(u)
        
        if not matched:
            return CaregiverLoginResponse(
                success=False,
                message="No patient record found matching the entered contact.",
                caregiver=None,
                active_patient=None,
                all_patients=[]
            )

        # Select requested patient or default to the matched patient
        active_patient = None
        if req.patient_id:
            active_patient = next((u for u in matched if u.id == req.patient_id), None)
        if not active_patient and matched:
            active_patient = matched[0]
        if not active_patient:
            return CaregiverLoginResponse(
                success=False,
                message="No active patient found for this account.",
                caregiver=None,
                active_patient=None,
                all_patients=[]
            )

        # Check PIN if provided
        if req.pin:
            entered_pin = str(req.pin).strip()
            stored_pin = str(active_patient.caregiver_pin or "").strip()
            if stored_pin and entered_pin != stored_pin:
                return CaregiverLoginResponse(
                    success=False,
                    message="Incorrect PIN entered for this caregiver account.",
                    caregiver=None,
                    active_patient=None,
                    all_patients=[]
                )

        caregiver_info = {
            "name": active_patient.emergency_contact_name or "Dr. Priya Sharma",
            "relation": active_patient.emergency_contact_relation or "Primary Caregiver",
            "phone": active_patient.emergency_contact_phone or "+91 98765 43210",
            "email": active_patient.emergency_contact_email or email_or_contact,
            "role": "caregiver"
        }

        # Strictly return only patients belonging to this caregiver, never all users
        my_patients = [u for u in matched if u.role != "caregiver"] if matched else [active_patient]
        if not my_patients:
            my_patients = [active_patient]

        return CaregiverLoginResponse(
            success=True,
            message="Caregiver authenticated successfully.",
            caregiver=caregiver_info,
            active_patient=active_patient,
            all_patients=my_patients
        )

    # --- Reminder Methods ---
    def get_reminders(self, user_id: str) -> List[Reminder]:
        return [r for r in self.reminders.values() if r.user_id == user_id]

    def create_reminder(self, reminder_in: ReminderCreate) -> Reminder:
        import uuid
        new_id = f"rem-{str(uuid.uuid4())[:8]}"
        now_str = datetime.now().isoformat()
        new_reminder = Reminder(
            id=new_id,
            user_id=reminder_in.user_id,
            title=reminder_in.title,
            category=reminder_in.category,
            time=reminder_in.time,
            dosage_or_detail=reminder_in.dosage_or_detail,
            audio_prompt=reminder_in.audio_prompt or f"Reminder for {reminder_in.title}",
            is_completed=reminder_in.is_completed,
            icon_name=reminder_in.icon_name or "Bell",
            created_at=now_str
        )
        self.reminders[new_id] = new_reminder
        
        # Add to activity logs
        self.activity_logs.insert(0, {
            "id": f"log-{str(uuid.uuid4())[:8]}",
            "user_id": reminder_in.user_id,
            "action": f"Created Reminder: {reminder_in.title} at {reminder_in.time}",
            "category": "reminder",
            "timestamp": datetime.now().strftime("%I:%M %p"),
            "status": "pending"
        })

        # Sync to Supabase
        if supabase:
            try:
                valid_cat = reminder_in.category if reminder_in.category in ['medicine', 'water', 'appointment', 'daily_task', 'meal'] else 'daily_task'
                supabase.table("reminders").insert({
                    "id": to_uuid(new_id),
                    "user_id": to_uuid(reminder_in.user_id),
                    "title": reminder_in.title,
                    "category": valid_cat,
                    "time_schedule": reminder_in.time,
                    "dosage_or_detail": reminder_in.dosage_or_detail or "",
                    "audio_prompt": reminder_in.audio_prompt or f"Reminder for {reminder_in.title}",
                    "icon_name": reminder_in.icon_name or "Bell",
                    "is_completed": reminder_in.is_completed or False
                }).execute()
            except Exception as e:
                print(f"Supabase reminder create error: {e}")

        return new_reminder

    def update_reminder(self, reminder_id: str, update_in: ReminderUpdate) -> Optional[Reminder]:
        if reminder_id not in self.reminders:
            return None
        current = self.reminders[reminder_id]
        updated_data = current.model_dump()
        for field, value in update_in.model_dump(exclude_unset=True).items():
            if value is not None:
                updated_data[field] = value
        
        if update_in.is_completed is True and not updated_data.get("completed_at"):
            updated_data["completed_at"] = datetime.now().isoformat()
            
        updated_reminder = Reminder(**updated_data)
        self.reminders[reminder_id] = updated_reminder

        # Log completion
        if update_in.is_completed:
            import uuid
            self.activity_logs.insert(0, {
                "id": f"log-{str(uuid.uuid4())[:8]}",
                "user_id": updated_reminder.user_id,
                "action": f"Completed: {updated_reminder.title}",
                "category": "reminder_done",
                "timestamp": datetime.now().strftime("%I:%M %p"),
                "status": "completed"
            })
            # Increase stars for elder
            if updated_reminder.user_id in self.users:
                self.users[updated_reminder.user_id].total_stars += 2

        # Sync to Supabase
        if supabase:
            try:
                supa_r_update = {}
                if update_in.title is not None: supa_r_update["title"] = update_in.title
                if update_in.time is not None: supa_r_update["time_schedule"] = update_in.time
                if update_in.dosage_or_detail is not None: supa_r_update["dosage_or_detail"] = update_in.dosage_or_detail
                if update_in.is_completed is not None: supa_r_update["is_completed"] = update_in.is_completed
                if updated_data.get("completed_at"): supa_r_update["completed_at"] = updated_data["completed_at"]
                if supa_r_update:
                    supabase.table("reminders").update(supa_r_update).eq("id", to_uuid(reminder_id)).execute()
            except Exception as e:
                print(f"Supabase reminder update error: {e}")

        return updated_reminder

    def delete_reminder(self, reminder_id: str) -> bool:
        if reminder_id in self.reminders:
            del self.reminders[reminder_id]
            if supabase:
                try:
                    supabase.table("reminders").delete().eq("id", to_uuid(reminder_id)).execute()
                except Exception as e:
                    print(f"Supabase reminder delete error: {e}")
            return True
        return False

    # --- Game Results Methods ---
    def add_game_result(self, result_in: GameResultCreate) -> GameResult:
        import uuid
        new_id = f"gr-{str(uuid.uuid4())[:8]}"
        now_str = datetime.now().isoformat()
        
        encouragement = generate_encouraging_message(result_in.game_type, result_in.score)
        next_diff = calculate_adaptive_difficulty(result_in.score, result_in.mistakes, result_in.difficulty)
        
        new_result = GameResult(
            id=new_id,
            user_id=result_in.user_id,
            game_type=result_in.game_type,
            difficulty=result_in.difficulty,
            score=result_in.score,
            max_score=result_in.max_score,
            attempts=result_in.attempts,
            duration_seconds=result_in.duration_seconds,
            mistakes=result_in.mistakes,
            cultural_theme=result_in.cultural_theme or "NER Heritage",
            completed=result_in.completed,
            timestamp=now_str,
            encouraging_message=encouragement,
            adaptive_next_difficulty=next_diff
        )
        self.game_results.insert(0, new_result)
        
        # Update user stars
        if result_in.user_id in self.users:
            earned_stars = 5 if result_in.score >= 80 else 3
            self.users[result_in.user_id].total_stars += earned_stars

        # Activity log
        self.activity_logs.insert(0, {
            "id": f"log-{str(uuid.uuid4())[:8]}",
            "user_id": result_in.user_id,
            "action": f"Played {result_in.game_type.replace('_', ' ').title()} - Score: {result_in.score}%",
            "category": "game",
            "timestamp": datetime.now().strftime("%I:%M %p"),
            "status": "completed"
        })

        # Sync to Supabase
        if supabase:
            try:
                g_slug = result_in.game_type.value if hasattr(result_in.game_type, 'value') else str(result_in.game_type)
                g_diff = result_in.difficulty.value if hasattr(result_in.difficulty, 'value') else str(result_in.difficulty)
                supabase.table("game_results").insert({
                    "id": to_uuid(new_id),
                    "user_id": to_uuid(result_in.user_id),
                    "game_slug": g_slug,
                    "difficulty": g_diff,
                    "score": result_in.score,
                    "max_score": result_in.max_score,
                    "attempts": result_in.attempts,
                    "duration_seconds": result_in.duration_seconds,
                    "mistakes": result_in.mistakes,
                    "completed": result_in.completed,
                    "cultural_theme": result_in.cultural_theme or "NER Heritage",
                    "encouraging_message": encouragement,
                    "adaptive_next_difficulty": next_diff
                }).execute()
                
                # Update user stars in Supabase
                u_profile = self.users.get(result_in.user_id)
                if u_profile:
                    supabase.table("profiles").update({"total_stars": u_profile.total_stars}).eq("id", to_uuid(result_in.user_id)).execute()
            except Exception as e:
                print(f"Supabase game result insert error: {e}")

        return new_result

    def get_game_results(self, user_id: str) -> List[GameResult]:
        return [r for r in self.game_results if r.user_id == user_id]

    # --- Alerts & Caregiver Summary ---
    def get_alerts(self, user_id: str) -> List[CaregiverAlert]:
        return [a for a in self.alerts if a.user_id == user_id]

    def get_caregiver_dashboard(self, user_id: str) -> CaregiverDashboardSummary:
        user = self.get_user(user_id) or get_initial_user()
        user_reminders = self.get_reminders(user_id)
        user_games = self.get_game_results(user_id)
        user_alerts = self.get_alerts(user_id)

        completed_reminders = [r for r in user_reminders if r.is_completed]
        adherence = int((len(completed_reminders) / max(len(user_reminders), 1)) * 100)
        missed = len([r for r in user_reminders if not r.is_completed])

        avg_score = int(sum([g.score for g in user_games]) / max(len(user_games), 1)) if user_games else 85
        trend = "Improving" if avg_score >= 88 else ("Stable" if avg_score >= 70 else "Needs Attention")

        score_history_by_game = {
            "Memory Match": [g.score for g in user_games if g.game_type == GameType.MEMORY_MATCH][:6] or [90, 92, 95],
            "Sequence Recall": [g.score for g in user_games if g.game_type == GameType.SEQUENCE_RECALL][:6] or [82, 85, 88],
            "Object Recognition": [g.score for g in user_games if g.game_type == GameType.OBJECT_RECOGNITION][:6] or [90, 94, 92],
        }

        return CaregiverDashboardSummary(
            patient_profile=user,
            today_activity_count=len([l for l in self.activity_logs if l.get("user_id") == user_id]),
            adherence_percentage=adherence,
            average_cognitive_score=avg_score,
            cognitive_trend=trend,
            recent_game_scores=user_games[:5],
            today_reminders=user_reminders,
            missed_reminders_count=missed,
            active_alerts=user_alerts,
            recent_activity_timeline=self.activity_logs[:8],
            score_history_by_game=score_history_by_game
        )

# Global database instance
db = HybridDatabase()
