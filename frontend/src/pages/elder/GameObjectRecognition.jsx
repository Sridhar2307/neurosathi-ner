import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { NER_OBJECT_RECOGNITION_STORIES } from '../../services/culturalData';
import { speechService } from '../../services/speechService';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  Volume2
} from 'lucide-react';

export default function GameObjectRecognition() {
  const { navigateTo, refreshUserData, activePatientId } = useApp();
  const { speakText, autoVoiceRead, t } = useAccessibility();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');

  const currentStory = NER_OBJECT_RECOGNITION_STORIES[currentIndex];

  // Load saved difficulty on mount
  useEffect(() => {
    const loadDifficulty = async () => {
      const saved = await api.getSavedDifficulty(activePatientId || "guest", "object_recognition");
      setDifficulty(saved);
    };
    loadDifficulty();
  }, [activePatientId]);

  useEffect(() => {
    if (autoVoiceRead && currentStory) {
      speakText(`${currentStory.title}. ${currentStory.promptQuestion}`);
    }
  }, [currentIndex]);

  const handleSelectOption = (opt) => {
    if (selectedOption) return; // already answered
    setSelectedOption(opt);

    const isCorrect = opt === currentStory.correctAnswer;
    if (isCorrect) {
      speechService.playSuccessChime();
      setScore(s => s + 20); // 5 questions * 20 = 100 max
      speakText(`Very good! ${currentStory.correctAnswer} is correct. ${currentStory.culturalFact}`);
    } else {
      speechService.playErrorSound();
      speakText(`Good try. The traditional answer is ${currentStory.correctAnswer}.`);
    }
  };

  const handleNextStory = async () => {
    if (currentIndex + 1 < NER_OBJECT_RECOGNITION_STORIES.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setShowHint(false);
    } else {
      // Finished all 5 stories
      setIsCompleted(true);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      const finalScore = Math.max(50, score);
      const res = await api.recordGameResult({
        user_id: activePatientId || "guest",
        game_type: "object_recognition",
        difficulty: difficulty,
        score: finalScore,
        max_score: 100,
        attempts: 1,
        duration_seconds: 35,
        mistakes: Math.floor((100 - finalScore) / 20),
        cultural_theme: "North East Artifacts & Folklore",
        completed: true
      });
      setGameResult(res);
      refreshUserData();
      speakText(`Outstanding! You completed all North East memories and scored ${finalScore} points!`);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowHint(false);
    setScore(0);
    setIsCompleted(false);
    setGameResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Back Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigateTo('elder', 'games_hub')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-base shadow-sm transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
          <span>{t.backToGames || "Back to Mind Games"}</span>
        </button>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-rose-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">{t.difficulty || "Level"}:</span>
          {['easy', 'medium', 'hard'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`px-4 py-1.5 rounded-xl font-bold text-sm capitalize transition ${
                difficulty === lvl
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-950 hover:bg-rose-50'
              }`}
            >
              {lvl === 'easy' ? (t.easy || 'Gentle') : lvl === 'medium' ? (t.medium || 'Standard') : (t.hard || 'Challenging')}
            </button>
          ))}
        </div>

        <span className="text-sm sm:text-base font-bold text-rose-900 bg-rose-100 px-4 py-2 rounded-2xl border border-rose-300">
          {t.question || "Memory"} {currentIndex + 1} / {NER_OBJECT_RECOGNITION_STORIES.length}
        </span>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Main Question Card */}
          <div className="elder-card p-6 sm:p-8 bg-white border-3 border-rose-200 shadow-soft-3d space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl">{currentStory.imageEmoji}</span>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300">
                    {currentStory.state} Heritage
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-rose-950 mt-1">
                    {currentStory.title}
                  </h1>
                </div>
              </div>

              <AudioButton
                textToRead={`${currentStory.title}. ${currentStory.promptQuestion}`}
                size="lg"
                className="bg-rose-100 text-rose-900 border-rose-300"
              />
            </div>

            <div className="bg-rose-50/60 p-5 rounded-2xl border-2 border-rose-100">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
                "{currentStory.promptQuestion}"
              </p>
            </div>

            {/* Hint Button & Drawer */}
            <div>
              <button
                onClick={() => {
                  setShowHint(!showHint);
                  if (!showHint) speakText(`Hint: ${currentStory.hint}`);
                }}
                className="flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl border border-amber-200 transition"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? (t.hint || "Hide Gentle Clue") : (t.hint || "Need a Gentle Clue?")}</span>
              </button>

              {showHint && (
                <div className="mt-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 text-amber-950 font-medium text-base animate-fadeIn">
                  💡 <strong>{t.hint || "Clue"}:</strong> {currentStory.hint}
                </div>
              )}
            </div>
          </div>

          {/* 4 Large Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentStory.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentStory.correctAnswer;
              
              let btnStyle = 'bg-white hover:bg-rose-50/50 border-rose-200 text-slate-900';
              if (selectedOption) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-4 ring-emerald-200 font-extrabold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-100 border-rose-400 text-rose-950';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={Boolean(selectedOption)}
                  className={`min-h-[90px] rounded-3xl p-5 text-left border-3 shadow-md transition-all transform active:scale-98 flex items-center justify-between text-lg sm:text-xl font-bold ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedOption && isCorrect && (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Post Answer Feedback & Next Button */}
          {selectedOption && (
            <div className="bg-white rounded-3xl p-6 border-3 border-teal-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="space-y-1 text-left">
                <p className="text-base sm:text-lg font-bold text-teal-950">
                  {selectedOption === currentStory.correctAnswer ? (t.correct || "✨ Shandar! Correct identification.") : `✨ The familiar item is ${currentStory.correctAnswer}.`}
                </p>
                <p className="text-sm font-semibold text-slate-600">
                  {currentStory.culturalFact}
                </p>
              </div>

              <button
                onClick={handleNextStory}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-tactile-btn transition shrink-0"
              >
                <span>{currentIndex + 1 < NER_OBJECT_RECOGNITION_STORIES.length ? (t.nextQuestion || "Next Memory") : (t.viewSchedule || "View Results")}</span>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completed Summary */
        <div className="bg-white rounded-4xl max-w-lg mx-auto p-8 text-center border-4 border-rose-300 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-800 flex items-center justify-center text-4xl mx-auto shadow-md">
            🌸
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-rose-950 font-sans">
            {t.quizComplete || "Heartfelt Memories!"}
          </h2>

          <p className="text-lg text-slate-700 font-medium">
            {gameResult?.encouraging_message || (t.quizCompleteSub || "You recognized all familiar North East objects with remarkable grace!")}
          </p>

          <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-200 text-left space-y-2">
            <div className="flex items-center justify-between text-lg font-bold text-rose-950">
              <span>{t.score || "Score"}:</span>
              <span className="text-2xl font-black text-rose-700">{score} / 100</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>{t.stars || "Stars Earned"}:</span>
              <span className="text-amber-600 font-bold">+5 Stars ⭐</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg shadow-md transition"
            >
              {t.playAgain || "Play Again"}
            </button>

            <button
              onClick={() => navigateTo('elder', 'games_hub')}
              className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-lg transition"
            >
              {t.mindGames || "Other Games"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
