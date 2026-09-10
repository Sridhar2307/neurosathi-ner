import React from 'react';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AudioButton from '../components/AudioButton';
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
  const { speakText, t } = useAccessibility();

  const handleStartElder = () => {
    speakText(t.navToElder || "Welcome to NeuroSathi Elder Mode. Starting your day!");
    navigateTo('elder', 'dashboard');
  };

  const handleStartCaregiver = () => {
    speakText(t.navToCaregiver || "Opening Caregiver Clinical Portal.");
    navigateTo('caregiver', 'login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/70 via-white to-emerald-50/50 pb-20">
      {/* SIH 2026 Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md">
        <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold text-[11px] uppercase">
          {t.sihBadge || 'Smart India Hackathon 2026'}
        </span>
        <span>Problem ID: <strong>SIH26003</strong> • Team <strong>Mavericks</strong> • Space &amp; Healthcare Tech</span>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-12 text-center">
        {/* Cultural Motto Pills */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/80 border border-teal-300 text-teal-900 font-bold text-xs sm:text-sm mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{t.landingMotto || "PLAY • REMEMBER • CONNECT • CARE"}</span>
        </div>

        {/* Main Title with Voice Read Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-5xl mx-auto mb-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-teal-950 font-sans tracking-tight leading-tight">
            {t.landingHeroTitle1 || "AI-Powered Cognitive & Memory Assistance for "}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
              {t.landingHeroTitleHighlight || "Elderly Dementia Care"}
            </span>
            {t.landingHeroTitle2 || " in North Eastern India"}
          </h1>
          <AudioButton
            textToRead={`${t.landingHeroTitle1 || 'AI-Powered Cognitive & Memory Assistance for'} ${t.landingHeroTitleHighlight || 'Elderly Dementia Care'}. ${t.landingHeroSubtitle || t.tagline}`}
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shrink-0"
            title={t.listenOverview || "Listen to Overview"}
          />
        </div>

        <p className="text-lg sm:text-2xl text-slate-700 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          {t.landingHeroSubtitle || t.tagline || 'A culturally familiar, ultra-accessible cognitive gaming and daily routine companion specially tailored for elders in Assam, Manipur, Mizoram, Meghalaya, and across the North Eastern Region.'}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-xl mx-auto mb-16">
          <button
            onClick={handleStartElder}
            className="w-full sm:w-auto px-8 py-5 rounded-3xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xl sm:text-2xl shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition flex items-center justify-center gap-3 border-2 border-teal-500 group"
          >
            <Heart className="w-7 h-7 text-rose-300 fill-rose-300 group-hover:scale-110 transition" />
            <span>{t.elderMode || 'Open Elder Mode'}</span>
            <ArrowRight className="w-6 h-6 text-teal-200" />
          </button>

          <button
            onClick={handleStartCaregiver}
            className="w-full sm:w-auto px-8 py-5 rounded-3xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-extrabold text-xl sm:text-2xl border-2 border-slate-700 hover:border-cyan-400 transition flex items-center justify-center gap-3 shadow-lg"
          >
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            <span>{t.caregiverMode || 'Caregiver Portal'}</span>
          </button>
        </div>

        {/* 3D Floating Feature Preview Cards with Voice Accessibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-6xl mx-auto mb-16">
          {/* Card 1 */}
          <div
            onClick={() => speakText(`${t.feat1Title}. ${t.feat1Desc}`)}
            className="elder-card p-6 bg-white border-2 border-teal-100 hover:border-teal-400 transition shadow-soft-3d cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition">
                🧠
              </div>
              <AudioButton
                textToRead={`${t.feat1Title}. ${t.feat1Desc}`}
                size="sm"
              />
            </div>
            <h3 className="text-xl font-bold text-teal-950 mb-2">{t.feat1Title || "NER Cultural Cognitive Games"}</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              {t.feat1Desc || "3 adaptive games featuring Assam tea leaves, Kaziranga Rhinos, Bihu Dhols, and Mizo Cheraw bamboos to stimulate working memory."}
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => speakText(`${t.feat2Title}. ${t.feat2Desc}`)}
            className="elder-card p-6 bg-white border-2 border-amber-100 hover:border-amber-400 transition shadow-soft-3d cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition">
                🎤
              </div>
              <AudioButton
                textToRead={`${t.feat2Title}. ${t.feat2Desc}`}
                size="sm"
                className="bg-amber-100 text-amber-900 border-amber-300"
              />
            </div>
            <h3 className="text-xl font-bold text-amber-950 mb-2">{t.feat2Title || "Voice Sathi & Regional Audio"}</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              {t.feat2Desc || "Browser-native speech recognition & text-to-speech with multi-language phrases in Assamese, Bengali, Hindi, Manipuri, and Mizo."}
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => speakText(`${t.feat3Title}. ${t.feat3Desc}`)}
            className="elder-card p-6 bg-white border-2 border-emerald-100 hover:border-emerald-400 transition shadow-soft-3d cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition">
                📊
              </div>
              <AudioButton
                textToRead={`${t.feat3Title}. ${t.feat3Desc}`}
                size="sm"
                className="bg-emerald-100 text-emerald-900 border-emerald-300"
              />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-2">{t.feat3Title || "Caregiver Telemetry & Alerts"}</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              {t.feat3Desc || "Tracks medication adherence, cognitive performance trends, missed reminders, and AI difficulty recommendations in real-time."}
            </p>
          </div>
        </div>
      </section>

      {/* 6 Pillars / Solution Architecture Section */}
      <section className="bg-white py-16 border-y border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {t.whyNeuroSathi || "Why NeuroSathi Stands Out"}
            </span>
            <div className="flex items-center justify-center gap-3 mt-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-950">
                {t.platformArchTitle || "Comprehensive 6-Pillar Platform Architecture"}
              </h2>
              <AudioButton
                textToRead={`${t.whyNeuroSathi || 'Why NeuroSathi Stands Out'}. ${t.platformArchTitle || 'Comprehensive 6-Pillar Platform Architecture'}`}
                size="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-teal-50/60 border border-teal-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">1</span>
                  <h4 className="text-lg font-bold text-teal-950">{t.pillar1Title || "AI Cognitive Games"}</h4>
                </div>
                <AudioButton textToRead={`${t.pillar1Title || 'AI Cognitive Games'}. ${t.pillar1Desc || ''}`} size="sm" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.pillar1Desc || "Dynamically adjusts game complexity based on reaction time, memory accuracy, and error frequency."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm">2</span>
                  <h4 className="text-lg font-bold text-amber-950">{t.pillar2Title || "Memory Assistance"}</h4>
                </div>
                <AudioButton textToRead={`${t.pillar2Title || 'Memory Assistance'}. ${t.pillar2Desc || ''}`} size="sm" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.pillar2Desc || "Large visual cards with voice prompts for morning blood pressure meds, daily hydration, and doctor visits."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">3</span>
                  <h4 className="text-lg font-bold text-indigo-950">{t.pillar3Title || "Voice & Language Support"}</h4>
                </div>
                <AudioButton textToRead={`${t.pillar3Title || 'Voice & Language Support'}. ${t.pillar3Desc || ''}`} size="sm" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.pillar3Desc || "Zero typing needed. Elders can simply speak commands like 'Read my reminders' or 'Start game'."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-rose-50/60 border border-rose-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm">4</span>
                  <h4 className="text-lg font-bold text-rose-950">{t.pillar4Title || "NER Cultural Content"}</h4>
                </div>
                <AudioButton textToRead={`${t.pillar4Title || 'NER Cultural Content'}. ${t.pillar4Desc || ''}`} size="sm" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.pillar4Desc || "Familiar indigenous folklore, Japi, Xorai, Loktak Lake, and traditional music stimulate long-term episodic memory."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-cyan-50/60 border border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">5</span>
                  <h4 className="text-lg font-bold text-cyan-950">{t.pillar5Title || "Caregiver Dashboard"}</h4>
                </div>
                <AudioButton textToRead={`${t.pillar5Title || 'Caregiver Dashboard'}. ${t.pillar5Desc || ''}`} size="sm" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.pillar5Desc || "Empowers family members and nurses with score timelines, missed dose alerts, and peace of mind."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">6</span>
                  <h4 className="text-lg font-bold text-emerald-950">{t.pillar6Title || "Offline-First Resilience"}</h4>
                </div>
                <AudioButton textToRead={`${t.pillar6Title || 'Offline-First Resilience'}. ${t.pillar6Desc || ''}`} size="sm" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.pillar6Desc || "Functions without active internet connection in remote hill terrains, automatically syncing when connected."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alignment with National Priorities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h3 className="text-2xl font-bold text-slate-800">
            {t.nationalPrioritiesTitle || "Aligned With National Strategic Priorities"}
          </h3>
          <AudioButton
            textToRead={`${t.nationalPrioritiesTitle || 'Aligned With National Strategic Priorities'}. ${t.priority1Title || 'Digital India'}, ${t.priority2Title || 'Inclusive Healthcare'}, ${t.priority3Title || 'MDoNER Initiatives'}`}
            size="sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-teal-800 mb-2">{t.priority1Title || "🇮🇳 DIGITAL INDIA"}</h4>
            <p className="text-xs text-slate-600">{t.priority1Desc || "Empowering senior citizens through intuitive, voice-enabled assistive technology."}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-amber-800 mb-2">{t.priority2Title || "🏥 INCLUSIVE HEALTHCARE"}</h4>
            <p className="text-xs text-slate-600">{t.priority2Desc || "Aligning with WHO non-pharmacological cognitive stimulation guidelines for dementia care."}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-emerald-800 mb-2">{t.priority3Title || "🌿 MDoNER INITIATIVES"}</h4>
            <p className="text-xs text-slate-600">{t.priority3Desc || "Bridging remote North Eastern healthcare gaps with offline-first digital infrastructure."}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
