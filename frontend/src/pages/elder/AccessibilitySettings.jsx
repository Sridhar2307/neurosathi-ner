import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useApp } from '../../context/AppContext';
import AudioButton from '../../components/AudioButton';
import {
  ArrowLeft,
  Type,
  Eye,
  Volume2,
  Globe,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

export default function AccessibilitySettings() {
  const { navigateTo } = useApp();
  const {
    fontSize,
    setFontSize,
    theme,
    setTheme,
    reducedMotion,
    setReducedMotion,
    autoVoiceRead,
    setAutoVoiceRead,
    largeButtons,
    setLargeButtons,
    language,
    changeLanguage,
    availableLanguages,
    speakText,
    t
  } = useAccessibility();

  const handleSetFont = (sz) => {
    setFontSize(sz);
    const sizeLabel = t[sz] || sz;
    const prefix = t.textSizeAnnounce || t.textSize || 'Text size:';
    speakText(`${prefix} ${sizeLabel}`);
  };

  const handleSetTheme = (th) => {
    setTheme(th);
    const themeLabel = th === 'warm_sepia' ? (t.warmBrown || 'Warm Brown') : (t.defaultTheme || 'Default');
    speakText(`${t.theme || 'Theme'}: ${themeLabel}`);
  };

  const handleSetLanguage = (langCode) => {
    changeLanguage(langCode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            speakText(t.navToHome || t.home);
            navigateTo('elder', 'dashboard');
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-base shadow-sm transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
          <span>{t.backToHome || 'Back to Home'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-teal-200 shadow-sm flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-950 font-sans tracking-tight flex items-center gap-3">
            <span>{t.settingsTitle || 'Accessibility & Comfort Center'}</span>
            <AudioButton textToRead={`${t.settingsTitle}. ${t.settingsSubtitle}`} size="lg" />
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-semibold mt-1">
            {t.settingsSubtitle || 'Personalize your screen for maximum comfort and visual clarity.'}
          </p>
        </div>
      </div>

      {/* 1. Text Size Selector */}
      <div className="elder-card p-6 sm:p-8 bg-white border-3 border-teal-100 shadow-soft-3d space-y-4">
        <div className="flex items-center gap-3">
          <Type className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-black text-slate-900">{t.textSizeHeading || 'Text Size / Typography Scale'}</h2>
        </div>

        <p className="text-base text-slate-600 font-medium">
          {t.settingsSubtitle || 'Make all texts and buttons bigger for effortless reading without straining eyes.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { id: 'small', label: t.small || 'Small', example: '16px' },
            { id: 'medium', label: t.medium || 'Medium', example: '18px' },
            { id: 'large', label: `${t.large || 'Large'} (${t.defaultTheme || 'Default'})`, example: '22px' },
            { id: 'xlarge', label: t.xlarge || 'Extra Large', example: '26px' }
          ].map(sz => (
            <button
              key={sz.id}
              onClick={() => handleSetFont(sz.id)}
              className={`p-4 rounded-2xl font-extrabold border-3 transition flex flex-col items-center justify-center gap-1 ${
                fontSize === sz.id
                  ? 'bg-teal-700 text-white border-teal-800 shadow-md'
                  : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-base">{sz.label}</span>
              <span className="text-xs opacity-75">{sz.example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. High Contrast Themes */}
      <div className="elder-card p-6 sm:p-8 bg-white border-3 border-teal-100 shadow-soft-3d space-y-4">
        <div className="flex items-center gap-3">
          <Eye className="w-8 h-8 text-cyan-500" />
          <h2 className="text-2xl font-black text-slate-900">{t.themeHeading || 'High Contrast Modes'}</h2>
        </div>

        <p className="text-base text-slate-600 font-medium">
          {t.themeHeading}: {t.defaultTheme} &amp; {t.warmBrown}.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[
            { id: 'standard', title: `${t.defaultTheme || 'Default'} (${t.softHealingTeal || 'Soft Healing Teal'})`, desc: t.defaultThemeDesc || 'Soothing organic healthcare palette with healing teal and warm amber highlights.' },
            { id: 'warm_sepia', title: `${t.warmBrown || 'Warm Brown'} (${t.sepiaPaper || 'Sepia Paper'})`, desc: t.warmBrownDesc || 'High-contrast earthy brown tone with creamy parchment background easy on sensitive eyes.' }
          ].map(th => (
            <button
              key={th.id}
              onClick={() => handleSetTheme(th.id)}
              className={`p-6 rounded-3xl text-left border-3 transition flex flex-col justify-between gap-3 ${
                theme === th.id
                  ? 'bg-amber-50/80 border-amber-600 ring-4 ring-amber-200'
                  : 'bg-white border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900">{th.title}</span>
                {theme === th.id && <CheckCircle2 className="w-7 h-7 text-amber-600" />}
              </div>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">{th.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Regional Language Selection */}
      <div className="elder-card p-6 sm:p-8 bg-white border-3 border-teal-100 shadow-soft-3d space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-black text-slate-900">{t.languageHeading || 'Regional Language'}</h2>
        </div>

        <p className="text-base text-slate-600 font-medium">
          {t.voiceAssistantSubtitle || 'Select your native North Eastern language for familiar prompts, audio narration, and game guidance.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {availableLanguages && availableLanguages.map(l => (
            <button
              key={l.code}
              onClick={() => handleSetLanguage(l.code, l.name)}
              className={`p-4 rounded-2xl font-black border-3 transition flex flex-col items-center justify-center gap-1 text-center ${
                language === l.code
                  ? 'bg-teal-700 text-white border-teal-800 shadow-md'
                  : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">{l.name}</span>
              <span className="text-xs opacity-80">{l.native}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Voice & Interaction Toggles */}
      <div className="elder-card p-6 sm:p-8 bg-white border-3 border-teal-100 shadow-soft-3d space-y-6">
        <div className="flex items-center gap-3">
          <Volume2 className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-black text-slate-900">{t.voiceNarrationHeading || 'Voice & Motion Preferences'}</h2>
        </div>

        <div className="space-y-4">
          {/* Voice Guidance */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.autoVoiceTitle || 'Automatic Voice Read Aloud'}</h3>
              <p className="text-sm font-semibold text-slate-500">{t.autoVoiceDesc || 'Speaks out titles, cards, and game prompts automatically.'}</p>
            </div>
            <button
              onClick={() => {
                const next = !autoVoiceRead;
                setAutoVoiceRead(next);
                if (next) speakText(t.voiceGuidanceEnabled || "Voice guidance enabled.");
              }}
              className={`px-6 py-3 rounded-2xl font-extrabold text-base transition ${
                autoVoiceRead ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {autoVoiceRead ? (t.on || 'ON') : (t.off || 'OFF')}
            </button>
          </div>

          {/* Large Touch Targets */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.largeTouchTitle || 'Extra Large Touch Targets'}</h3>
              <p className="text-sm font-semibold text-slate-500">{t.largeTouchDesc || 'Enlarges clickable buttons to 60px minimum for tremor-safe tapping.'}</p>
            </div>
            <button
              onClick={() => {
                const next = !largeButtons;
                setLargeButtons(next);
                if (next) speakText(t.largeButtonsEnabled || "Extra large touch buttons enabled.");
              }}
              className={`px-6 py-3 rounded-2xl font-extrabold text-base transition ${
                largeButtons ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {largeButtons ? (t.on || 'ON') : (t.off || 'OFF')}
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.reducedMotionTitle || 'Reduced Motion Mode'}</h3>
              <p className="text-sm font-semibold text-slate-500">{t.reducedMotionDesc || 'Disables floating cards and animations to prevent dizziness.'}</p>
            </div>
            <button
              onClick={() => {
                const next = !reducedMotion;
                setReducedMotion(next);
                if (next) speakText(t.reducedMotionEnabled || "Reduced motion mode enabled.");
              }}
              className={`px-6 py-3 rounded-2xl font-extrabold text-base transition ${
                reducedMotion ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {reducedMotion ? (t.on || 'ON') : (t.off || 'OFF')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
