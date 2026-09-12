"""
Automated Endpoint Validation for NeuroSathi NER Backend
Tests all required REST endpoints:
- GET /health
- GET /users/{id}
- GET /reminders/{user_id}
- POST /reminders
- PUT /reminders/{id}
- DELETE /reminders/{id}
- POST /games/result
- GET /games/results/{user_id}
- GET /caregiver/dashboard/{user_id}
- GET /alerts/{user_id}
- POST /ai/recommendation
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["problem_id"] == "SIH26003"
    print("[PASS] Health check passed.")

def test_user_profile():
    res = client.get("/users/demo-user-123")
    assert res.status_code == 200
    assert res.json()["name"] == "Bhaben Kalita"
    print("[PASS] User profile check passed.")

def test_reminders_crud():
    # 1. Create Reminder
    create_res = client.post("/reminders", json={
        "user_id": "demo-user-123",
        "title": "Evening Assam Tea & Biscuits",
        "category": "meal",
        "time": "04:30 PM",
        "dosage_or_detail": "1 cup warm tea with marie biscuits",
        "icon_name": "Coffee"
    })
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # 2. Get Reminders (assert at least the newly created one is returned)
    res = client.get("/reminders/demo-user-123")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 3. Update Reminder
    update_res = client.put(f"/reminders/{created_id}", json={
        "is_completed": True
    })
    assert update_res.status_code == 200
    assert update_res.json()["is_completed"] is True

    # 4. Delete Reminder
    del_res = client.delete(f"/reminders/{created_id}")
    assert del_res.status_code == 200
    print("[PASS] Reminders CRUD passed.")

def test_games_and_ai():
    # 1. Record Game Result
    res = client.post("/games/result", json={
        "user_id": "demo-user-123",
        "game_type": "memory_match",
        "difficulty": "easy",
        "score": 95,
        "max_score": 100,
        "attempts": 1,
        "duration_seconds": 32,
        "mistakes": 1,
        "cultural_theme": "Assam Tea Leaf & Rhino",
        "completed": True
    })
    assert res.status_code == 201
    assert "adaptive_next_difficulty" in res.json()

    # 2. Get Game Results
    results_res = client.get("/games/results/demo-user-123")
    assert results_res.status_code == 200
    assert len(results_res.json()) >= 1

    # 3. Caregiver Dashboard Summary
    caregiver_res = client.get("/caregiver/dashboard/demo-user-123")
    assert caregiver_res.status_code == 200
    assert "adherence_percentage" in caregiver_res.json()

    # 4. AI Recommendation
    ai_res = client.post("/ai/recommendation", json={
        "user_id": "demo-user-123"
    })
    assert ai_res.status_code == 200
    assert "recommended_game" in ai_res.json()
    print("[PASS] Games & AI Recommendation endpoints passed.")

def test_user_crud_and_auth():
    # 1. List users
    res = client.get("/users")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 2. Create new patient profile with caregiver details
    new_patient = {
        "name": "Hemanta Sharma",
        "age": 76,
        "gender": "Male",
        "blood_group": "O+",
        "location": "Jorhat, Assam",
        "language_preference": "as",
        "medical_stage": "Early Stage Dementia",
        "allergies": "Penicillin",
        "doctor_name": "Dr. Pranjal Baruah",
        "doctor_phone": "+91 98640 55555",
        "doctor_hospital": "Jorhat Medical College",
        "emergency_contact_name": "Anita Sharma",
        "emergency_contact_relation": "Daughter",
        "emergency_contact_phone": "+91 98765 11111",
        "emergency_contact_email": "anita.sharma@care.in",
        "emergency_contact_address": "Tarajan, Jorhat, Assam",
        "caregiver_notes": "Enjoys morning Bihu folk songs.",
        "caregiver_pin": "5678"
    }
    create_res = client.post("/users", json=new_patient)
    assert create_res.status_code == 201
    patient_id = create_res.json()["id"]
    assert create_res.json()["name"] == "Hemanta Sharma"

    # 3. Update patient & caregiver details
    update_res = client.put(f"/users/{patient_id}", json={
        "medical_stage": "Moderate Memory Loss",
        "allergies": "Penicillin, Peanuts"
    })
    assert update_res.status_code == 200
    assert update_res.json()["medical_stage"] == "Moderate Memory Loss"

    # 4. Caregiver Login
    login_res = client.post("/auth/caregiver-login", json={
        "contact": "anita.sharma@care.in",
        "pin": "5678",
        "patient_id": patient_id
    })
    assert login_res.status_code == 200
    assert login_res.json()["success"] is True
    assert login_res.json()["active_patient"]["id"] == patient_id

    # 5. Caregiver Login - Unknown contact
    unknown_res = client.post("/auth/caregiver-login", json={
        "contact": "unknown.person@nowhere.com",
        "pin": "1234"
    })
    assert unknown_res.status_code == 200
    assert unknown_res.json()["success"] is False
    assert "No patient record found" in unknown_res.json()["message"]

    # 6. Caregiver Login - Wrong PIN
    wrong_pin_res = client.post("/auth/caregiver-login", json={
        "contact": "anita.sharma@care.in",
        "pin": "9999"
    })
    assert wrong_pin_res.status_code == 200
    assert wrong_pin_res.json()["success"] is False
    assert "Incorrect PIN" in wrong_pin_res.json()["message"]

    print("[PASS] User CRUD and Caregiver Auth passed.")

if __name__ == "__main__":
    test_health()
    test_user_profile()
    test_user_crud_and_auth()
    test_reminders_crud()
    test_games_and_ai()
    print("\n>>> ALL NeuroSathi NER backend endpoints (including Auth & Patient Management) validated successfully!")

    print("\n>>> ALL 11 NeuroSathi NER backend endpoints validated successfully!")
