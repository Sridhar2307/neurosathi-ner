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
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 px-3 sm:px-8 py-2.5 sm:py-3.5 transition-all shadow-sm w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => handleNavClick('landing', 'landing', t.appName ? `${t.appName} ${t.appRegion}` : 'Welcome to NeuroSathi')}
            className="flex items-center gap-2 sm:gap-3 text-left group shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-1.5 sm:p-2 shadow-md flex items-center justify-center transform group-hover:scale-105 transition shrink-0">
              <img src="/brain-logo.svg" alt="NeuroSathi Logo" className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-teal-900 font-sans">
                  NeuroSathi <span className="text-amber-500">NER</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-300">
                  SIH 2026 • SIH26003
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t.tagline || "AI Cognitive Gaming & Memory Assistance for North East Elders"}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleNavClick('elder', 'dashboard', t.navToElder || t.elderMode)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 fill-rose-300" />
              <span>{t.elderMode || "Elder Mode"}</span>
            </button>

            <button
              onClick={() => handleNavClick('caregiver', 'dashboard', t.navToCaregiver || t.caregiverMode)}
              className="bg-slate-800 hover:bg-slate-900 text-cyan-300 font-bold px-3 sm:px-6 py-2 sm:py-2.5 rounded-2xl border border-slate-700 hover:border-cyan-500 transition flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            >
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <span className="hidden sm:inline">{t.caregiverMode || "Caregiver Portal"}</span>
              <span className="sm:hidden">{t.caregiver || "Caregiver"}</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- Elder Mode Navbar ---
  if (appMode === 'elder') {
    return (
      <header className="bg-white border-b-2 border-teal-100 px-3 sm:px-8 py-2 sm:py-3 shadow-md w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Greeting */}
          <button
            onClick={() => handleNavClick('elder', 'dashboard', 'Returning to Home Dashboard')}
            className="flex items-center gap-2 sm:gap-3 text-left min-w-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-600 p-1.5 sm:p-2 shadow-md flex items-center justify-center shrink-0">
              <img src="/brain-logo.svg" alt="NeuroSathi Logo" className="w-full h-full" />
            </div>
            <div className="truncate">
              <h1 className="text-lg sm:text-2xl font-extrabold text-teal-950 font-sans tracking-tight truncate">
                {t.appName || "NeuroSathi"} <span className="text-amber-500">{t.appRegion || "NER"}</span>
              </h1>
              <p className="text-xs font-semibold text-teal-700 truncate">
                {currentPatient?.name || 'Elder'}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links (Hidden on Mobile; available via MobileBottomNav) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => handleNavClick('elder', 'dashboard', t.navToHome || t.home)}
              className={`px-3.5 py-2 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition ${
                currentView === 'dashboard'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t.home || "Home"}</span>
            </button>

            <button
              onClick={() => handleNavClick('elder', 'games_hub', t.navToGames || t.mindGames)}
              className={`px-3.5 py-2 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition ${
                currentView.startsWith('game') || currentView === 'games_hub'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>{t.mindGames || "Mind Games"}</span>
            </button>

            <button
              onClick={() => handleNavClick('elder', 'reminders', t.navToReminders || t.reminders)}
              className={`px-3.5 py-2 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition ${
                currentView === 'reminders'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
              <span>{t.reminders || "Reminders"}</span>
            </button>
          </div>

          {/* Right Action Icons for Elder */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Voice Assistant Trigger */}
            <button
              onClick={() => {
                setIsVoiceAssistantOpen(true);
                speakText(t.voiceListening || "Voice Sathi is listening. How can I assist you today?");
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3 sm:px-4 py-2 sm:py-2 rounded-2xl shadow-tactile-amber active:shadow-tactile-amber-pressed transform active:translate-y-1 transition flex items-center gap-1.5 text-xs sm:text-base animate-gentle-float"
              title="Speak to Voice Sathi Assistant"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="hidden sm:inline">{t.voiceAssistant || "Voice Sathi"}</span>
              <span className="sm:hidden">{t.voiceGuidance || "Voice"}</span>
            </button>

            {/* Switch to Caregiver View */}
            <button
              onClick={() => handleNavClick('caregiver', 'dashboard', t.caregiverMode || t.caregiver)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-2 rounded-xl border border-slate-300 transition"
              title="Switch to Caregiver Clinical Portal"
            >
              <span className="hidden sm:inline">{t.caregiver || "Caregiver"} ↗</span>
              <span className="sm:hidden">Caregiver ↗</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- Caregiver Mode Navbar ---
  const isCaregiverLoggedIn = Boolean(caregiverSession && currentView !== 'login');

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-8 py-2.5 sm:py-3 shadow-md w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => handleNavClick('caregiver', isCaregiverLoggedIn ? 'dashboard' : 'login')}
            className="flex items-center gap-2 sm:gap-3 text-left min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-600 p-1.5 flex items-center justify-center shrink-0">
              <img src="/brain-logo.svg" alt="NeuroSathi Logo" className="w-full h-full" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-cyan-300 font-sans truncate">
                  NeuroSathi <span className="text-amber-400 hidden sm:inline">{t.clinicalHub || "Clinical Hub"}</span>
                </h1>
                <span className="bg-cyan-900/80 text-cyan-200 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-cyan-700 shrink-0">
                  {t.caregiver || "Caregiver"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {isCaregiverLoggedIn ? (
                  <>
                    <strong className="text-slate-200">{activePatient?.name || 'Patient'}</strong>
                    {activePatient?.age ? ` (${activePatient.age}y)` : ''}
                  </>
                ) : (
                  <span className="text-cyan-400/90 font-medium">{t.secureSignIn || "Sign In"}</span>
                )}
              </p>
            </div>
          </button>
        </div>

        {/* Caregiver Nav links (Desktop only; on mobile, available via MobileBottomNav) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Language Selector in Caregiver Header */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-bold max-w-[80px] sm:max-w-none"
              aria-label={t.selectLanguage || "Select Language"}
            >
              {availableLanguages && availableLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.native}
                </option>
              ))}
            </select>
          </div>

          {isCaregiverLoggedIn ? (
            <>
              {/* Desktop links */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('caregiver', 'dashboard')}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 ${
                    currentView === 'dashboard' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t.overview || "Overview"}</span>
                </button>

                <button
                  onClick={() => handleNavClick('caregiver', 'analytics')}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 ${
                    currentView === 'analytics' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>{t.cognitiveTrends || "Trends"}</span>
                </button>

                <button
                  onClick={() => handleNavClick('caregiver', 'reminders_mgr')}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 ${
                    currentView === 'reminders_mgr' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>{t.scheduleMeds || "Meds"}</span>
                </button>

                <button
                  onClick={() => handleNavClick('caregiver', 'ai_view')}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 ${
                    currentView === 'ai_view' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t.aiInsights || "AI"}</span>
                </button>
              </div>

              {/* Switch to Elder View */}
              <button
                onClick={() => handleNavClick('elder', 'dashboard', t.elderView || 'Switching to Elder Mode')}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition flex items-center gap-1 shadow-sm"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">{t.elderView || "Elder View"}</span>
                <span className="sm:hidden">Elder</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavClick('landing', 'landing')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>{t.backToHome || "Home"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
