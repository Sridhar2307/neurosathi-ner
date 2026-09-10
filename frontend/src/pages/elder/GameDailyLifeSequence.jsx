import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  Brain,
  Sunrise,
  Coffee,
  Utensils,
  Bath,
  Pill,
  HeartPulse,
  Moon,
  Footprints,
  Smile,
  BookOpen
} from 'lucide-react';

const DAILY_LIFE_SEQUENCES = [
  {
    id: 'morning_tea_ritual',
    title: 'Morning Assam Tea Ritual',
    region: 'Assam',
    icon: '🍵☀️',
    steps: [
      { id: 's1', icon: '💧', label: 'Heat Water', desc: 'Boil fresh water in kettle', voiceText: 'Heat fresh water for tea' },
      { id: 's2', icon: '🍵', label: 'Add Tea Leaves', desc: 'Put Assam orthodox tea in pot', voiceText: 'Add golden Assam tea leaves' },
      { id: 's3', icon: '⏳', label: 'Steep & Brew', desc: 'Let it steep 3-4 minutes', voiceText: 'Let tea steep for three minutes' },
      { id: 's4', icon: '🥛', label: 'Add Milk & Sugar', desc: 'Pour milk and sweeten to taste', voiceText: 'Add warm milk and sugar' },
      { id: 's5', icon: '☕', label: 'Serve & Sip', desc: 'Enjoy with biscuits or toast', voiceText: 'Sip your warm Assam tea' },
    ]
  },
  {
    id: 'mekhela_dressing',
    title: 'Wearing the Mekhela Chador',
    region: 'Assam',
    icon: '👘🌸',
    steps: [
      { id: 's1', icon: '👗', label: 'Unfold Mekhela', desc: 'Lay out the cylindrical skirt', voiceText: 'Unfold the Mekhela skirt' },
      { id: 's2', icon: '🔄', label: 'Wrap Around Waist', desc: 'Tuck and pleat at the waist', voiceText: 'Wrap and pleat around waist' },
      { id: 's3', icon: '📌', label: 'Secure with Knot', desc: 'Tie the inner string firmly', voiceText: 'Secure with the inner knot' },
      { id: 's4', icon: '🧣', label: 'Drape Chador', desc: 'Wrap upper cloth over shoulder', voiceText: 'Drape the Chador over shoulder' },
      { id: 's5', icon: '✨', label: 'Final Adjustments', desc: 'Smooth pleats and check fit', voiceText: 'Adjust pleats and check comfort' },
    ]
  },
  {
    id: 'diya_prayer',
    title: 'Evening Diya & Prayer',
    region: 'All NER',
    icon: '🪔🕉️',
    steps: [
      { id: 's1', icon: '🪔', label: 'Prepare Diya', desc: 'Place cotton wick in clay lamp', voiceText: 'Place cotton wick in clay diya' },
      { id: 's2', icon: '🛢️', label: 'Pour Oil/Ghee', desc: 'Fill with mustard oil or ghee', voiceText: 'Pour pure mustard oil or ghee' },
      { id: 's3', icon: '🔥', label: 'Light the Flame', desc: 'Light wick with matchstick', voiceText: 'Light the sacred flame gently' },
      { id: 's4', icon: '🙏', label: 'Offer Prayers', desc: 'Fold hands and chant mantra', voiceText: 'Offer prayers with folded hands' },
      { id: 's5', icon: '🌿', label: 'Place at Altar', desc: 'Set diya before deity photo', voiceText: 'Place diya at home altar' },
    ]
  },
  {
    id: 'bihu_prep',
    title: 'Bihu Festival Preparation',
    region: 'Assam',
    icon: '🥁🌾',
    steps: [
      { id: 's1', icon: '🌾', label: 'Clean Courtyard', desc: 'Sweep and sprinkle water', voiceText: 'Clean the courtyard for Bihu' },
      { id: 's2', icon: '🌸', label: 'Make Kopou Phool', desc: 'Arrange foxtail orchid garlands', voiceText: 'Make Kopou phool garlands' },
      { id: 's3', icon: '🥁', label: 'Tune the Dhol', desc: 'Tighten ropes of Bihu drum', voiceText: 'Tune the Bihu dhol drum' },
      { id: 's4', icon: '🍚', label: 'Cook Pitha', desc: 'Prepare rice cakes for guests', voiceText: 'Cook traditional pitha sweets' },
      { id: 's5', icon: '👯', label: 'Welcome Dancers', desc: 'Greet Bihu dancers with Gamusa', voiceText: 'Welcome dancers with Phulam Gamusa' },
    ]
  },
  {
    id: 'medicine_routine',
    title: 'Daily Medicine Routine',
    region: 'Healthcare',
    icon: '💊❤️',
    steps: [
      { id: 's1', icon: '⏰', label: 'Check Time', desc: 'Confirm medicine schedule', voiceText: 'Check your medicine time' },
      { id: 's2', icon: '💧', label: 'Pour Water', desc: 'Fill glass with fresh water', voiceText: 'Pour a full glass of water' },
      { id: 's3', icon: '💊', label: 'Take Correct Pills', desc: 'Take prescribed dose only', voiceText: 'Take your prescribed tablets' },
      { id: 's4', icon: '☕', label: 'Swallow with Water', desc: 'Drink full glass slowly', voiceText: 'Swallow pills with water' },
      { id: 's5', icon: '📝', label: 'Mark Completed', desc: 'Tick off in reminder app', voiceText: 'Mark medicine as taken' },
    ]
  }
];

