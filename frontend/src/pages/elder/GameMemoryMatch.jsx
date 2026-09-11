import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { NER_MEMORY_TILES } from '../../services/culturalData';
import { speechService } from '../../services/speechService';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  Volume2,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';

export default function GameMemoryMatch() {
  const { navigateTo, refreshUserData, activePatientId } = useApp();
  const { speakText, autoVoiceRead, t } = useAccessibility();

  // Difficulty: 'easy' (4 pairs = 8 tiles), 'medium' (6 pairs = 12 tiles), 'hard' (8 pairs = 16 tiles)
  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef(null);

  const pairCount = difficulty === 'easy' ? 4 : (difficulty === 'medium' ? 6 : 8);

  const initializeGame = () => {
    // Reset states
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setMistakes(0);
    setSeconds(0);
    setIsGameOver(false);
    setGameResult(null);

    // Pick random items
    const selectedItems = [...NER_MEMORY_TILES].sort(() => 0.5 - Math.random()).slice(0, pairCount);
    
    // Duplicate and shuffle
    const deck = [...selectedItems, ...selectedItems]
      .sort(() => 0.5 - Math.random())
      .map((item, idx) => ({
        uniqueKey: `${item.id}-${idx}-${Math.random()}`,
        ...item
      }));

    setCards(deck);

    if (autoVoiceRead) {
      speakText(`Starting Heritage Memory Match on ${difficulty} level. Find the matching pairs.`);
    }
  };

  useEffect(() => {
    initializeGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  // Load saved difficulty on mount
  useEffect(() => {
    const loadDifficulty = async () => {
      const saved = await api.getSavedDifficulty(activePatientId || "demo-user-123", "memory_match");
      setDifficulty(saved);
    };
    loadDifficulty();
  }, [activePatientId]);

  // Timer
  useEffect(() => {
    if (!isGameOver) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver]);

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const card = cards[index];
    if (matchedIds.includes(card.id)) return;

    speechService.playCardFlipSound();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // Matched!
        speechService.playSuccessChime();
        setMatchedIds(prev => {
          const nextMatched = [...prev, firstCard.id];
          if (nextMatched.length === pairCount) {
            handleGameWin(nextMatched.length);
          }
          return nextMatched;
        });
        setFlippedIndices([]);
        if (autoVoiceRead) {
          speakText(`Matched! ${firstCard.voiceText}`);
        }
      } else {
        // Not matched
        setMistakes(m => m + 1);
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  const handleGameWin = async (matchedCount) => {
    setIsGameOver(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Calculate score
    const baseScore = 100;
    const penalty = (mistakes * 5) + Math.max(0, Math.floor((seconds - (pairCount * 6)) / 3));
    const finalScore = Math.max(50, Math.min(100, baseScore - penalty));

    setIsSaving(true);
    const result = await api.recordGameResult({
      user_id: activePatientId || "demo-user-123",
      game_type: "memory_match",
      difficulty: difficulty,
      score: finalScore,
      max_score: 100,
      attempts: 1,
      duration_seconds: seconds,
      mistakes: mistakes,
      cultural_theme: "NER Heritage Pairs",
      completed: true
    });
    setIsSaving(false);
    setGameResult(result);
    refreshUserData();

    speakText(`Shandar! You completed the Memory Match with a score of ${finalScore} points! ${result.encouraging_message}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigateTo('elder', 'games_hub')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-base shadow-sm transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
          <span>{t.backToGames || "Back to Mind Games"}</span>
        </button>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-teal-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">{t.difficulty || "Level"}:</span>
          {['easy', 'medium', 'hard'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`px-4 py-1.5 rounded-xl font-bold text-sm capitalize transition ${
                difficulty === lvl
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-teal-950 hover:bg-teal-50'
              }`}
            >
              {lvl === 'easy' ? (t.easy || 'Gentle') : lvl === 'medium' ? (t.medium || 'Standard') : (t.hard || 'Challenging')}
            </button>
          ))}
        </div>
      </div>

      {/* Game Title & Stats Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-teal-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-bold">
            🦏
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-teal-950 flex items-center gap-2">
              <span>{t.heritageMatch || "Heritage Memory Match"}</span>
              <AudioButton textToRead={`${t.heritageMatch || 'Heritage Memory Match'}. ${t.tapToFlip || 'Tap cards to find pairs'}.`} size="sm" />
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600">
              {t.tapToFlip || "Tap cards to find pairs"} • {matchedIds.length} / {pairCount} {t.pairsFound || "pairs matched"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-800 font-bold text-base sm:text-lg">
          <div className="flex items-center gap-1.5 bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-200 text-teal-950">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>{seconds}s {t.time || "Time"}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-950">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <span>{moves} {t.moves || "Turns"}</span>
          </div>

          <button
            onClick={initializeGame}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            title={t.restart || "Restart Game"}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Grid */}
      <div className={`grid gap-4 sm:gap-6 ${
        pairCount === 4 ? 'grid-cols-2 sm:grid-cols-4' : (pairCount === 6 ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-4')
      }`}>
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx);
          const isMatched = matchedIds.includes(card.id);
          const showFront = isFlipped || isMatched;

          return (
            <button
              key={card.uniqueKey}
              onClick={() => handleCardClick(idx)}
              disabled={isMatched || isGameOver}
              className={`min-h-[140px] sm:min-h-[170px] rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-md border-4 ${
                isMatched
                  ? 'bg-emerald-100 border-emerald-400 opacity-90'
                  : showFront
                  ? `${card.color} border-teal-500 scale-102`
                  : 'bg-teal-700 hover:bg-teal-800 border-teal-600 text-white shadow-tactile-btn'
              }`}
              aria-label={showFront ? card.name : "Face down card"}
            >
              {showFront ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <span className="text-4xl sm:text-5xl block filter drop-shadow-sm">{card.icon}</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                    {card.name}
                  </span>
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                    {card.state}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center mx-auto shadow-inner text-2xl">
                    🌿
                  </div>
                  <span className="text-xs font-extrabold text-teal-100 uppercase tracking-wider block">
                    {t.tapToPlay || "TAP CARD"}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Game Over Celebration Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-lg w-full p-6 sm:p-8 text-center border-4 border-emerald-400 shadow-2xl animate-gentle-float">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-4xl mx-auto mb-4 shadow-md">
              🏆
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-teal-950 font-sans">
              {t.congratsMatch || "Wonderful Memory Recall!"}
            </h2>

            <p className="text-lg text-slate-700 font-medium mt-2">
              {gameResult?.encouraging_message || (t.congratsMatchSub || "You matched all North East cultural cards with great focus.")}
            </p>

            {/* Score Breakdown Box */}
            <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-200 my-6 text-left space-y-2.5">
              <div className="flex items-center justify-between text-lg font-bold text-emerald-950">
                <span>{t.score || "Score"}:</span>
                <span className="text-2xl font-black text-emerald-700">{gameResult?.score || 95} / 100</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.time || "Time"}:</span>
                <span>{seconds}s</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.stars || "Stars Earned"}:</span>
                <span className="text-amber-600 font-bold">+5 Stars ⭐</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.difficulty || "Level"}:</span>
                <span className="capitalize font-bold text-teal-800">{gameResult?.adaptive_next_difficulty || difficulty}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={initializeGame}
                className="flex-1 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-tactile-btn transition"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t.playAgain || "Play Again"}</span>
              </button>

              <button
                onClick={() => navigateTo('elder', 'games_hub')}
                className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-lg transition"
              >
                <span>{t.mindGames || "Other Games"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
