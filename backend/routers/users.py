from fastapi import APIRouter, HTTPException, Path, Body
from typing import List
from models import (
    UserProfile, UserProfileCreate, UserProfileUpdate,
    CaregiverLoginRequest, CaregiverLoginResponse,
    DevicePairRequest, DevicePairResponse, PatientSessionCheckResponse
)
from database import db

router = APIRouter(tags=["Users & Caregiver Auth"])

@router.get("/users", response_model=List[UserProfile])
def list_users():
    """List all registered patients and profiles."""
    return db.get_all_users()

@router.post("/users", response_model=UserProfile, status_code=201)
def create_patient_profile(profile: UserProfileCreate):
    """Register a new patient profile along with caregiver details."""
    return db.create_user(profile)

@router.get("/users/{id}", response_model=UserProfile)
def get_user_profile(id: str = Path(..., description="User / Patient ID")):
    user = db.get_user(id)
    if not user:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return user

@router.put("/users/{id}", response_model=UserProfile)
def update_user_profile(id: str = Path(..., description="User / Patient ID"), updates: UserProfileUpdate = Body(...)):
    """Update patient medical details and caregiver contact details."""
    updated = db.update_user(id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient profile not found to update")
    return updated

@router.post("/auth/caregiver-login", response_model=CaregiverLoginResponse)
def caregiver_login(payload: CaregiverLoginRequest):
    """Authenticate caregiver session and return linked patient profiles."""
    return db.authenticate_caregiver(payload)

# --- Device Pairing Endpoints for Elderly Patient Auth ---
@router.post("/devices/pair", response_model=DevicePairResponse)
def pair_patient_device(payload: DevicePairRequest):
    """Pair a patient device/tablet from Caregiver Dashboard."""
    return db.pair_device(payload)

@router.get("/devices/session/{identifier}", response_model=PatientSessionCheckResponse)
def check_device_session(identifier: str = Path(..., description="Device Identifier")):
    """Check if device is paired and retrieve patient profile."""
    return db.get_device_session(identifier)

@router.delete("/devices/pair/{identifier}")
def unpair_patient_device(identifier: str = Path(..., description="Device Identifier")):
    """Unpair a device identifier."""
    success = db.unpair_device(identifier)
    return {"success": success, "message": "Device unpaired" if success else "Device not found"}

@router.post("/devices/reset-demo")
def reset_demo_device():
    """Reset device pairing back to demo Lakshmi pairing."""
    db.reset_demo_pairing()
    return {"success": True, "message": "Demo device pairing reset to Lakshmi Devi"}

