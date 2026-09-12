import React from 'react';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Brain,
  Bell,
  Heart,
  Mic,
  BarChart3,
  Settings,
  ShieldCheck,
  User,
  Home,
  Layers,
  Sparkles,
  PhoneCall,
  Globe
} from 'lucide-react';

export default function Navbar() {
  const { appMode, currentView, navigateTo, setIsVoiceAssistantOpen, userProfile, activePatient, caregiverSession } = useApp();
  const { speakText, autoVoiceRead, t, language, changeLanguage, availableLanguages } = useAccessibility();

  const currentPatient = activePatient || userProfile;

  const handleNavClick = (mode, view, audioPrompt) => {
    navigateTo(mode, view);
    if (audioPrompt) {
      speakText(audioPrompt);
    }
  };

  // --- Landing Mode Navbar ---
  if (appMode === 'landing') {
    return (
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-[41px] z-40 px-4 sm:px-8 py-3.5 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => handleNavClick('landing', 'landing', t.appName ? `${t.appName} ${t.appRegion}` : 'Welcome to NeuroSathi')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-2 shadow-md flex items-center justify-center transform group-hover:scale-105 transition">
              <img src="/brain-logo.svg" alt="NeuroSathi Logo" className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-teal-900 font-sans">
                  NeuroSathi <span className="text-amber-500">NER</span>
                </span>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-300">
                  SIH 2026 • SIH26003
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t.tagline || "AI Cognitive Gaming & Memory Assistance for North East Elders"}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('elder', 'dashboard', t.navToElder || t.elderMode)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 sm:px-6 py-2.5 rounded-2xl shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition flex items-center gap-2 text-base"
            >
              <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
              <span>{t.elderMode || "Elder Mode"}</span>
            </button>

            <button
              onClick={() => handleNavClick('caregiver', 'dashboard', t.navToCaregiver || t.caregiverMode)}
              className="bg-slate-800 hover:bg-slate-900 text-cyan-300 font-bold px-4 sm:px-6 py-2.5 rounded-2xl border border-slate-700 hover:border-cyan-500 transition flex items-center gap-2 text-base"
            >
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span className="hidden sm:inline">{t.caregiverMode || "Caregiver Portal"}</span>
              <span className="sm:hidden">{t.caregiver || "Caregiver"}</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- Elder Mode Navbar (Ultra large, simple, gentle) ---
  if (appMode === 'elder') {
    return (
      <header className="bg-white border-b-2 border-teal-100 sticky top-[41px] z-40 px-4 sm:px-8 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Logo & Greeting */}
          <button
            onClick={() => handleNavClick('elder', 'dashboard', 'Returning to Home Dashboard')}
            className="flex items-center gap-3 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-600 p-2 shadow-md flex items-center justify-center">
              <img src="/brain-logo.svg" alt="NeuroSathi Logo" className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-950 font-sans tracking-tight">
                {t.appName || "NeuroSathi"} <span className="text-amber-500">{t.appRegion || "NER"}</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-teal-700">
                {currentPatient?.name || 'Elder'}
              </p>
            </div>
          </button>

          {/* Navigation Actions for Elder */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => handleNavClick('elder', 'dashboard', t.navToHome || t.home)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2 transition ${
                currentView === 'dashboard'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>{t.home || "Home"}</span>
            </button>

            <button
              onClick={() => handleNavClick('elder', 'games_hub', t.navToGames || t.mindGames)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2 transition ${
                currentView.startsWith('game') || currentView === 'games_hub'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <Brain className="w-5 h-5 text-amber-400" />
              <span>{t.mindGames || "Mind Games"}</span>
            </button>

            <button
              onClick={() => handleNavClick('elder', 'reminders', t.navToReminders || t.reminders)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2 transition ${
                currentView === 'reminders'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <Bell className="w-5 h-5 text-teal-600" />
              <span>{t.reminders || "Reminders"}</span>
            </button>

            {/* Voice Assistant Trigger */}
            <button
              onClick={() => {
                setIsVoiceAssistantOpen(true);
                speakText(t.voiceListening || "Voice Sathi is listening. How can I assist you today?");
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 sm:px-5 py-2.5 rounded-2xl shadow-tactile-amber active:shadow-tactile-amber-pressed transform active:translate-y-1 transition flex items-center gap-2 text-base sm:text-lg animate-gentle-float"
              title="Speak to Voice Sathi Assistant"
            >
              <Mic className="w-5 h-5 text-white" />
              <span className="hidden sm:inline">{t.voiceAssistant || "Voice Sathi"}</span>
              <span className="sm:hidden">{t.voiceGuidance || "Voice"}</span>
            </button>

            {/* Switch to Caregiver View */}
            <button
              onClick={() => handleNavClick('caregiver', 'dashboard', t.caregiverMode || t.caregiver)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 ml-1 transition"
              title="Switch to Caregiver Clinical Portal"
            >
              {t.caregiver || "Caregiver"} ↗
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- Caregiver Mode Navbar ---
  const isCaregiverLoggedIn = Boolean(caregiverSession && currentView !== 'login');

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-[41px] z-40 px-4 sm:px-8 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavClick('caregiver', isCaregiverLoggedIn ? 'dashboard' : 'login')}
            className="flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600 p-1.5 flex items-center justify-center">
              <img src="/brain-logo.svg" alt="NeuroSathi Logo" className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-cyan-300 font-sans">
                  NeuroSathi <span className="text-amber-400">{t.clinicalHub || "Clinical Hub"}</span>
                </h1>
                <span className="bg-cyan-900/80 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-700">
                  {t.caregiverPortal || t.caregiverMode || "Caregiver Portal"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isCaregiverLoggedIn ? (
                  <>
                    {t.patient || "Patient"}: <strong className="text-slate-200">{activePatient?.name || 'Patient'}</strong>
                    {activePatient?.age ? ` (${t.age || 'Age'} ${activePatient.age} ${t.years || 'Years'})` : ''} • {activePatient?.location || 'Guwahati, Assam'}
                  </>
                ) : (
                  <span className="text-cyan-400/90 font-medium">{t.secureSignIn || "Caregiver Portal • Secure Clinical Sign In"}</span>
                )}
              </p>
            </div>
          </button>
        </div>

        {/* Caregiver Nav links (Only shown after authenticated login) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Language Selector in Caregiver Header */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-bold"
              aria-label={t.selectLanguage || "Select Language"}
            >
              {availableLanguages && availableLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {isCaregiverLoggedIn ? (
            <>
              <button
                onClick={() => handleNavClick('caregiver', 'dashboard')}
                className={`px-3 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${
                  currentView === 'dashboard' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t.overview || "Overview"}</span>
              </button>

              <button
                onClick={() => handleNavClick('caregiver', 'analytics')}
                className={`px-3 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${
                  currentView === 'analytics' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Brain className="w-4 h-4 text-purple-400" />
                <span>{t.cognitiveTrends || "Cognitive Trends"}</span>
              </button>

              <button
                onClick={() => handleNavClick('caregiver', 'reminders_mgr')}
                className={`px-3 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${
                  currentView === 'reminders_mgr' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>{t.scheduleMeds || "Schedule & Meds"}</span>
              </button>

              <button
                onClick={() => handleNavClick('caregiver', 'ai_view')}
                className={`px-3 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${
                  currentView === 'ai_view' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.aiInsights || "AI Insights"}</span>
              </button>

              {/* Switch to Elder View */}
              <button
                onClick={() => handleNavClick('elder', 'dashboard', t.elderView || 'Switching to Elder Mode')}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-xl ml-1 transition flex items-center gap-1 shadow-sm"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{t.elderView || "Elder View"}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavClick('landing', 'landing')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>{t.backToHome || "Back to Home"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
