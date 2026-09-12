import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Sparkles,
  Brain,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Play,
  Info
} from 'lucide-react';

export default function AIRecommendationView() {
  const { navigateTo, activePatientId, activePatient } = useApp();
  const { t } = useAccessibility();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      setLoading(true);
      const res = await api.getAIRecommendation(activePatientId);
      setRec(res);
      setLoading(false);
    };
    fetchAI();
  }, [activePatientId]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-900 min-h-screen text-slate-100">
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
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>SIH 2026 Deterministic AI Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-white">AI Cognitive Personalization & Heuristics</h1>
        <p className="text-sm text-slate-400">
          Analyzes historical session accuracy, response latency, and reminder adherence to continuously calibrate cognitive difficulty.
        </p>
      </div>

      {/* Main AI Recommendation Card */}
      {rec && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-cyan-700/60 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-700 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Active AI Recommendation
              </span>
              <h2 className="text-2xl font-black text-white">
                {rec.recommended_game_name}
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-cyan-900/60 border border-cyan-500 px-4 py-1.5 rounded-full text-cyan-200 font-bold text-sm">
              <Sliders className="w-4 h-4" />
              <span>Recommended Difficulty: <strong className="capitalize text-white">{rec.recommended_difficulty}</strong></span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Algorithmic Reasoning</h3>
            <p className="text-base text-slate-200 leading-relaxed font-medium bg-slate-900/60 p-4 rounded-2xl border border-slate-700">
              {rec.reasoning}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Caregiver Clinical Note</h3>
            <p className="text-sm text-cyan-300 bg-cyan-950/40 p-4 rounded-2xl border border-cyan-800">
              {rec.caregiver_note}
            </p>
          </div>
        </div>
      )}

      {/* Adaptive Algorithm Explanation */}
      <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>How Adaptive Difficulty Operates</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-1">
            <strong className="text-emerald-400 block">Score ≥ 85% & Low Errors</strong>
            <p className="text-slate-400">Promotes difficulty from Easy (2x2) to Medium (3x2) or Hard (4x2) to gently stretch working memory.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-1">
            <strong className="text-amber-400 block">Score 60% – 85%</strong>
            <p className="text-slate-400">Maintains current difficulty level to build familiarity, self-efficacy, and comfort.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-1">
            <strong className="text-rose-400 block">Score &lt; 60% or Confusion</strong>
            <p className="text-slate-400">Automatically scales down complexity and activates extra gentle regional audio hints.</p>
          </div>
        </div>
      </div>

      {/* Non-Medical Disclaimer */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Non-Diagnostic Disclaimer:</strong> {rec?.disclaimer || "AI Cognitive Assistance is designed for cognitive stimulation and engagement, not for medical diagnosis."}
        </p>
      </div>
    </div>
  );
}
