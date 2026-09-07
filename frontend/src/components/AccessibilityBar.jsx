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
    setLanguage,
    availableLanguages,
    speakText,
    cycleFontSize,
    cycleTheme
  } = useAccessibility();

  const { isOnline } = useApp();

  return (
    <aside aria-label="Accessibility & Preferences Bar" className="bg-slate-900 text-white text-sm py-2 px-4 shadow-inner flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 border-b border-slate-700">
      {/* Left: Quick Access Controls */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-4">
        {/* Font Size Button */}
        <button
          onClick={cycleFontSize}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition text-xs sm:text-sm font-semibold"
          title="Change Text Size"
          aria-label="Text Size"
        >
          <Type className="w-4 h-4 text-amber-400" />
          <span>Text: <strong className="text-amber-300 uppercase">{fontSize}</strong></span>
        </button>

        {/* Contrast Theme Button */}
        <button
          onClick={cycleTheme}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition text-xs sm:text-sm font-semibold"
          title="Toggle Contrast Mode (Default / Warm Brown)"
          aria-label="Contrast Mode"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>Theme: <strong className="text-amber-300 font-bold">{theme === 'warm_sepia' ? 'Warm Brown' : 'Default'}</strong></span>
        </button>

        {/* Voice Read Aloud Toggle */}
        <button
          onClick={() => {
            const next = !autoVoiceRead;
            setAutoVoiceRead(next);
            if (next) speakText("Voice guidance is turned on.");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition text-xs sm:text-sm font-semibold ${
            autoVoiceRead ? 'bg-teal-900 text-teal-200 border-teal-500' : 'bg-slate-800 text-slate-400 border-slate-600'
          }`}
          title="Toggle Automatic Voice Guidance"
        >
          {autoVoiceRead ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
          <span>Voice: <strong>{autoVoiceRead ? 'ON' : 'OFF'}</strong></span>
        </button>
      </div>

      {/* Right: Language Selector & Status */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-600">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              const langObj = availableLanguages.find(l => l.code === e.target.value);
              if (langObj) speakText(`${langObj.name} selected. ${langObj.greeting}`);
            }}
            className="bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-medium"
            aria-label="Select Language"
          >
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.native} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* Online / Offline Sync Indicator */}
        <div
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
          }`}
          title={isOnline ? "Connected to Cloud & AI Engine" : "Offline-First Mode Active (Auto Sync)"}
        >
          {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
          <span className="hidden sm:inline">{isOnline ? 'Cloud Synced' : 'Offline Ready'}</span>
        </div>
      </div>
    </aside>
  );
}