const ICON_COMPONENTS = {
  Sunrise, Coffee, Utensils, Bath, Pill, HeartPulse, Moon, Footprints, Smile, BookOpen
};

export default function GameDailyLifeSequence() {
  const { navigateTo, refreshUserData } = useApp();
  const { speakText, autoVoiceRead, t } = useAccessibility();

  const [currentSequence, setCurrentSequence] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [phase, setPhase] = useState('learning');
  const [mistakes, setMistakes] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [showStepDetail, setShowStepDetail] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');

  const timerRef = useRef(null);

  // Load saved difficulty on mount
  useEffect(() => {
    const loadDifficulty = async () => {
      const saved = await api.getSavedDifficulty("demo-user-123", "daily_life_sequence");
      setDifficulty(saved);
    };
    loadDifficulty();
  }, []);

  const startNewGame = () => {
    const sequence = DAILY_LIFE_SEQUENCES[Math.floor(Math.random() * DAILY_LIFE_SEQUENCES.length)];
    setCurrentSequence(sequence);
    setSteps(sequence.steps);
    setCurrentStepIndex(0);
    setPlayerSequence([]);
    setPhase('learning');
    setMistakes(0);
    setIsGameOver(false);
    setGameResult(null);
    setSeconds(0);
    setShowStepDetail(null);

    if (autoVoiceRead) {
      speakText(`Starting ${sequence.title}. Watch the steps carefully, then arrange them in order.`);
    }

    setTimeout(() => {
      setPhase('playing');
    }, 2000);
  };

  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'playing' && !isGameOver) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isGameOver]);

  const handleStepSelect = (step) => {
    if (phase !== 'playing' || isGameOver) return;

    const expectedStep = steps[currentStepIndex];
    if (step.id === expectedStep.id) {
      setPlayerSequence(prev => [...prev, step]);
      setCurrentStepIndex(prev => prev + 1);
      speakText(`Correct! ${step.voiceText}`);

      if (currentStepIndex + 1 >= steps.length) {
        handleWin();
      }
    } else {
      setMistakes(prev => prev + 1);
      speakText(`Not quite. The next step is ${expectedStep.voiceText}. Try again.`);
    }
  };

  const handleWin = async () => {
    setIsGameOver(true);
    setPhase('complete');
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    const baseScore = 100;
    const penalty = mistakes * 8 + Math.max(0, Math.floor((seconds - 60) / 5));
    const finalScore = Math.max(55, Math.min(100, baseScore - penalty));

    const result = await api.recordGameResult({
      user_id: "demo-user-123",
      game_type: "daily_life_sequence",
      difficulty: difficulty,
      score: finalScore,
      max_score: 100,
      attempts: mistakes + 1,
      duration_seconds: seconds,
      mistakes: mistakes,
      cultural_theme: `NER Daily Life: ${currentSequence?.region}`,
      completed: true
    });

    setGameResult(result);
    refreshUserData();
    speakText(`Excellent! You completed ${currentSequence?.title} with ${finalScore} points! ${result.encouraging_message}`);
  };

  const getStepIcon = (iconName) => {
    const icons = {
      '💧': '💧', '🍵': '🍵', '⏳': '⏳', '🥛': '🥛', '☕': '☕',
      '👗': '👗', '🔄': '🔄', '📌': '📌', '🧣': '🧣', '✨': '✨',
      '🪔': '🪔', '🛢️': '🛢️', '🔥': '🔥', '🙏': '🙏', '🌿': '🌿',
      '🌾': '🌾', '🌸': '🌸', '🥁': '🥁', '🍚': '🍚', '👯': '👯',
      '⏰': '⏰', '💧': '💧', '💊': '💊', '☕': '☕', '📝': '📝'
    };
    return icons[iconName] || iconName;
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
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-green-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">{t.difficulty || "Level"}:</span>
          {['easy', 'medium', 'hard'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`px-4 py-1.5 rounded-xl font-bold text-sm capitalize transition ${
                difficulty === lvl
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-green-950 hover:bg-green-50'
              }`}
            >
              {lvl === 'easy' ? (t.easy || 'Gentle') : lvl === 'medium' ? (t.medium || 'Standard') : (t.hard || 'Challenging')}
            </button>
          ))}
        </div>

        <button
          onClick={startNewGame}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.restart || "New Routine"}</span>
        </button>
      </div>

      {/* Game Title & Instruction */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-3xl shadow-sm shrink-0">
            {currentSequence?.icon || '🌅'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-rose-950 font-sans flex items-center gap-2 truncate">
              <span>{currentSequence?.title || (t.dailyLifeTitle || "Daily Life Sequencing")}</span>
              <AudioButton textToRead={`${currentSequence?.title || 'Daily Life Sequencing'}. ${t.dailyLifeSubtitle || 'Watch the routine steps, then tap them in the correct order.'}`} size="sm" />
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600 mt-1">
              {currentSequence ? `${currentSequence.region} • ${steps.length} Steps` : 'Loading...'}
            </p>
          </div>
        </div>

        <div className="inline-block px-5 py-2 rounded-full border-2 font-bold text-base sm:text-lg
          {phase === 'learning' ? 'bg-blue-50 border-blue-300 text-blue-950' :
           phase === 'playing' ? 'bg-amber-50 border-amber-300 text-amber-950' :
           'bg-emerald-50 border-emerald-300 text-emerald-950'
          }">
          {phase === 'learning' && `👀 ${t.learnPhase || "Learning Phase - Watch the Steps"}`}
          {phase === 'playing' && `🎯 ${t.playPhase || "Your Turn - Tap Steps in Order"}`}
          {phase === 'complete' && `🏆 ${t.completePhase || "Complete!"}`}
        </div>

        <div className="flex justify-center items-center gap-6 pt-2 text-sm font-bold text-slate-600 flex-wrap">
          <span>Step: <strong className="text-rose-800 text-base">{Math.min(currentStepIndex + 1, steps.length)} of {steps.length}</strong></span>
          <span>Mistakes: <strong className="text-amber-800 text-base">{mistakes}</strong></span>
          <span>Time: <strong className="text-teal-800 text-base">{seconds}s</strong></span>
        </div>
      </div>

      {/* Learning Phase - Show Full Sequence */}
      {phase === 'learning' && (
        <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-200 animate-fadeIn">
          <h3 className="text-lg font-bold text-blue-900 mb-4 text-center flex items-center justify-center gap-2">
            <Brain className="w-5 h-5" />
            {t.learnInstruction || "Watch the complete routine sequence:"}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-blue-200 shadow-sm min-w-[140px]"
              >
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStepIcon(step.icon)}</span>
                  <span className="text-sm font-semibold text-slate-800 hidden sm:block">{step.label}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-blue-700 mt-4 font-medium">
            {t.learnInstructionSub || "Memorize the order, then you'll arrange the steps yourself."}
          </p>
        </div>
      )}

      {/* Playing Phase - Step Cards to Arrange */}
      {phase === 'playing' && (
        <div className="space-y-4">
          {/* Current Step Target */}
          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 text-center">
            <p className="text-sm font-bold text-amber-900 mb-2">
              {t.nextStep || "Find and tap the next step:"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{getStepIcon(steps[currentStepIndex]?.icon)}</span>
              <div className="text-left">
                <p className="text-xl font-black text-slate-900">{steps[currentStepIndex]?.label}</p>
                <p className="text-sm text-slate-600">{steps[currentStepIndex]?.desc}</p>
              </div>
            </div>
          </div>

          {/* Available Steps Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {steps.map((step) => {
              const isSelected = playerSequence.some(s => s.id === step.id);
              const isCurrentTarget = step.id === steps[currentStepIndex]?.id;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepSelect(step)}
                  disabled={isSelected || isGameOver}
                  className={`min-h-[140px] rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 border-4 shadow-md ${
                    isSelected
                      ? 'bg-emerald-100 border-emerald-400 opacity-60'
                      : isCurrentTarget
                      ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200 scale-102 shadow-lg animate-pulse'
                      : 'bg-white hover:bg-rose-50 border-rose-200 hover:border-rose-400 shadow-tactile-btn'
                  }`}
                  aria-label={isSelected ? `${step.label}, completed` : isCurrentTarget ? `${step.label}, this is next` : step.label}
                >
                  <span className="text-4xl sm:text-5xl mb-2 filter drop-shadow-sm">{getStepIcon(step.icon)}</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 leading-tight text-center px-2">
                    {step.label}
                  </span>
                  <span className="text-xs font-bold text-slate-500 mt-1 hidden sm:block">{step.desc}</span>
                  {isSelected && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5 fill-current" />
                      <span className="text-sm font-bold">{t.done || "Done"}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((playerSequence.length) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-500 mt-1">
            {playerSequence.length} of {steps.length} steps arranged
          </p>
        </div>
      )}

      {/* Game Over Celebration Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-lg w-full p-6 sm:p-8 text-center border-4 border-rose-400 shadow-2xl animate-gentle-float">
            <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-800 flex items-center justify-center text-4xl mx-auto mb-4 shadow-md">
              🏆
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-rose-950 font-sans">
              {t.congratsDailyLife || "Daily Routine Mastered!"}
            </h2>

            <p className="text-lg text-slate-700 font-medium mt-2">
              {gameResult?.encouraging_message || (t.congratsDailyLifeSub || "You perfectly sequenced the daily life routine, strengthening procedural memory and independence.")}
            </p>

            {/* Score Breakdown Box */}
            <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-200 my-6 text-left space-y-2.5">
              <div className="flex items-center justify-between text-lg font-bold text-rose-950">
                <span>{t.score || "Score"}:</span>
                <span className="text-2xl font-black text-rose-700">{gameResult?.score || 95} / 100</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.time || "Time"}:</span>
                <span>{seconds}s</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.mistakes || "Mistakes"}:</span>
                <span className="text-amber-600 font-bold">{mistakes}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.stars || "Stars Earned"}:</span>
                <span className="text-amber-600 font-bold">+5 Stars ⭐</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.routine || "Routine"}:</span>
                <span className="font-bold text-rose-800">{currentSequence?.title}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startNewGame}
                className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg shadow-md transition"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t.playAgain || "Try Another Routine"}</span>
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