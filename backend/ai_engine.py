from models import GameType, DifficultyLevel, GameResultCreate, AIRecommendationResponse
from typing import List, Optional

def calculate_adaptive_difficulty(score: int, mistakes: int, current_difficulty: DifficultyLevel) -> DifficultyLevel:
    """
    Adaptive Difficulty Heuristic:
    - If score >= 85 and mistakes <= 2: Increase difficulty (Easy -> Medium -> Hard)
    - If score < 60 or mistakes >= 5: Decrease difficulty (Hard -> Medium -> Easy)
    - Otherwise maintain current difficulty
    """
    if score >= 85 and mistakes <= 2:
        if current_difficulty == DifficultyLevel.EASY:
            return DifficultyLevel.MEDIUM
        elif current_difficulty == DifficultyLevel.MEDIUM:
            return DifficultyLevel.HARD
        return DifficultyLevel.HARD
    elif score < 60 or mistakes >= 5:
        if current_difficulty == DifficultyLevel.HARD:
            return DifficultyLevel.MEDIUM
        elif current_difficulty == DifficultyLevel.MEDIUM:
            return DifficultyLevel.EASY
        return DifficultyLevel.EASY
    
    return current_difficulty

def generate_encouraging_message(game_type: GameType, score: int, language: str = "en") -> str:
    if score >= 90:
        return "Shandar! Exceptional memory recall and focus! You did brilliantly today."
    elif score >= 75:
        return "Wonderful effort! Your mind is active and agile. Great job!"
    elif score >= 50:
        return "Very good try! Daily practice keeps the mind fresh and happy."
    else:
        return "Great participation! Taking part in these exercises is the true victory. Keep smiling!"

def generate_ai_recommendation(
    user_id: str,
    recent_game_results: List[Any],
    missed_reminders_count: int = 0
) -> AIRecommendationResponse:
    """
    Deterministic AI Personalization Engine for SIH 2026:
    Analyzes historical cognitive engagement across Visual Memory, Sequence Processing, and Cultural Recognition.
    """
    if not recent_game_results:
        return AIRecommendationResponse(
            user_id=user_id,
            recommended_game=GameType.MEMORY_MATCH,
            recommended_game_name="North East Heritage Match",
            recommended_difficulty=DifficultyLevel.EASY,
            reasoning="Starting with familiar cultural imagery (Assam tea leaves, Rhinos, and Bihu symbols) provides a comforting, low-stress cognitive warm-up.",
            caregiver_note="Initiating gentle visual recognition routine for the morning session.",
            encouraging_voice_message="Good day! Today, let's explore beautiful pictures of North East heritage in the Memory Match game."
        )

    # Analyze scores by game type
    scores_by_type = {}
    for res in recent_game_results:
        gtype = res.game_type if hasattr(res, 'game_type') else res.get('game_type')
        score = res.score if hasattr(res, 'score') else res.get('score', 80)
        if gtype not in scores_by_type:
            scores_by_type[gtype] = []
        scores_by_type[gtype].append(score)

    avg_memory = sum(scores_by_type.get(GameType.MEMORY_MATCH, [80])) / max(len(scores_by_type.get(GameType.MEMORY_MATCH, [1])), 1)
    avg_seq = sum(scores_by_type.get(GameType.SEQUENCE_RECALL, [75])) / max(len(scores_by_type.get(GameType.SEQUENCE_RECALL, [1])), 1)
    avg_obj = sum(scores_by_type.get(GameType.OBJECT_RECOGNITION, [85])) / max(len(scores_by_type.get(GameType.OBJECT_RECOGNITION, [1])), 1)

    # Identify domain needing gentle reinforcement or variety
    if avg_seq < avg_memory and avg_seq < 80:
        rec_game = GameType.SEQUENCE_RECALL
        rec_name = "NER Rhythm & Sequence Recall"
        difficulty = DifficultyLevel.EASY if avg_seq < 70 else DifficultyLevel.MEDIUM
        reasoning = "Gentle audio-rhythm training is recommended today to gently stimulate working memory and sequential recall."
        caregiver_note = f"Recent sequence recall average is {int(avg_seq)}%. Gentle music/rhythm repetition will help sustain short-term memory."
        voice_msg = "Let's listen to soothing North East folk rhythms and tap along today!"
    elif avg_memory < avg_obj:
        rec_game = GameType.MEMORY_MATCH
        rec_name = "Heritage Memory Match"
        difficulty = DifficultyLevel.EASY if avg_memory < 70 else DifficultyLevel.MEDIUM
        reasoning = "Visual associative memory exercises with North East cultural pairs will reinforce spatial pattern recognition."
        caregiver_note = f"Visual match accuracy is stable at {int(avg_memory)}%. Continuing medium difficulty visual matching."
        voice_msg = "A friendly round of Heritage Memory Match will be refreshing for your mind."
    else:
        rec_game = GameType.OBJECT_RECOGNITION
        rec_name = "North East Familiar Object & Story Recall"
        difficulty = DifficultyLevel.EASY
        reasoning = "Long-term associative recall using familiar regional artifacts (Japi, Xorai, Cheraw bamboo) sparks pleasant nostalgia and confidence."
        caregiver_note = "High engagement observed during object recognition. Excellent for mood elevation and reminiscence therapy."
        voice_msg = "Let's look at familiar memories and items from our North East homeland together."

    return AIRecommendationResponse(
        user_id=user_id,
        recommended_game=rec_game,
        recommended_game_name=rec_name,
        recommended_difficulty=difficulty,
        reasoning=reasoning,
        caregiver_note=caregiver_note,
        encouraging_voice_message=voice_msg
    )
