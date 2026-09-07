from fastapi import APIRouter
from models import AIRecommendationRequest, AIRecommendationResponse
from database import db
from ai_engine import generate_ai_recommendation

router = APIRouter(tags=["AI Personalization"])

@router.post("/ai/recommendation", response_model=AIRecommendationResponse)
def get_ai_recommendation(req: AIRecommendationRequest):
    recent_games = db.get_game_results(req.user_id)
    reminders = db.get_reminders(req.user_id)
    missed_count = len([r for r in reminders if not r.is_completed])
    
    return generate_ai_recommendation(
        user_id=req.user_id,
        recent_game_results=recent_games,
        missed_reminders_count=missed_count
    )
