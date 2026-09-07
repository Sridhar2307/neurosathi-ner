import React from 'react';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Brain,
  Bell,
  Heart,
  Mic,
  ShieldCheck,
  Globe2,
  Sparkles,
  WifiOff,
  Activity,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  Volume2
} from 'lucide-react';

export default function LandingPage() {
  const { navigateTo } = useApp();
  const { speakText, autoVoiceRead } = useAccessibility();

  const handleStartElder = () => {
    if (autoVoiceRead) speakText("Welcome to NeuroSathi Elder Mode. Starting your day!");
    navigateTo('elder', 'dashboard');
  };

  const handleStartCaregiver = () => {
    navigateTo('caregiver', 'login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/70 via-white to-emerald-50/50 pb-20">
      {/* SIH 2026 Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md">
        <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold text-[11px] uppercase">
          Smart India Hackathon 2026
        </span>
        <span>Problem ID: <strong>SIH26003</strong> • Team <strong>Mavericks</strong> • Space & Healthcare Tech</span>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-12 text-center">
        {/* Cultural Motto Pills */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/80 border border-teal-300 text-teal-900 font-bold text-xs sm:text-sm mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>PLAY • REMEMBER • CONNECT • CARE</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-teal-950 font-sans tracking-tight leading-tight max-w-5xl mx-auto mb-6">
          AI-Powered Cognitive & Memory Assistance for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Elderly Dementia Care</span> in North Eastern India
        </h1>

        <p className="text-lg sm:text-2xl text-slate-700 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          A culturally familiar, ultra-accessible cognitive gaming and daily routine companion specially tailored for elders in Assam, Manipur, Mizoram, Meghalaya, and across the North Eastern Region.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-xl mx-auto mb-16">
          <button
            onClick={handleStartElder}
            className="w-full sm:w-auto px-8 py-5 rounded-3xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xl sm:text-2xl shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition flex items-center justify-center gap-3 border-2 border-teal-500 group"
          >
            <Heart className="w-7 h-7 text-rose-300 fill-rose-300 group-hover:scale-110 transition" />
            <span>Open Elder Mode</span>
            <ArrowRight className="w-6 h-6 text-teal-200" />
          </button>

          <button
            onClick={handleStartCaregiver}
            className="w-full sm:w-auto px-8 py-5 rounded-3xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-extrabold text-xl sm:text-2xl border-2 border-slate-700 hover:border-cyan-400 transition flex items-center justify-center gap-3 shadow-lg"
          >
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            <span>Caregiver Portal</span>
          </button>
        </div>

        {/* 3D Floating Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-6xl mx-auto mb-16">
          {/* Card 1 */}
          <div className="elder-card p-6 bg-white border-2 border-teal-100 hover:border-teal-400 transition shadow-soft-3d">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4 text-3xl shadow-sm">
              🧠
            </div>
            <h3 className="text-xl font-bold text-teal-950 mb-2">NER Cultural Cognitive Games</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              3 adaptive games featuring Assam tea leaves, Kaziranga Rhinos, Bihu Dhols, and Mizo Cheraw bamboos to stimulate working memory.
            </p>
          </div>

          {/* Card 2 */}
          <div className="elder-card p-6 bg-white border-2 border-amber-100 hover:border-amber-400 transition shadow-soft-3d">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 text-3xl shadow-sm">
              🎤
            </div>
            <h3 className="text-xl font-bold text-amber-950 mb-2">Voice Sathi & Regional Audio</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              Browser-native speech recognition & text-to-speech with multi-language phrases in Assamese, Bengali, Hindi, Manipuri, and Mizo.
            </p>
          </div>

          {/* Card 3 */}
          <div className="elder-card p-6 bg-white border-2 border-emerald-100 hover:border-emerald-400 transition shadow-soft-3d">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 text-3xl shadow-sm">
              📊
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-2">Caregiver Telemetry & Alerts</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              Tracks medication adherence, cognitive performance trends, missed reminders, and AI difficulty recommendations in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* 6 Pillars / Solution Architecture Section */}
      <section className="bg-white py-16 border-y border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Why NeuroSathi Stands Out
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-950 mt-3">
              Comprehensive 6-Pillar Platform Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-teal-50/60 border border-teal-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">1</span>
                <h4 className="text-lg font-bold text-teal-950">AI Cognitive Games</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dynamically adjusts game complexity based on reaction time, memory accuracy, and error frequency.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm">2</span>
                <h4 className="text-lg font-bold text-amber-950">Memory Assistance</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Large visual cards with voice prompts for morning blood pressure meds, daily hydration, and doctor visits.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">3</span>
                <h4 className="text-lg font-bold text-indigo-950">Voice & Language Support</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Zero typing needed. Elders can simply speak commands like "Read my reminders" or "Start game".
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-rose-50/60 border border-rose-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm">4</span>
                <h4 className="text-lg font-bold text-rose-950">NER Cultural Content</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Familiar indigenous folklore, Japi, Xorai, Loktak Lake, and traditional music stimulate long-term episodic memory.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-cyan-50/60 border border-cyan-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">5</span>
                <h4 className="text-lg font-bold text-cyan-950">Caregiver Dashboard</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Empowers family members and nurses with score timelines, missed dose alerts, and peace of mind.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">6</span>
                <h4 className="text-lg font-bold text-emerald-950">Offline-First Resilience</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Functions without active internet connection in remote hill terrains, automatically syncing when connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alignment with National Priorities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-8">Aligned With National Strategic Priorities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-teal-800 mb-2">🇮🇳 DIGITAL INDIA</h4>
            <p className="text-xs text-slate-600">Empowering senior citizens through intuitive, voice-enabled assistive technology.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-amber-800 mb-2">🏥 INCLUSIVE HEALTHCARE</h4>
            <p className="text-xs text-slate-600">Aligning with WHO non-pharmacological cognitive stimulation guidelines for dementia care.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-emerald-800 mb-2">🌿 MDoNER INITIATIVES</h4>
            <p className="text-xs text-slate-600">Bridging remote North Eastern healthcare gaps with offline-first digital infrastructure.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
