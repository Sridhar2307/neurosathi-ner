import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import {
  Brain,
  Sparkles,
  ArrowLeft,
  Award,
  Play,
  Layers,
  Music,
  Compass,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export default function GamesHub() {
  const { navigateTo } = useApp();
  const { speakText, autoVoiceRead } = useAccessibility();
  const [recommendation, setRecommendation] = useState(null);
  const [recentScores, setRecentScores] = useState([]);

  useEffect(() => {
    const fetchAI = async () => {
      const rec = await api.getAIRecommendation();
      setRecommendation(rec);
      const scores = await api.getGameResults();
      setRecentScores(scores);
    };
    fetchAI();
  }, []);

  const handleLaunchGame = (viewKey, spokenName) => {
    if (autoVoiceRead) speakText(`Launching ${spokenName}`);
    navigateTo('elder', viewKey);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigateTo('elder', 'dashboard')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-base sm:text-lg shadow-sm transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-2 rounded-2xl border border-amber-300 font-bold text-sm">
          <Award className="w-5 h-5 text-amber-600 fill-amber-500" />
          <span>Earn 5 Stars for every game completed!</span>
        </div>
      </div>

      {/* Title & Speech */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-teal-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-950 font-sans tracking-tight flex items-center gap-3">
            <span>North East Mind Games</span>
            <AudioButton
              textToRead="Cognitive Mind Games. Choose from Heritage Memory Match, Sequence Recall, or Object and Story Recall."
              size="lg"
            />
          </h1>
          <p className="text-lg text-slate-600 font-medium mt-1">
            Choose a culturally familiar game below. Difficulty adjusts smoothly to your pace.
          </p>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {recommendation && (
        <div className="bg-gradient-to-r from-teal-800 to-emerald-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl border-3 border-teal-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-teal-950/60 px-3 py-1 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider w-fit border border-teal-600">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Cognitive Recommendation</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Recommended for You: <span className="text-amber-300">{recommendation.recommended_game_name}</span>
            </h2>
            <p className="text-base text-teal-100 font-medium max-w-2xl">
              {recommendation.reasoning}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AudioButton
              textToRead={`${recommendation.encouraging_voice_message} ${recommendation.reasoning}`}
              size="lg"
              className="bg-white text-teal-900 border-none shadow-md"
            />
            <button
              onClick={() => {
                const targetView = recommendation.recommended_game === 'memory_match' ? 'game_memory' : (recommendation.recommended_game === 'sequence_recall' ? 'game_sequence' : 'game_object');
                handleLaunchGame(targetView, recommendation.recommended_game_name);
              }}
              className="px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-lg flex items-center gap-2 shadow-tactile-amber active:shadow-tactile-amber-pressed transform active:translate-y-1 transition"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>Play AI Pick</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 Playable Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Game 1: Memory Match */}
        <div className="elder-card p-6 sm:p-7 bg-white border-3 border-teal-200 hover:border-teal-500 flex flex-col justify-between shadow-soft-3d group">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition">
                🦏
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-teal-100 text-teal-900 px-3 py-1 rounded-full border border-teal-300">
                Visual Recall
              </span>
            </div>

            <h3 className="text-2xl font-black text-teal-950 mb-2">
              Heritage Memory Match
            </h3>

            <p className="text-slate-600 text-base font-medium mb-4 leading-relaxed">
              Flip and pair cultural icons like Assam Tea, Kaziranga Rhino, Great Hornbill, and Bihu Dhol drums.
            </p>

            <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-100 text-sm font-semibold text-teal-900 mb-6 space-y-1">
              <div className="flex items-center justify-between">
                <span>Adaptive Grid:</span>
                <strong className="text-teal-700">2x2 up to 2x4</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Focus:</span>
                <strong className="text-teal-700">Short-term visual recall</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <AudioButton
              textToRead="Heritage Memory Match. Flip pairs of Assam tea, Rhinos, and Hornbill cards."
              size="md"
              className="w-full"
            />
            <button
              onClick={() => handleLaunchGame('game_memory', 'North East Heritage Memory Match')}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Match Game</span>
            </button>
          </div>
        </div>

        {/* Game 2: Sequence Recall */}
        <div className="elder-card p-6 sm:p-7 bg-white border-3 border-amber-200 hover:border-amber-500 flex flex-col justify-between shadow-soft-3d group">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition">
                🥁
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                Auditory Rhythm
              </span>
            </div>

            <h3 className="text-2xl font-black text-amber-950 mb-2">
              NER Sequence Recall
            </h3>

            <p className="text-slate-600 text-base font-medium mb-4 leading-relaxed">
              Listen to the soothing bells and folk drum beats, then tap the sequence in order to train working memory.
            </p>

            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100 text-sm font-semibold text-amber-900 mb-6 space-y-1">
              <div className="flex items-center justify-between">
                <span>Rhythm Keys:</span>
                <strong className="text-amber-800">Bells, Dhol, Gong</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Focus:</span>
                <strong className="text-amber-800">Sequential attention</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <AudioButton
              textToRead="Sequence Recall. Watch and listen to the rhythmic instruments and repeat the pattern."
              size="md"
              className="w-full bg-amber-100 text-amber-900 border-amber-300"
            />
            <button
              onClick={() => handleLaunchGame('game_sequence', 'NER Rhythm and Sequence Recall')}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-tactile-amber active:shadow-tactile-amber-pressed transform active:translate-y-1 transition"
            >
              <Music className="w-5 h-5" />
              <span>Start Rhythm Game</span>
            </button>
          </div>
        </div>

        {/* Game 3: Object Recognition */}
        <div className="elder-card p-6 sm:p-7 bg-white border-3 border-rose-200 hover:border-rose-500 flex flex-col justify-between shadow-soft-3d group">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition">
                👒
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-900 px-3 py-1 rounded-full border border-rose-300">
                Heritage Stories
              </span>
            </div>

            <h3 className="text-2xl font-black text-rose-950 mb-2">
              Object & Story Recall
            </h3>

            <p className="text-slate-600 text-base font-medium mb-4 leading-relaxed">
              Identify classic North Eastern cultural items like the Japi hat, Xorai tray, and Living Root Bridges.
            </p>

            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100 text-sm font-semibold text-rose-900 mb-6 space-y-1">
              <div className="flex items-center justify-between">
                <span>Content:</span>
                <strong className="text-rose-800">5 Regional Stories</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Focus:</span>
                <strong className="text-rose-800">Reminiscence therapy</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <AudioButton
              textToRead="Object and Story Recall. Reconnect with familiar heritage items and fond North East memories."
              size="md"
              className="w-full bg-rose-100 text-rose-900 border-rose-300"
            />
            <button
              onClick={() => handleLaunchGame('game_object', 'North East Familiar Object and Story Recall')}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-md transition"
            >
              <Compass className="w-5 h-5" />
              <span>Start Story Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
