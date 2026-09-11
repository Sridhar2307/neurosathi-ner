import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { NER_SEQUENCE_ITEMS } from '../../services/culturalData';
import { speechService } from '../../services/speechService';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  Music,
  Play,
  Award,
  Sparkles,
  Volume2,
  CheckCircle2,
  Brain
} from 'lucide-react';

export default function GameSequenceRecall() {
  const { navigateTo, refreshUserData, activePatientId } = useApp();
  const { speakText, autoVoiceRead, t } = useAccessibility();

  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeItem, setActiveItem] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [round, setRound] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Watch and listen to the rhythm pattern.');
  const [difficulty, setDifficulty] = useState('easy');

  const totalRoundsToWin = 4; // 3 items -> 4 items -> 5 items -> 6 items

  // Load saved difficulty on mount
  useEffect(() => {
    const loadDifficulty = async () => {
      const saved = await api.getSavedDifficulty(activePatientId || "demo-user-123", "sequence_recall");
      setDifficulty(saved);
      // Adjust starting round based on difficulty
      if (saved === 'medium') setRound(2);
      else if (saved === 'hard') setRound(3);
    };
    loadDifficulty();
  }, []);

  const startNewGame = () => {
    setIsGameOver(false);
    setGameResult(null);
    setMistakes(0);
    setPlayerIndex(0);

    // Initial sequence length based on difficulty
    const startLength = difficulty === 'easy' ? 3 : (difficulty === 'medium' ? 4 : 5);
    const initialSeq = Array.from({ length: startLength }, () =>
      NER_SEQUENCE_ITEMS[Math.floor(Math.random() * NER_SEQUENCE_ITEMS.length)].id
    );
    setSequence(initialSeq);
    setRound(1);

    if (autoVoiceRead) {
      speakText(`Listen closely to the rhythm sequence on ${difficulty} level, then tap the same drums and bells.`);
    }

    setTimeout(() => {
      playSequenceToUser(initialSeq);
    }, 1000);
  };

  const playSequenceToUser = async (seq) => {
    setIsPlayingSequence(true);
    setStatusMessage("Listening to regional rhythm...");
    setPlayerIndex(0);

    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      const itemId = seq[i];
      const itemObj = NER_SEQUENCE_ITEMS.find(it => it.id === itemId);
      if (itemObj) {
        setActiveItem(itemId);
        speechService.playTone(itemObj.soundNote, 'sine', 0.4);
        await new Promise(r => setTimeout(r, 450));
        setActiveItem(null);
      }
    }

    setIsPlayingSequence(false);
    setStatusMessage("Now your turn! Tap the instruments in order.");
  };

  const handleItemTap = (item) => {
    if (isPlayingSequence || isGameOver) return;

    // Flash and play sound
    setActiveItem(item.id);
    speechService.playTone(item.soundNote, 'sine', 0.35);
    setTimeout(() => setActiveItem(null), 300);

    const expectedId = sequence[playerIndex];

    if (item.id === expectedId) {
      // Correct step
      const nextIndex = playerIndex + 1;
      setPlayerIndex(nextIndex);

      if (nextIndex === sequence.length) {
        // Round completed successfully
        speechService.playSuccessChime();
        if (round >= totalRoundsToWin) {
          handleWin();
        } else {
          setStatusMessage("Correct! Adding one more instrument to the sequence...");
          setRound(r => r + 1);
          const nextSeq = [
            ...sequence,
            NER_SEQUENCE_ITEMS[Math.floor(Math.random() * NER_SEQUENCE_ITEMS.length)].id
          ];
          setSequence(nextSeq);
          setTimeout(() => {
            playSequenceToUser(nextSeq);
          }, 1200);
        }
      }
    } else {
      // Wrong step
      speechService.playErrorSound();
      setMistakes(m => m + 1);
      setStatusMessage("Gentle try! Let's listen to the sequence once more.");
      setTimeout(() => {
        playSequenceToUser(sequence);
      }, 1200);
    }
  };

  const handleWin = async () => {
    setIsGameOver(true);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    const calculatedScore = Math.max(60, 100 - (mistakes * 10));

    const result = await api.recordGameResult({
      user_id: activePatientId || "demo-user-123",
      game_type: "sequence_recall",
      difficulty: difficulty,
      score: calculatedScore,
      max_score: 100,
      attempts: mistakes + 1,
      duration_seconds: 40,
      mistakes: mistakes,
      cultural_theme: "Bihu Dhol & Temple Bells",
      completed: true
    });

    setGameResult(result);
    refreshUserData();
    speakText(`Wonderful rhythm recall! You scored ${calculatedScore} points!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Back Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigateTo('elder', 'games_hub')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-base shadow-sm transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
          <span>{t.backToGames || "Back to Mind Games"}</span>
        </button>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-amber-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">{t.difficulty || "Level"}:</span>
          {['easy', 'medium', 'hard'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`px-4 py-1.5 rounded-xl font-bold text-sm capitalize transition ${
                difficulty === lvl
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-950 hover:bg-amber-50'
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
          <span>{t.restart || "Restart"}</span>
        </button>
      </div>

      {/* Game Title & Instruction */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-sm text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-3xl mx-auto shadow-sm">
          🥁
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-sans flex items-center justify-center gap-3">
          <span>{t.sequenceRecall || "NER Rhythm & Sequence Recall"}</span>
          <AudioButton textToRead={`${t.sequenceRecall || 'Rhythm and Sequence Recall'}. ${t.sequenceRecallDesc || 'Watch and listen to the instruments.'}`} size="md" />
        </h1>

        <div className="inline-block bg-amber-50 px-5 py-2 rounded-full border-2 border-amber-300 text-amber-950 font-bold text-base sm:text-lg">
          {isPlayingSequence ? (t.listenPattern || "Listen Carefully to the Rhythms...") : (t.yourTurn || "Your Turn! Tap the Instruments in Order")}
        </div>

        <div className="flex justify-center items-center gap-6 pt-2 text-sm font-bold text-slate-600">
          <span>{t.round || "Round"}: <strong className="text-amber-800 text-base">{round} of {totalRoundsToWin}</strong></span>
          <span>Sequence Length: <strong className="text-amber-800 text-base">{sequence.length}</strong></span>
        </div>
      </div>

      {/* 4 Large Instrument Pads */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
        {NER_SEQUENCE_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemTap(item)}
              disabled={isPlayingSequence || isGameOver}
              className={`min-h-[160px] sm:min-h-[200px] rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 border-4 shadow-lg ${
                isActive
                  ? 'bg-amber-400 border-white text-white ring-8 ring-amber-300 scale-105 shadow-2xl'
                  : 'bg-white hover:bg-amber-50 border-amber-300 text-slate-900 hover:border-amber-500 shadow-md'
              }`}
            >
              <span className="text-5xl sm:text-6xl mb-3 filter drop-shadow-sm">{item.icon}</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {item.label}
              </span>
              <span className="text-xs font-bold text-slate-500 mt-1">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sequence Playing Overlay State */}
      {isPlayingSequence && (
        <div className="text-center font-bold text-amber-800 animate-pulse text-base">
          🎵 {t.listenPattern || "Listening to rhythm pattern..."}
        </div>
      )}

      {/* Game Win Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-lg w-full p-6 sm:p-8 text-center border-4 border-amber-400 shadow-2xl animate-gentle-float">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center text-4xl mx-auto mb-4 shadow-md">
              🎉
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-amber-950 font-sans">
              {t.congratsSequence || "Spectacular Rhythm Memory!"}
            </h2>

            <p className="text-lg text-slate-700 font-medium mt-2">
              {gameResult?.encouraging_message || (t.congratsSequenceSub || "Your ears and working memory reproduced the musical sequence perfectly.")}
            </p>

            <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 my-6 text-left space-y-2">
              <div className="flex items-center justify-between text-lg font-bold text-amber-950">
                <span>{t.score || "Final Score"}:</span>
                <span className="text-2xl font-black text-amber-700">{gameResult?.score || 90} / 100</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{t.stars || "Stars Earned"}:</span>
                <span className="text-amber-600 font-bold">+5 Stars ⭐</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startNewGame}
                className="flex-1 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-tactile-amber transition"
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
        </div>
      )}
    </div>
  );
}
