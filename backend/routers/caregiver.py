from fastapi import APIRouter, HTTPException, Path
from typing import List
from models import CaregiverDashboardSummary, CaregiverAlert
from database import db

router = APIRouter(tags=["Caregiver Dashboard"])

@router.get("/caregiver/dashboard/{user_id}", response_model=CaregiverDashboardSummary)
def get_caregiver_dashboard(user_id: str = Path(..., description="The ID of the elderly patient")):
    return db.get_caregiver_dashboard(user_id)

@router.get("/alerts/{user_id}", response_model=List[CaregiverAlert])
def get_alerts_for_user(user_id: str = Path(..., description="The ID of the elderly patient")):
    return db.get_alerts(user_id)
