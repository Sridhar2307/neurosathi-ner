import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  ArrowLeft,
  Brain,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Layers
} from 'lucide-react';

export default function CaregiverAnalytics() {
  const { navigateTo, activePatientId, activePatient } = useApp();
  const { t } = useAccessibility();
  const [games, setGames] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getGameResults(activePatientId);
      setGames(data);
    };
    loadData();
  }, [activePatientId]);

  const chartData = games.map((g, idx) => ({
    name: `Game ${idx + 1}`,
    score: g.score,
    duration: g.duration_seconds,
    mistakes: g.mistakes,
    gameType: g.game_type.replace('_', ' ')
  })).reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('caregiver', 'dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.overview ? `← ${t.overview}` : (t.backToHome || "Back to Overview")}</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-cyan-900/60 text-cyan-300 px-3 py-1 rounded-full border border-cyan-700">
            {t.patient || "Patient"}: {activePatient?.name || 'Elder'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">{t.cognitiveTrends || "Cognitive Analytics & Session Telemetry"}</h1>
        <p className="text-sm text-slate-400">
          Detailed cognitive breakdown across Visual Recognition, Working Memory, and Auditory Processing domains for <strong className="text-cyan-300">{activePatient?.name || 'this patient'}</strong>.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-slate-800 p-12 rounded-3xl border border-slate-700 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 flex items-center justify-center text-3xl mx-auto">
            📊
          </div>
          <h3 className="text-xl font-bold text-white">No Mind Game Telemetry Recorded Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Telemetry and cognitive score progression for <strong className="text-cyan-300">{activePatient?.name || 'this patient'}</strong> will automatically appear here as they play memory and rhythm games in Elder Mode.
          </p>
        </div>
      ) : (
        <>
          {/* Main Score Progression Chart */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Cognitive Score Over Sessions (%)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} name="Score (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session Latency & Error Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
              <h3 className="text-lg font-bold text-white">Session Duration (Seconds)</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="duration" fill="#a855f7" radius={[6, 6, 0, 0]} name="Duration (s)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
              <h3 className="text-lg font-bold text-white">Mistakes / Re-attempts per Session</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="mistakes" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Mistakes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
