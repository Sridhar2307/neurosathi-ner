import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
import { speechService } from '../../services/speechService';
import { formatDateDisplay } from '../../services/reminderScheduler';
import {
  Brain,
  Bell,
  Heart,
  Mic,
  Award,
  Flame,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
  RotateCcw,
  Moon,
  Volume2,
  AlertTriangle,
  Globe
} from 'lucide-react';

export default function ElderDashboard() {
  const {
    navigateTo,
    setIsVoiceAssistantOpen,
    userProfile,
    activePatient,
    refreshUserData,
    triggerReminderAlert,
    showToast,
    activePatientId
  } = useApp();
  const { speakText, autoVoiceRead, t, language, changeLanguage, availableLanguages } = useAccessibility();

  const profile = activePatient || userProfile;

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const rems = await api.getReminders(activePatientId);
      setReminders(rems);
      setLoading(false);
    };
    loadData();
  }, [activePatientId]);

  const pendingReminders = reminders.filter(r => !r.is_completed);
  const completedCount = reminders.filter(r => r.is_completed).length;

  const todayDateString = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hasProfile = Boolean(profile?.name && !['demo-user-123', 'patient-lakshmi-demo'].includes(profile?.id));
  const patientFirstName = hasProfile ? profile.name.trim().split(' ')[0] : '';
  const welcomeText = (() => {
    if (!hasProfile || !patientFirstName) {
      return t.welcomeGeneric || "Welcome to NeuroSathi";
    }
    const template = t.welcome || "Good Day, {name}!";
    return template.replace(/\{name\}/g, patientFirstName);
  })();

  const handleCardClick = (view, spokenText) => {
    if (spokenText) {
      speakText(spokenText);
    }
    navigateTo('elder', view);
  };

  const handleCompleteQuickReminder = async (e, rem) => {
    e.stopPropagation();
    await api.updateReminder(rem.id, { is_completed: true }, activePatientId);
    const updated = await api.getReminders(activePatientId);
    setReminders(updated);
    refreshUserData();
    speakText(`${rem.title} - ${t.done || 'Done'}`);
  };

  const handleSnoozeReminder = async (e, rem, minutes) => {
    e.stopPropagation();
    const snoozed = await api.snoozeReminder(rem.id, minutes, activePatientId);
    const updated = await api.getReminders(activePatientId);
    setReminders(updated);
    refreshUserData();
    const newTime = snoozed?.time || `${minutes}m`;
    speakText(`${t.snooze10m || 'Snooze'}: ${rem.title} (${newTime})`);
    showToast(`⏰ ${t.snooze10m || 'Snooze'}: ${rem.title} (${newTime})`, 3500, 'reminder');
  };

  const handleTakeLaterReminder = async (e, rem) => {
    e.stopPropagation();
    const later = await api.takeLaterReminder(rem.id, activePatientId);
    const updated = await api.getReminders(activePatientId);
    setReminders(updated);
    refreshUserData();
    const newTime = later?.time || "08:00 PM";
    speakText(`${t.takeLater || 'Later'}: ${rem.title} (${newTime})`);
    showToast(`🌙 ${t.takeLater || 'Later'}: ${rem.title} (${newTime})`, 3500, 'reminder');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-5 sm:space-y-8">
      {/* Top Greeting & Date Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 rounded-3xl sm:rounded-4xl p-4 sm:p-10 text-white shadow-xl relative overflow-hidden border-2 sm:border-4 border-teal-600">
        {/* Subtle Background Art */}
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none text-9xl">
          🌸
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-teal-900/60 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-teal-500/40 text-teal-200 text-xs sm:text-sm font-semibold w-fit">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{todayDateString}</span>
              </div>

              {/* Direct Dashboard Language Selector */}
              <div className="flex items-center gap-1 bg-teal-950/80 hover:bg-teal-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-400/60 shadow-md transition">
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-transparent text-white font-black text-xs sm:text-sm focus:outline-none cursor-pointer"
                  aria-label="Select Language"
                >
                  {availableLanguages && availableLanguages.map(l => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white font-bold">
                      {l.native} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-white flex items-center gap-2 sm:gap-3 flex-wrap">
              <span>{welcomeText}</span>
              <AudioButton
                textToRead={`${welcomeText} Today is ${todayDateString}. ${pendingReminders.length > 0 ? `You have ${pendingReminders.length} reminders pending.` : 'All your morning tasks are completed.'}`}
                size="md"
                className="bg-white text-teal-800 border-none shadow-md"
              />
            </h1>

            <p className="text-sm sm:text-lg text-teal-100 font-medium max-w-2xl leading-relaxed">
              {t.welcomeSubtitle || "Here is your gentle cognitive routine for today. Let's keep your mind active and happy!"}
            </p>

            {/* Patient Details Sub-banner */}
            {hasProfile ? (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-sm font-semibold text-teal-200/90 pt-1">
                {profile?.age && (
                  <span className="bg-teal-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-teal-500/30">
                    {profile.age} Years
                  </span>
                )}
                {profile?.gender && (
                  <span className="bg-teal-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-teal-500/30">
                    {profile.gender}
                  </span>
                )}
                {profile?.blood_group && (
                  <span className="bg-teal-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-teal-500/30 text-rose-300">
                    Blood: {profile.blood_group}
                  </span>
                )}
                {profile?.location && (
                  <span className="bg-teal-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-teal-500/30">
                    📍 {profile.location}
                  </span>
                )}
                {profile?.medical_stage && (
                  <span className="bg-teal-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-teal-500/30 text-amber-300">
                    ⚕️ {profile.medical_stage}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-semibold text-teal-200/90 pt-1">
                <span className="bg-teal-900/60 px-3 py-1 rounded-xl border border-teal-500/30">
                  🌿 North East Regional Cognitive Companion
                </span>
              </div>
            )}
          </div>

          {/* Streak & Stars Counter Badge (Full width on mobile, balanced) */}
          <div className="flex items-center justify-around w-full md:w-auto bg-teal-950/70 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-teal-400/50 shadow-inner shrink-0">
            <div className="text-center px-3 border-r border-teal-700">
              <div className="flex items-center justify-center gap-1.5 text-amber-400">
                <Flame className="w-5 h-5 sm:w-7 sm:h-7 fill-amber-400 animate-gentle-float" />
                <span className="text-2xl sm:text-4xl font-black">{hasProfile ? (profile?.current_streak ?? 0) : 0}</span>
              </div>
              <span className="text-[10px] sm:text-sm font-bold text-teal-200 uppercase tracking-wider">{t.streak || 'Streak'}</span>
            </div>

            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1.5 text-amber-300">
                <Award className="w-5 h-5 sm:w-7 sm:h-7 fill-amber-300" />
                <span className="text-2xl sm:text-4xl font-black">{hasProfile ? (profile?.total_stars ?? 0) : 0}</span>
              </div>
              <span className="text-[10px] sm:text-sm font-bold text-teal-200 uppercase tracking-wider">{t.stars || 'Stars'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Up Next / Urgent High-Alert Reminder Box */}
      {pendingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-red-100/90 border-3 sm:border-4 border-red-500 rounded-3xl p-4 sm:p-6 shadow-xl shadow-red-500/15 ring-2 sm:ring-4 ring-red-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-red-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-lg ring-2 sm:ring-4 ring-red-300 animate-pulse">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full shadow-sm animate-pulse flex items-center gap-1">
                  🚨 {t.highAlertReminder || "HIGH ALERT"}
                </span>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-700" />
                  {formatDateDisplay(pendingReminders[0].date)}
                </span>
                <span className="text-xs sm:text-sm font-black text-red-950 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-700" /> {pendingReminders[0].time}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-red-950 mt-1">
                {pendingReminders[0].title}
              </h2>
              <p className="text-sm sm:text-lg text-red-900 font-semibold mt-0.5">
                {pendingReminders[0].dosage_or_detail}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
              {/* High Alert Audio Trigger Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speechService.playHighAlertSound(3);
                  showToast(`🔊 ${t.highAlertSoundBtn || 'High Alert Sound'}: ${pendingReminders[0].title}`, 3000, 'alert');
                }}
                className="px-3 py-2.5 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-base flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                title={t.highAlertSoundBtn || "Play High Alert Sound"}
              >
                <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
                <span>{t.highAlertSoundBtn || "Sound"}</span>
              </button>

              {/* Trigger Red Popup Modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerReminderAlert(pendingReminders[0]);
                }}
                className="px-3 py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-red-50 text-red-700 border-2 border-red-400 font-black text-xs sm:text-base flex items-center justify-center gap-1 shadow-sm active:scale-95 transition"
                title={t.viewAlertPopupBtn || "Open Full Red Notification Pop-up"}
              >
                <span>{t.viewAlertPopupBtn || "Pop-up"}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <button
                onClick={(e) => handleCompleteQuickReminder(e, pendingReminders[0])}
                className="px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-lg flex items-center justify-center gap-1.5 shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>{t.markDone || "Done"}</span>
              </button>
              <button
                onClick={(e) => handleSnoozeReminder(e, pendingReminders[0], 30)}
                className="px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-lg flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
                <span>{t.snooze30 || "30m"}</span>
              </button>
              <button
                onClick={(e) => handleTakeLaterReminder(e, pendingReminders[0])}
                className="px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs sm:text-lg flex items-center justify-center gap-1 transition"
              >
                <Moon className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
                <span>{t.takeLater || "Later"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5 Primary Big Tactile Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        {/* 1. Cognitive Games */}
        <div
          onClick={() => handleCardClick('games_hub', t.navToGames || t.startGames)}
          className="elder-card p-4 sm:p-8 cursor-pointer border-2 sm:border-3 border-teal-200 hover:border-teal-500 bg-white hover:bg-teal-50/40 transition group relative"
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              🧠
            </div>
            <AudioButton
              textToRead={`${t.startGames || 'Cognitive Games'}. ${t.startGamesSub || 'Match Assam tea leaves, listen to Bihu rhythms, and identify iconic North East artifacts.'}`}
              size="md"
            />
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-3xl font-black text-teal-950 font-sans">
                {t.startGames || "Cognitive Games"}
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                3 Games
              </span>
            </div>
            <p className="text-sm sm:text-lg text-slate-600 font-medium mt-1 sm:mt-2 leading-relaxed">
              {t.startGamesSub || "Match Assam tea leaves, listen to Bihu rhythms, and identify iconic North East artifacts."}
            </p>
          </div>

          <div className="mt-4 sm:mt-6 flex items-center justify-between pt-3 sm:pt-4 border-t border-teal-100">
            <span className="text-sm sm:text-base font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.tapToPlay || "Tap to Play"} <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {t.perGameNotice || "+5 Stars"}
            </span>
          </div>
        </div>

        {/* 2. Today's Reminders */}
        <div
          onClick={() => handleCardClick('reminders', t.navToReminders || t.viewReminders)}
          className="elder-card p-4 sm:p-8 cursor-pointer border-2 sm:border-3 border-amber-200 hover:border-amber-500 bg-white hover:bg-amber-50/40 transition group"
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              🔔
            </div>
            <AudioButton
              textToRead={`${t.viewReminders || 'Daily Reminders'}. ${completedCount} ${t.completedToday || 'completed'}.`}
              size="md"
            />
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-3xl font-black text-amber-950 font-sans">
                {t.viewReminders || "Daily Reminders"}
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {pendingReminders.length} {t.pendingTasks || "Pending"}
              </span>
            </div>
            <p className="text-sm sm:text-lg text-slate-600 font-medium mt-1 sm:mt-2 leading-relaxed">
              {t.viewRemindersSub || "Never miss your morning blood pressure tablet, fresh hydration, or evening walk."}
            </p>
          </div>

          <div className="mt-4 sm:mt-6 flex items-center justify-between pt-3 sm:pt-4 border-t border-amber-100">
            <span className="text-sm sm:text-base font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.viewSchedule || "View Schedule"} <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {completedCount} Done
            </span>
          </div>
        </div>

        {/* 3. Memory Support & Cultural Recall */}
        <div
          onClick={() => handleCardClick('game_object', `${t.memorySupportCard || 'Memory Support'}. ${t.tapToPlay || 'Play'}`)}
          className="elder-card p-4 sm:p-8 cursor-pointer border-2 sm:border-3 border-rose-200 hover:border-rose-500 bg-white hover:bg-rose-50/40 transition group"
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              ❤️
            </div>
            <AudioButton
              textToRead={`${t.memorySupportCard || 'Memory Support & Heritage'}. ${t.memorySupportSub || 'Recall familiar places like Loktak Lake, Living Root Bridges, and traditional crafts.'}`}
              size="md"
            />
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-3xl font-black text-rose-950 font-sans">
                {t.memorySupportCard || "Memory Support"}
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                Heritage
              </span>
            </div>
            <p className="text-sm sm:text-lg text-slate-600 font-medium mt-1 sm:mt-2 leading-relaxed">
              {t.memorySupportSub || "Recall familiar places like Loktak Lake, Living Root Bridges, and traditional crafts."}
            </p>
          </div>

          <div className="mt-4 sm:mt-6 flex items-center justify-between pt-3 sm:pt-4 border-t border-rose-100">
            <span className="text-sm sm:text-base font-bold text-rose-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.exploreMemories || "Explore Memories"} <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
        </div>

        {/* 4. Voice Assistant Sathi */}
        <div
          onClick={() => {
            setIsVoiceAssistantOpen(true);
            speakText(t.voiceListening || "Voice Sathi is ready. How can I help you?");
          }}
          className="elder-card p-4 sm:p-8 cursor-pointer border-2 sm:border-3 border-indigo-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 transition group"
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              🎤
            </div>
            <AudioButton
              textToRead={`${t.voiceAssistant || 'Voice Assistant'}. ${t.voiceAssistantSubtitle || 'Speak to ask about medicines or start games.'}`}
              size="md"
            />
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-3xl font-black text-indigo-950 font-sans">
                {t.voiceAssistant || "Voice Assistant"}
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                Mic Ready
              </span>
            </div>
            <p className="text-sm sm:text-lg text-slate-600 font-medium mt-1 sm:mt-2 leading-relaxed">
              {t.voiceAssistantSubtitle || "Speak in English, Assamese, Bengali, Manipuri, Mizo, or Hindi."}
            </p>
          </div>

          <div className="mt-4 sm:mt-6 flex items-center justify-between pt-3 sm:pt-4 border-t border-indigo-100">
            <span className="text-sm sm:text-base font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.tapToPlay || "Tap to Speak"} <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
        </div>
      </div>

      {/* 5. Progress Card (Wide) */}
      <div
        onClick={() => handleCardClick('progress', t.navToProgress || t.starsCard)}
        className="elder-card p-4 sm:p-8 cursor-pointer border-2 sm:border-3 border-purple-200 hover:border-purple-500 bg-gradient-to-r from-purple-50/60 to-white transition group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
      >
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md shrink-0">
            📊
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-purple-950 font-sans">
              {t.starsCard || "My Stars & Daily Progress"}
            </h2>
            <p className="text-sm sm:text-lg text-slate-600 font-medium mt-0.5 sm:mt-1">
              {t.starsCardSub || "Celebrate daily cognitive progress and earn colorful North East cultural badges."}
            </p>
          </div>
        </div>

        <button
          className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-purple-600 text-white font-bold text-sm sm:text-base hover:bg-purple-700 transition shrink-0 shadow-md text-center"
        >
          {t.viewBadges || "View Badges"} ↗
        </button>
      </div>

      {/* Direct Caregiver / Emergency Contact Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 sm:border-3 border-teal-200 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl sm:text-2xl shrink-0 mt-1 sm:mt-0">
            <PhoneCall className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700">
              {t.caregiverCard || "Emergency Contact"}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {profile?.emergency_contact_name || 'Primary Caregiver'}{profile?.emergency_contact_relation ? ` (${profile.emergency_contact_relation})` : ''}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {profile?.emergency_contact_phone || '+91 98765 43210'} • {profile?.emergency_contact_address || profile?.location || 'Guwahati, Assam'}
            </p>
          </div>
        </div>

        <a
          href={`tel:${(profile?.emergency_contact_phone || '+919876543210').replace(/[^0-9\+]/g, '')}`}
          onClick={() => speakText(`${t.callNow || 'Calling'}: ${profile?.emergency_contact_name || 'Caregiver'}`)}
          className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md transition text-center"
        >
          <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t.callNow || "Call Caregiver"}</span>
        </a>
      </div>

      {/* Attending Physician & Hospital Contact if Configured */}
      {profile?.doctor_name && (
        <div className="bg-teal-50/80 rounded-3xl p-5 border-2 border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-teal-200 text-teal-800 flex items-center justify-center text-xl shrink-0 font-bold">
              👨‍⚕️
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Attending Neurologist & Medical Care
              </span>
              <h4 className="text-lg font-black text-slate-900">
                {profile.doctor_name}
              </h4>
              <p className="text-xs font-semibold text-slate-600">
                {profile.doctor_phone} • {profile.doctor_hospital || 'Neurological Center'}
              </p>
            </div>
          </div>

          {profile?.doctor_phone && (
            <a
              href={`tel:${profile.doctor_phone.replace(/[^0-9\+]/g, '')}`}
              onClick={() => speakText(`Calling ${profile.doctor_name}`)}
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center gap-2 transition shrink-0 shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Doctor</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
