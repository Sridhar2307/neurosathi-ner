import React from 'react';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Home,
  Brain,
  Bell,
  Mic,
  ShieldCheck,
  Heart,
  BarChart3,
  Sparkles
} from 'lucide-react';

export default function MobileBottomNav() {
  const {
    appMode,
    currentView,
    navigateTo,
    setIsVoiceAssistantOpen,
    caregiverSession
  } = useApp();
  const { speakText, t } = useAccessibility();

  if (appMode === 'landing') {
    return null;
  }

  // --- Elder Mode Bottom Navigation ---
  if (appMode === 'elder') {
    const isGames = currentView.startsWith('game') || currentView === 'games_hub';

    return (
      <nav
        aria-label="Mobile Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t-2 border-teal-200 shadow-2xl px-2 py-1.5 flex items-center justify-around"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* 1. Home */}
        <button
          onClick={() => {
            navigateTo('elder', 'dashboard');
            speakText(t.navToHome || t.home);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 ${
            currentView === 'dashboard'
              ? 'text-teal-900 font-black bg-teal-100/80 shadow-sm'
              : 'text-slate-500 font-semibold hover:text-teal-800'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'dashboard' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight">{t.home || 'Home'}</span>
        </button>

        {/* 2. Mind Games */}
        <button
          onClick={() => {
            navigateTo('elder', 'games_hub');
            speakText(t.navToGames || t.mindGames);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 ${
            isGames
              ? 'text-teal-900 font-black bg-teal-100/80 shadow-sm'
              : 'text-slate-500 font-semibold hover:text-teal-800'
          }`}
        >
          <Brain className={`w-5 h-5 text-amber-500 ${isGames ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight">{t.mindGames || 'Games'}</span>
        </button>

        {/* 3. Voice Sathi (Central Highlight Button) */}
        <button
          onClick={() => {
            setIsVoiceAssistantOpen(true);
            speakText(t.voiceListening || "Voice Sathi is listening. Speak or tap a command.");
          }}
          className="flex-1 flex flex-col items-center justify-center -mt-4 group active:scale-90 transition"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-lg ring-4 ring-white shadow-amber-500/30">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-black text-amber-900 mt-0.5 tracking-tight">
            {t.voiceGuidance || 'Voice'}
          </span>
        </button>

        {/* 4. Reminders */}
        <button
          onClick={() => {
            navigateTo('elder', 'reminders');
            speakText(t.navToReminders || t.reminders);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 ${
            currentView === 'reminders'
              ? 'text-teal-900 font-black bg-teal-100/80 shadow-sm'
              : 'text-slate-500 font-semibold hover:text-teal-800'
          }`}
        >
          <Bell className={`w-5 h-5 text-teal-600 ${currentView === 'reminders' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight">{t.reminders || 'Reminders'}</span>
        </button>

        {/* 5. Caregiver Portal */}
        <button
          onClick={() => {
            navigateTo('caregiver', 'dashboard');
            speakText(t.caregiverMode || 'Switching to Caregiver Portal');
          }}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-500 font-semibold hover:text-slate-900 transition active:scale-95"
        >
          <ShieldCheck className="w-5 h-5 text-cyan-600" />
          <span className="text-[11px] mt-0.5 tracking-tight">{t.caregiver || 'Caregiver'}</span>
        </button>
      </nav>
    );
  }

  // --- Caregiver Mode Bottom Navigation ---
  if (appMode === 'caregiver' && caregiverSession && currentView !== 'login') {
    return (
      <nav
        aria-label="Caregiver Mobile Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl px-2 py-1.5 flex items-center justify-around"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => navigateTo('caregiver', 'dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 ${
            currentView === 'dashboard'
              ? 'text-cyan-300 font-bold bg-slate-800 shadow'
              : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.overview || 'Overview'}</span>
        </button>

        <button
          onClick={() => navigateTo('caregiver', 'analytics')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 ${
            currentView === 'analytics'
              ? 'text-cyan-300 font-bold bg-slate-800 shadow'
              : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] mt-0.5">{t.cognitiveTrends || 'Trends'}</span>
        </button>

        <button
          onClick={() => navigateTo('caregiver', 'reminders_mgr')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 ${
            currentView === 'reminders_mgr'
              ? 'text-cyan-300 font-bold bg-slate-800 shadow'
              : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <Bell className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] mt-0.5">{t.scheduleMeds || 'Meds'}</span>
        </button>

        <button
          onClick={() => navigateTo('caregiver', 'ai_view')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-95 ${
            currentView === 'ai_view'
              ? 'text-cyan-300 font-bold bg-slate-800 shadow'
              : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5">{t.aiInsights || 'AI'}</span>
        </button>

        <button
          onClick={() => navigateTo('elder', 'dashboard')}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-teal-400 font-medium hover:text-teal-300 transition active:scale-95"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="text-[10px] mt-0.5">{t.elderView || 'Elder'}</span>
        </button>
      </nav>
    );
  }

  return null;
}
