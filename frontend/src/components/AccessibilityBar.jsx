import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, Eye, Type, Globe, Wifi, WifiOff, Sparkles } from 'lucide-react';

export default function AccessibilityBar() {
  const {
    fontSize,
    setFontSize,
    theme,
    setTheme,
    autoVoiceRead,
    setAutoVoiceRead,
    language,
    changeLanguage,
    availableLanguages,
    speakText,
    cycleFontSize,
    cycleTheme,
    t
  } = useAccessibility();

  const { isOnline } = useApp();

  return (
    <aside aria-label="Accessibility & Preferences Bar" className="bg-slate-900 text-white text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 shadow-inner flex items-center justify-between gap-2 border-b border-slate-700 w-full shrink-0">
      {/* Left: Quick Access Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar shrink-0">
        {/* Font Size Button */}
        <button
          onClick={cycleFontSize}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition text-xs font-semibold shrink-0"
          title="Change Text Size"
          aria-label="Text Size"
        >
          <Type className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">{t.textSize || 'Text'}: </span>
          <strong className="text-amber-300 font-bold">{fontSize.toUpperCase()}</strong>
        </button>

        {/* Contrast Theme Button */}
        <button
          onClick={cycleTheme}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition text-xs font-semibold shrink-0"
          title="Toggle Contrast Mode (Default / Warm Brown)"
          aria-label="Contrast Mode"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">{t.theme || 'Theme'}: </span>
          <strong className="text-amber-300 font-bold">{theme === 'warm_sepia' ? 'Sepia' : 'Default'}</strong>
        </button>

        {/* Voice Read Aloud Toggle */}
        <button
          onClick={() => {
            const next = !autoVoiceRead;
            setAutoVoiceRead(next);
            if (next) speakText(t.voiceGuidance ? `${t.voiceGuidance} ${t.on}` : "Voice guidance is turned on.");
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition text-xs font-semibold shrink-0 ${
            autoVoiceRead ? 'bg-teal-900 text-teal-200 border-teal-500' : 'bg-slate-800 text-slate-400 border-slate-600'
          }`}
          title="Toggle Automatic Voice Guidance"
        >
          {autoVoiceRead ? <Volume2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> : <VolumeX className="w-3.5 h-3.5 shrink-0" />}
          <span className="hidden sm:inline">{t.voiceGuidance || 'Voice'}: </span>
          <strong>{autoVoiceRead ? (t.on || 'ON') : (t.off || 'OFF')}</strong>
        </button>
      </div>

      {/* Right: Language Selector & Status */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-full border border-slate-600">
          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium max-w-[90px] sm:max-w-none"
            aria-label="Select Language"
          >
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.native}
              </option>
            ))}
          </select>
        </div>

        {/* Online / Offline Indicator */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isOnline ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-sm' : 'bg-amber-950/90 text-amber-300 border border-amber-500/60'
          }`}
          title={isOnline ? "Supabase PostgreSQL Database Active & Connected" : "Offline-First Mode Active (Auto Sync)"}
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="hidden md:inline text-[11px]">{t.cloudConnected || t.cloudSynced || "Cloud Synced"}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="hidden md:inline text-[11px]">{t.offlineReady || 'Offline'}</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
