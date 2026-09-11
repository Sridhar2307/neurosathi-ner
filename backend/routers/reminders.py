from fastapi import APIRouter, HTTPException, Path
from typing import List, Optional
from models import Reminder, ReminderCreate, ReminderUpdate
from database import db

router = APIRouter(tags=["Reminders"])

@router.get("/reminders", response_model=List[Reminder])
def get_all_reminders(user_id: Optional[str] = None):
    if user_id:
        return db.get_reminders(user_id)
    return list(db.reminders.values())

@router.get("/reminders/{user_id}", response_model=List[Reminder])
def get_user_reminders(user_id: str = Path(..., description="The ID of the user")):
    return db.get_reminders(user_id)

@router.post("/reminders", response_model=Reminder, status_code=201)
def create_reminder(reminder_in: ReminderCreate):
    return db.create_reminder(reminder_in)

@router.put("/reminders/{id}", response_model=Reminder)
def update_reminder(id: str, update_in: ReminderUpdate):
    updated = db.update_reminder(id, update_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return updated

@router.delete("/reminders/{id}")
def delete_reminder(id: str):
    success = db.delete_reminder(id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted successfully", "id": id}
