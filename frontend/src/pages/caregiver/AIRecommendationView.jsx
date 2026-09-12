import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import {
  ArrowLeft,
  Sparkles,
  Brain,
  CheckCircle2,
  Sliders,
  Play,
  Info,
  User,
  Activity,
  Award,
  Flame,
  Volume2,
  TrendingUp,
  Clock,
  Layers,
  Music,
  RotateCcw,
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function AIRecommendationView() {
  const { navigateTo, activePatientId, activePatient, userProfile, showToast } = useApp();
  const { t, speakText } = useAccessibility();
  const [rec, setRec] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const patient = activePatient || userProfile;

  useEffect(() => {
    const fetchAI = async () => {
      setLoading(true);
      const [aiRes, scores] = await Promise.all([
        api.getAIRecommendation(activePatientId),
        api.getGameResults(activePatientId)
      ]);
      setRec(aiRes);
      setGameResults(scores || []);
      setLoading(false);
    };
    fetchAI();
  }, [activePatientId]);

  // Map AI recommended game slug to Elder navigation view key
  const getGameViewKey = (gameSlug) => {
    switch (gameSlug) {
      case 'memory_match':
        return 'game_memory';
      case 'sequence_recall':
        return 'game_sequence';
      case 'object_recognition':
        return 'game_object';
      case 'daily_life_sequence':
        return 'game_daily_life';
      default:
        return 'game_memory';
    }
  };

  const handleLaunchGame = () => {
    if (!rec) return;
    const viewKey = getGameViewKey(rec.recommended_game);
    if (rec.encouraging_voice_message) {
      speakText(rec.encouraging_voice_message);
    }
    showToast(`Launching ${rec.recommended_game_name} in Elder View 🚀`);
    navigateTo('elder', viewKey);
  };

  // Compute cognitive domain scores for Explainable AI (XAI)
  const calculateDomainStats = () => {
    const memoryScores = gameResults.filter(g => g.game_type === 'memory_match').map(g => g.score);
    const sequenceScores = gameResults.filter(g => g.game_type === 'sequence_recall').map(g => g.score);
    const objectScores = gameResults.filter(g => g.game_type === 'object_recognition').map(g => g.score);
    const dailyScores = gameResults.filter(g => g.game_type === 'daily_life_sequence').map(g => g.score);

    const avg = arr => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

    return [
      {
        id: 'memory_match',
        name: 'Visual Associative Memory',
        game: 'Heritage Memory Match',
        avgScore: avg(memoryScores),
        sessions: memoryScores.length,
        icon: Brain,
        color: 'cyan',
        description: 'Measures visual pattern pairing, spatial working memory, and icon retention.'
      },
      {
        id: 'sequence_recall',
        name: 'Auditory & Sequential Memory',
        game: 'NER Rhythm & Sequence Recall',
        avgScore: avg(sequenceScores),
        sessions: sequenceScores.length,
        icon: Music,
        color: 'purple',
        description: 'Assesses chronological working memory, rhythmic timing, and audio stimulus processing.'
      },
      {
        id: 'object_recognition',
        name: 'Cultural Associative Recall',
        game: 'North East Object & Story Recall',
        avgScore: avg(objectScores),
        sessions: objectScores.length,
        icon: Layers,
        color: 'rose',
        description: 'Stimulates long-term autobiographical and cultural reminiscence therapy.'
      },
      {
        id: 'daily_life_sequence',
        name: 'Procedural & Daily Life Memory',
        game: 'Daily Life Sequencing',
        avgScore: avg(dailyScores),
        sessions: dailyScores.length,
        icon: Activity,
        color: 'emerald',
        description: 'Reinforces daily executive function, routine sequencing, and domestic independence.'
      }
    ];
  };

  const domainStats = calculateDomainStats();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-900 min-h-screen text-slate-100">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => navigateTo('caregiver', 'dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.overview ? `← ${t.overview}` : (t.backToHome || "Back to Overview")}</span>
        </button>

        {patient && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs sm:text-sm font-semibold">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Patient: <strong className="text-white">{patient.name}</strong></span>
            {patient.age && <span className="text-slate-400">• {patient.age} yrs</span>}
            {patient.medical_stage && (
              <span className="hidden sm:inline bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800 text-[11px]">
                {patient.medical_stage}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Title Banner */}
      <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>SIH 2026 Adaptive Cognitive Engine (SIH26003)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <span>AI Cognitive Personalization &amp; Heuristics</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Continuously evaluates session accuracy, reaction latency, and mistake rates across four regional cognitive pillars to calibrate personalized difficulty and generate encouraging therapy prompts.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-slate-800/80 rounded-3xl p-12 border border-slate-700 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-slate-300 font-bold text-base">Analyzing Cognitive Telemetry &amp; Calibrating Adaptive Recommendation...</p>
        </div>
      ) : rec && (
        /* Main Recommendation Spotlight Card */
        <div className="bg-gradient-to-br from-cyan-950/90 via-slate-800 to-indigo-950/90 p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/50 shadow-2xl space-y-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Active Clinical Prescription
                </span>
                <span className="text-slate-400 text-xs">• Today's Optimal Session</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {rec.recommended_game_name}
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-cyan-900/70 border border-cyan-400/60 px-4 py-2 rounded-2xl text-cyan-200 font-bold text-sm shadow-sm">
                <Sliders className="w-4 h-4 text-cyan-300" />
                <span>Difficulty: <strong className="capitalize text-white">{rec.recommended_difficulty}</strong></span>
              </div>

              <button
                onClick={handleLaunchGame}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/40 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch in Elder View</span>
              </button>
            </div>
          </div>

          {/* Encouraging Voice Prompt Banner with Audio playback */}
          {rec.encouraging_voice_message && (
            <div className="bg-teal-950/60 border border-teal-500/40 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-teal-300">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
                    Patient Encouraging Voice Prompt (Text-to-Speech)
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-teal-50 italic">
                    "{rec.encouraging_voice_message}"
                  </p>
                </div>
              </div>

              <AudioButton
                textToRead={rec.encouraging_voice_message}
                size="md"
                className="bg-teal-600 hover:bg-teal-500 text-white border-none shadow-md"
              />
            </div>
          )}

          {/* Reasoning and Clinical Note Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2.5 bg-slate-900/70 p-5 rounded-2xl border border-slate-700/80">
              <div className="flex items-center gap-2 text-cyan-400">
                <Brain className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Algorithmic Reasoning</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {rec.reasoning}
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-900/70 p-5 rounded-2xl border border-cyan-900/50">
              <div className="flex items-center gap-2 text-purple-400">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Caregiver Clinical Guidance</h3>
              </div>
              <p className="text-sm text-purple-200 leading-relaxed font-medium">
                {rec.caregiver_note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explainable AI (XAI): 4 Cognitive Domains Performance Breakdown */}
      <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Explainable AI (XAI) Cognitive Domain Breakdown</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Real session performance analytics guiding personalized exercise assignment.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            Total Sessions Tracked: <strong className="text-white">{gameResults.length}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainStats.map((dom) => {
            const IconComponent = dom.icon;
            const isRecommended = rec?.recommended_game === dom.id;
            const hasData = dom.avgScore !== null;

            return (
              <div
                key={dom.id}
                className={`p-5 rounded-2xl border transition ${
                  isRecommended
                    ? 'bg-cyan-950/40 border-cyan-500/70 ring-2 ring-cyan-500/20'
                    : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      dom.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                      dom.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                      dom.color === 'rose' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{dom.name}</h4>
                      <p className="text-xs text-slate-400">{dom.game}</p>
                    </div>
                  </div>

                  {isRecommended && (
                    <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {dom.description}
                </p>

                {/* Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">
                      {hasData ? `${dom.sessions} session${dom.sessions > 1 ? 's' : ''}` : 'No session data yet'}
                    </span>
                    <span className={hasData ? 'text-white font-bold' : 'text-slate-500'}>
                      {hasData ? `${dom.avgScore}% Accuracy` : 'Starting Baseline'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hasData && dom.avgScore >= 85 ? 'bg-emerald-500' :
                        hasData && dom.avgScore >= 65 ? 'bg-cyan-500' :
                        hasData ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${hasData ? dom.avgScore : 25}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive Algorithm Heuristic Rulebook */}
      <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>Clinical Adaptive Calibration Rules</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-1.5">
            <strong className="text-emerald-400 block font-bold text-sm">Score ≥ 85% &amp; ≤ 2 Errors</strong>
            <p className="text-slate-300 leading-relaxed">
              Auto-promotes difficulty from Gentle (Easy) to Standard (Medium) or Challenging (Hard) to gently stimulate neural plasticity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-1.5">
            <strong className="text-cyan-400 block font-bold text-sm">Score 60% – 84%</strong>
            <p className="text-slate-300 leading-relaxed">
              Maintains current difficulty to build positive cognitive reinforcement, task familiarity, and self-efficacy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-1.5">
            <strong className="text-rose-400 block font-bold text-sm">Score &lt; 60% or Confusion</strong>
            <p className="text-slate-300 leading-relaxed">
              Immediately lowers complexity to eliminate frustration and activates supportive regional voice hints.
            </p>
          </div>
        </div>
      </div>

      {/* Non-Medical Disclaimer Footer */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Non-Diagnostic Clinical Disclaimer:</strong> {rec?.disclaimer || "AI Cognitive Assistance is engineered for cognitive stimulation, reminiscence engagement, and daily routine adherence tracking, not for formal neurological diagnosis."}
        </p>
      </div>
    </div>
  );
}
