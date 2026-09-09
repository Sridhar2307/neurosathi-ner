import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import AudioButton from '../../components/AudioButton';
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
  Clock
} from 'lucide-react';

export default function ElderDashboard() {
  const { navigateTo, setIsVoiceAssistantOpen, userProfile, refreshUserData } = useApp();
  const { speakText, autoVoiceRead, t } = useAccessibility();

  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const rems = await api.getReminders();
      setReminders(rems);
      setLoading(false);
    };
    loadData();
  }, []);

  const pendingReminders = reminders.filter(r => !r.is_completed);
  const completedCount = reminders.filter(r => r.is_completed).length;

  const todayDateString = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleCardClick = (view, spokenText) => {
    if (autoVoiceRead && spokenText) {
      speakText(spokenText);
    }
    navigateTo('elder', view);
  };

  const handleCompleteQuickReminder = async (e, rem) => {
    e.stopPropagation();
    await api.updateReminder(rem.id, { is_completed: true });
    const updated = await api.getReminders();
    setReminders(updated);
    refreshUserData();
    speakText(`Great job! You completed ${rem.title}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Greeting & Date Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 rounded-4xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border-4 border-teal-600">
        {/* Subtle Background Art */}
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none text-9xl">
          🌸
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-teal-900/60 px-4 py-1.5 rounded-full border border-teal-500/40 text-teal-200 text-sm font-semibold w-fit">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{todayDateString}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-sans tracking-tight text-white flex items-center gap-3">
              <span>{t.welcome || `Good Day, ${userProfile?.name || 'Bhaben'}!`}</span>
              <AudioButton
                textToRead={`${t.welcome || 'Good Day, Bhaben!'} Today is ${todayDateString}. ${pendingReminders.length > 0 ? `You have ${pendingReminders.length} reminders pending.` : 'All your morning tasks are completed.'}`}
                size="lg"
                className="bg-white text-teal-800 border-none shadow-md"
              />
            </h1>

            <p className="text-lg sm:text-xl text-teal-100 font-medium max-w-2xl leading-relaxed">
              {t.welcomeSubtitle || "Here is your gentle cognitive routine for today. Let's keep your mind active and happy!"}
            </p>
          </div>

          {/* Streak & Stars Counter Badge */}
          <div className="flex items-center gap-4 bg-teal-950/70 p-4 sm:p-5 rounded-3xl border-2 border-teal-400/50 shadow-inner">
            <div className="text-center px-3 border-r border-teal-700">
              <div className="flex items-center justify-center gap-1.5 text-amber-400">
                <Flame className="w-7 h-7 fill-amber-400 animate-gentle-float" />
                <span className="text-3xl sm:text-4xl font-black">{userProfile?.current_streak || 4}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-teal-200 uppercase tracking-wider">{t.streak || 'Day Streak'}</span>
            </div>

            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1.5 text-amber-300">
                <Award className="w-7 h-7 fill-amber-300" />
                <span className="text-3xl sm:text-4xl font-black">{userProfile?.total_stars || 56}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-teal-200 uppercase tracking-wider">{t.stars || 'Stars'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Up Next / Urgent Reminder Alert Box (if any) */}
      {pendingReminders.length > 0 && (
        <div className="bg-amber-50 border-4 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {t.upcomingReminder || "Upcoming Reminder"}
                </span>
                <span className="text-sm font-bold text-amber-950 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-700" /> {pendingReminders[0].time}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                {pendingReminders[0].title}
              </h2>
              <p className="text-base text-amber-900 font-medium">
                {pendingReminders[0].dosage_or_detail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <AudioButton
              textToRead={`${t.upcomingReminder || 'Next reminder'}: ${pendingReminders[0].title} at ${pendingReminders[0].time}. ${pendingReminders[0].dosage_or_detail}`}
              size="lg"
              className="bg-amber-200 text-amber-900 border-amber-400"
            />
            <button
              onClick={(e) => handleCompleteQuickReminder(e, pendingReminders[0])}
              className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>{t.markDone || "Mark Done"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5 Primary Big Tactile Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* 1. Cognitive Games */}
        <div
          onClick={() => handleCardClick('games_hub', 'Opening Mind Games section. We have 3 culturally rich games ready for you.')}
          className="elder-card p-6 sm:p-8 cursor-pointer border-3 border-teal-200 hover:border-teal-500 bg-white hover:bg-teal-50/40 transition group relative"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              🧠
            </div>
            <AudioButton
              textToRead={`${t.startGames || 'Cognitive Games'}. ${t.startGamesSub || 'Match Assam tea leaves, listen to Bihu rhythms, and identify iconic North East artifacts.'}`}
              size="md"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-teal-950 font-sans">
                {t.startGames || "Cognitive Games"}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                3 Playable
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-2 leading-relaxed">
              {t.startGamesSub || "Match Assam tea leaves, listen to Bihu rhythms, and identify iconic North East artifacts."}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-teal-100">
            <span className="text-base font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.tapToPlay || "Tap to Play Games"} <ChevronRight className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {t.perGameNotice || "+5 Stars Per Game"}
            </span>
          </div>
        </div>

        {/* 2. Today's Reminders */}
        <div
          onClick={() => handleCardClick('reminders', 'Opening your daily reminders. You can see your medicine schedules and water reminders.')}
          className="elder-card p-6 sm:p-8 cursor-pointer border-3 border-amber-200 hover:border-amber-500 bg-white hover:bg-amber-50/40 transition group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              🔔
            </div>
            <AudioButton
              textToRead={`${t.viewReminders || 'Daily Reminders'}. ${completedCount} completed.`}
              size="md"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-sans">
                {t.viewReminders || "Daily Reminders"}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {pendingReminders.length} {t.pendingTasks || "Pending"}
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-2 leading-relaxed">
              {t.viewRemindersSub || "Never miss your morning blood pressure tablet, fresh hydration, or evening walk."}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-amber-100">
            <span className="text-base font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.viewSchedule || "View Schedule"} <ChevronRight className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {completedCount} {t.completedToday || "Completed Today"}
            </span>
          </div>
        </div>

        {/* 3. Memory Support & Cultural Recall */}
        <div
          onClick={() => handleCardClick('game_object', 'Opening North East Object and Story Recall. Reconnect with familiar memories.')}
          className="elder-card p-6 sm:p-8 cursor-pointer border-3 border-rose-200 hover:border-rose-500 bg-white hover:bg-rose-50/40 transition group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              ❤️
            </div>
            <AudioButton
              textToRead={`${t.memorySupportCard || 'Memory Support & Heritage'}. ${t.memorySupportSub || 'Recall familiar places like Loktak Lake, Living Root Bridges, and traditional crafts.'}`}
              size="md"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-rose-950 font-sans">
                {t.memorySupportCard || "Memory Support"}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                Heritage Recall
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-2 leading-relaxed">
              {t.memorySupportSub || "Recall familiar places like Loktak Lake, Living Root Bridges, and traditional crafts."}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-rose-100">
            <span className="text-base font-bold text-rose-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.exploreMemories || "Explore Memories"} <ChevronRight className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* 4. Voice Assistant Sathi */}
        <div
          onClick={() => {
            setIsVoiceAssistantOpen(true);
            speakText("Voice Sathi is ready. How can I help you?");
          }}
          className="elder-card p-6 sm:p-8 cursor-pointer border-3 border-indigo-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 transition group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-4xl shadow-lg shrink-0 group-hover:scale-105 transition">
              🎤
            </div>
            <AudioButton
              textToRead={`${t.voiceAssistant || 'Voice Assistant'}. ${t.voiceAssistantSubtitle || 'Speak to ask about medicines or start games.'}`}
              size="md"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 font-sans">
                {t.voiceAssistant || "Voice Assistant"}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                Microphone Ready
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-2 leading-relaxed">
              {t.voiceAssistantSubtitle || "Speak in English, Assamese, Bengali, Manipuri, Mizo, or Hindi."}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-indigo-100">
            <span className="text-base font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              {t.tapToPlay || "Tap to Speak Now"} <ChevronRight className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>

      {/* 5. Progress Card (Wide) */}
      <div
        onClick={() => handleCardClick('progress', 'Viewing your overall stars and cognitive activity streak.')}
        className="elder-card p-6 sm:p-8 cursor-pointer border-3 border-purple-200 hover:border-purple-500 bg-gradient-to-r from-purple-50/60 to-white transition group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
            📊
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-950 font-sans">
              {t.starsCard || "My Stars & Daily Progress"}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
              {t.starsCardSub || "Celebrate daily cognitive progress and earn colorful North East cultural badges."}
            </p>
          </div>
        </div>

        <button
          className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-base hover:bg-purple-700 transition shrink-0 shadow-md"
        >
          {t.viewBadges || "View Badges"} ↗
        </button>
      </div>

      {/* Direct Caregiver / Emergency Contact Banner */}
      <div className="bg-white rounded-3xl p-6 border-3 border-teal-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl shrink-0">
            <PhoneCall className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              {t.caregiverCard || "Emergency & Caregiver Contact"}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {userProfile?.emergency_contact_name || 'Priya Sharma (Daughter)'}
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              {userProfile?.emergency_contact_phone || '+91 98765 43210'} • Guwahati, Assam
            </p>
          </div>
        </div>

        <a
          href={`tel:${userProfile?.emergency_contact_phone || '+919876543210'}`}
          onClick={() => speakText(`Calling your caregiver ${userProfile?.emergency_contact_name || 'Priya'}`)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-md transition"
        >
          <PhoneCall className="w-5 h-5" />
          <span>{t.callNow || "Call Caregiver"}</span>
        </a>
      </div>
    </div>
  );
}
