import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import {
  ArrowLeft,
  Award,
  Flame
} from 'lucide-react';

export default function ElderProgress() {
  const { navigateTo, userProfile } = useApp();
  const { t } = useAccessibility();
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const results = await api.getGameResults();
      setGames(results);
    };
    fetchGames();
  }, []);

  const totalStars = userProfile?.total_stars || 56;
  const streak = userProfile?.current_streak || 4;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('elder', 'dashboard')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-base shadow-sm transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero Streak & Stars Summary */}
      <div className="bg-gradient-to-tr from-purple-800 via-indigo-900 to-teal-900 text-white rounded-4xl p-6 sm:p-10 shadow-xl border-4 border-purple-400 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center text-4xl mx-auto shadow-lg animate-gentle-float">
          ⭐
        </div>

        <div>
          <h1 className="text-3xl sm:text-5xl font-black font-sans tracking-tight">
            {t.progress || "My Stars & Daily Progress"}
          </h1>
          <p className="text-lg sm:text-xl text-purple-200 font-medium max-w-xl mx-auto mt-2">
            Every game you play and reminder you complete keeps your mind sharp and active!
          </p>
        </div>

        {/* Big Badges */}
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-purple-400 shadow-inner">
            <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
              <Award className="w-8 h-8 fill-amber-400" />
              <span className="text-4xl font-black">{totalStars}</span>
            </div>
            <span className="text-sm font-bold text-purple-200 uppercase tracking-wider">Total Stars</span>
          </div>

          <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-purple-400 shadow-inner">
            <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
              <Flame className="w-8 h-8 fill-orange-400" />
              <span className="text-4xl font-black">{streak} Days</span>
            </div>
            <span className="text-sm font-bold text-purple-200 uppercase tracking-wider">Active Streak</span>
          </div>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-teal-100 shadow-sm space-y-4">
        <h2 className="text-2xl font-black text-teal-950 flex items-center gap-2">
          <span>Cognitive Milestone Badges</span>
          <AudioButton textToRead="Milestone Badges. You have earned the Heritage Champion, Focus Master, and Morning Routine badges." size="sm" />
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-1">
            <span className="text-3xl">🦏</span>
            <h3 className="text-base font-bold text-emerald-950">Heritage Champion</h3>
            <p className="text-xs text-slate-600 font-medium">Completed 5+ NER cultural match games.</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center space-y-1">
            <span className="text-3xl">🥁</span>
            <h3 className="text-base font-bold text-amber-950">Rhythm Explorer</h3>
            <p className="text-xs text-slate-600 font-medium">Listened and repeated Bihu drum beats.</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-center space-y-1">
            <span className="text-3xl">💊</span>
            <h3 className="text-base font-bold text-indigo-950">Routine Master</h3>
            <p className="text-xs text-slate-600 font-medium">Consistently checked off daily medicines.</p>
          </div>
        </div>
      </div>

      {/* Recent Game Activity Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-teal-100 shadow-sm space-y-4">
        <h2 className="text-2xl font-black text-teal-950">
          Recent Mind Game History
        </h2>

        <div className="space-y-3">
          {games.slice(0, 5).map(g => (
            <div
              key={g.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                  🧠
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 capitalize">
                    {g.game_type.replace('_', ' ')} ({g.difficulty})
                  </h4>
                  <p className="text-xs font-semibold text-slate-500">
                    {g.cultural_theme || "North East Heritage"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-teal-700">{g.score}%</span>
                <span className="text-xs font-bold text-amber-600 block">+5 Stars</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
