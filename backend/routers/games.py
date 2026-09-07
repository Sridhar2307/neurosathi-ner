from fastapi import APIRouter, HTTPException, Path
from typing import List
from models import GameResult, GameResultCreate
from database import db

router = APIRouter(tags=["Cognitive Games"])

@router.post("/games/result", response_model=GameResult, status_code=201)
def record_game_result(result_in: GameResultCreate):
    return db.add_game_result(result_in)

@router.get("/games/results/{user_id}", response_model=List[GameResult])
def get_user_game_results(user_id: str = Path(..., description="The ID of the user")):
    return db.get_game_results(user_id)
