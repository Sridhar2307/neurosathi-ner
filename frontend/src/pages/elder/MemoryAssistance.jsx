import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { speechService } from '../../services/speechService';
import { notificationService } from '../../services/notificationService';
import {
  convert24To12Hour,
  convert12To24Hour,
  getCurrentTime12Hour,
  getTodayDateStr,
  formatDateDisplay,
  isReminderUpcoming,
  isReminderPast
} from '../../services/reminderScheduler';
import AudioButton from '../../components/AudioButton';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  Pill,
  Droplet,
  Calendar,
  Sparkles,
  Trash2,
  Bell,
  Sun,
  Moon,
  Volume2,
  RotateCcw,
  AlertTriangle,
  Check,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

export default function MemoryAssistance() {
  const {
    navigateTo,
    refreshUserData,
    triggerReminderAlert,
    showToast,
    activePatientId,
    userProfile
  } = useApp();
  const { speakText, autoVoiceRead, t } = useAccessibility();

  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'medicine' | 'water'
  const [showAddModal, setShowAddModal] = useState(false);

  // System notification bar permission status
  const [notifPermission, setNotifPermission] = useState(() => notificationService.getPermission());

  // New reminder form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('medicine');
  const [newDate, setNewDate] = useState(() => getTodayDateStr(0));
  const [newTime, setNewTime] = useState(() => getCurrentTime12Hour(1));
  const [newDetail, setNewDetail] = useState('');

  const loadReminders = async () => {
    const data = await api.getReminders(activePatientId);
    setReminders(data || []);
  };

  useEffect(() => {
    loadReminders();
    setNotifPermission(notificationService.getPermission());
  }, [activePatientId]);

  const handleRequestNotifPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      await notificationService.testNotification();
      showToast("🔔 Notification Bar alerts enabled! You will get pop-ups even if tab is closed.", 4500, 'reminder');
      speakText("Notification bar alerts are now enabled.");
    } else {
      showToast("System notification permission was not granted.", 3500, 'alert');
    }
  };

  const handleToggleComplete = async (rem) => {
    const nextStatus = !rem.is_completed;
    // Optimistic UI update immediately
    setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, is_completed: nextStatus } : r));

    await api.updateReminder(rem.id, { is_completed: nextStatus }, activePatientId);
    await loadReminders();
    refreshUserData();

    if (nextStatus) {
      speakText(`Marked ${rem.title} as completed. You earned 2 stars!`);
    } else {
      speakText(`Marked ${rem.title} as pending.`);
    }
  };

  const handleDelete = async (id, title) => {
    // Optimistic UI update immediately
    setReminders(prev => prev.filter(r => r.id !== id));

    await api.deleteReminder(id, activePatientId);
    await loadReminders();
    speakText(`Deleted reminder ${title}`);
  };

  const handleSnoozeReminder = async (rem, minutes) => {
    const updated = await api.snoozeReminder(rem.id, minutes, activePatientId);
    if (updated) {
      setReminders(prev => prev.map(r => r.id === rem.id ? updated : r));
    }
    await loadReminders();
    refreshUserData();
    const newTimeDisplay = updated?.time || `${minutes}m later`;
    speakText(`Reminder snoozed until ${newTimeDisplay}.`);
    showToast(`⏰ Snoozed to ${newTimeDisplay}`, 3500, 'reminder');
  };

  const handleTakeLaterReminder = async (rem) => {
    const updated = await api.takeLaterReminder(rem.id, activePatientId);
    if (updated) {
      setReminders(prev => prev.map(r => r.id === rem.id ? updated : r));
    }
    await loadReminders();
    refreshUserData();
    const newTimeDisplay = updated?.time || "08:00 PM";
    speakText(`Reminder moved to ${newTimeDisplay} tonight.`);
    showToast(`🌙 Rescheduled to ${newTimeDisplay} tonight`, 3500, 'reminder');
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const scheduledDate = newDate || getTodayDateStr(0);
    const scheduledTime = newTime || "10:00 AM";

    const created = await api.createReminder({
      user_id: activePatientId,
      title: newTitle.trim(),
      category: newCategory,
      date: scheduledDate,
      time: scheduledTime,
      dosage_or_detail: newDetail.trim() || "Daily routine reminder",
      audio_prompt: `Reminder for ${newTitle.trim()} scheduled for ${formatDateDisplay(scheduledDate)} at ${scheduledTime}`,
      icon_name: newCategory === 'medicine' ? 'Pill' : (newCategory === 'water' ? 'Droplet' : 'Bell')
    });

    // Optimistically prepend newly created reminder to state immediately
    if (created) {
      setReminders(prev => [created, ...prev.filter(r => r.id !== created.id)]);
    }

    setShowAddModal(false);
    setNewTitle('');
    setNewDetail('');
    setNewDate(getTodayDateStr(0));
    await loadReminders();
    refreshUserData();
    speakText(`New reminder for ${newTitle} scheduled for ${formatDateDisplay(scheduledDate)} at ${scheduledTime}.`);
    showToast(`✓ Scheduled for ${formatDateDisplay(scheduledDate)} at ${scheduledTime}. High alert & notification will pop up!`, 4500, 'reminder');
  };

  // Filter based on active filter pill
  const filteredReminders = reminders.filter(r => {
    if (filter === 'pending') return !r.is_completed;
    if (filter === 'completed') return r.is_completed;
    if (filter === 'medicine') return (r.category || 'medicine') === 'medicine';
    if (filter === 'water') return r.category === 'water';
    return true;
  });

  // Segregate into Upcoming vs. Previous
  const upcomingReminders = filteredReminders.filter(isReminderUpcoming);
  const previousReminders = filteredReminders.filter(isReminderPast);

  // Helper to render an individual reminder card
  const renderReminderCard = (rem, isUpcoming) => {
    const isDone = rem.is_completed;
    const categoryIcon = rem.category === 'medicine' ? '💊' : (rem.category === 'water' ? '💧' : '⏰');
    const dateLabel = formatDateDisplay(rem.date);

    return (
      <div
        key={rem.id}
        className={`elder-card p-3.5 sm:p-7 transition-all border-2 sm:border-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
          isDone
            ? 'bg-emerald-50/70 border-emerald-300 opacity-85'
            : isUpcoming
              ? 'bg-white border-teal-300 hover:border-teal-500 shadow-md'
              : 'bg-slate-50/90 border-slate-300 text-slate-700'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${
            isDone
              ? 'bg-emerald-200 text-emerald-900'
              : isUpcoming
                ? 'bg-teal-100 text-teal-900'
                : 'bg-slate-200 text-slate-700'
          }`}>
            {categoryIcon}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300">
                {(rem.category || 'medicine').replace('_', ' ')}
              </span>

              {/* Scheduled Date & Day Badge */}
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                {dateLabel}
              </span>

              {/* Scheduled Time Badge */}
              <span className="text-sm font-extrabold text-teal-900 flex items-center gap-1 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                <Clock className="w-4 h-4 text-teal-700" /> {rem.time}
              </span>

              {isDone && (
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t.completedToday || 'Done'}
                </span>
              )}
            </div>

            <h3 className={`text-xl sm:text-2xl font-black ${
              isDone ? 'text-emerald-950 line-through' : 'text-slate-900'
            }`}>
              {rem.title}
            </h3>

            {rem.dosage_or_detail && (
              <p className="text-base text-slate-600 font-medium">
                {rem.dosage_or_detail}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
          <AudioButton
            textToRead={`Reminder: ${rem.title} on ${dateLabel} at ${rem.time}. ${rem.dosage_or_detail || ''}`}
            size="md"
          />

          {!isDone && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  speechService.playHighAlertSound(3);
                  triggerReminderAlert(rem);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-1.5 transition shadow-sm"
                title="Trigger High Alert Sound & Pop-up"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.highAlertSoundBtn || 'Alert'}</span>
              </button>
              <button
                onClick={() => handleSnoozeReminder(rem, 30)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-1.5 transition"
                title="Snooze 30 minutes"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{t.snooze30m || '30m'}</span>
              </button>
              <button
                onClick={() => handleTakeLaterReminder(rem)}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm flex items-center gap-1.5 transition"
                title="Take later tonight"
              >
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.takeLater || 'Later'}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => handleToggleComplete(rem)}
            className={`px-5 py-3 rounded-2xl font-extrabold text-base flex items-center gap-2 transition ${
              isDone
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-tactile-btn'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isDone ? (t.completedToday || 'Done') : (t.markDone || 'Mark Done')}</span>
          </button>

          <button
            onClick={() => handleDelete(rem.id, rem.title)}
            className="p-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
            title="Delete Reminder"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-4 sm:space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={() => {
            speakText(t.navToHome || t.home);
            navigateTo('elder', 'dashboard');
          }}
          className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-sm sm:text-base shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" />
          <span>{t.backToHome || "Back to Home"}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          {/* Test High Alert Sound & In-App Pop-up */}
          <button
            onClick={() => {
              const targetRem = upcomingReminders[0] || reminders[0] || {
                title: "Blood Pressure Tablet (Amlodipine)",
                category: "medicine",
                date: getTodayDateStr(0),
                time: "10:00 AM",
                dosage_or_detail: "1 tablet after food with a warm cup of water"
              };
              triggerReminderAlert(targetRem);
              showToast("🚨 Testing High Alert Sound & Notification Bar Pop-up", 3500, 'reminder');
            }}
            className="flex-1 sm:flex-none px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 shadow-md active:scale-95 transition"
            title="Test High Alert Sound and Red Notification Pop-up"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{t.testHighAlertBtn || "Test High Alert"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-lg flex items-center justify-center gap-1.5 sm:gap-2 shadow-tactile-btn transition"
          >
            <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
            <span>{t.addReminder || "Add Reminder"}</span>
          </button>
        </div>
      </div>

      {/* System Notification Bar Pop-Up Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition ${
        notifPermission === 'granted'
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
            notifPermission === 'granted' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
          }`}>
            🔔
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>
                {notifPermission === 'granted'
                  ? (t.notificationBarActive || "Notification Bar Pop-ups Active")
                  : (t.enableNotificationBar || "Enable System Notification Bar Alerts")}
              </span>
              {notifPermission === 'granted' && (
                <span className="text-[11px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              )}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {notifPermission === 'granted'
                ? "Reminders will pop up in your Windows / Android notification bar even if you close or minimize the platform."
                : "Allow system notifications so your scheduled medicine reminders pop up in your device bar even when the platform is closed."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          {notifPermission !== 'granted' ? (
            <button
              onClick={handleRequestNotifPermission}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-sm transition"
            >
              {t.enableNotificationBar || "Enable Notification Bar"}
            </button>
          ) : (
            <button
              onClick={async () => {
                await notificationService.testNotification();
                showToast("🔔 Test pop-up sent to your system notification bar!", 3500, 'reminder');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
            >
              {t.testNotifBar || "Test Notification Bar"}
            </button>
          )}
        </div>
      </div>

      {/* Header & Filter Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-3xl font-bold">
              🔔
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
                <span>{t.dailyRoutines || "Daily Memory Reminders"}</span>
                <AudioButton textToRead={`${t.dailyRoutines || 'Daily Reminders list'}. ${t.dailyRoutinesSub || 'Check off medicines, fresh water, and appointments.'}`} size="sm" />
              </h1>
              <p className="text-base text-slate-600 font-semibold">
                {t.dailyRoutinesSub || "Clear schedule for medicines, hydration, and doctor visits."}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          {[
            { id: 'all', label: t.filterAll || 'All Tasks' },
            { id: 'pending', label: t.filterPending || 'Pending' },
            { id: 'completed', label: t.filterCompleted || 'Completed' },
            { id: 'medicine', label: t.filterMedicine || 'Medicines 💊' },
            { id: 'water', label: 'Water 💧' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-2xl font-bold text-sm sm:text-base transition ${
                filter === tab.id
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: UPCOMING REMINDERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-black text-teal-950 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500 animate-ping"></span>
            <span>{t.upcomingReminders || "Upcoming Reminders"}</span>
            <span className="text-sm font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
              {upcomingReminders.length}
            </span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Due today & future scheduled dates
          </span>
        </div>

        {upcomingReminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-teal-200 text-slate-500 space-y-2">
            <p className="text-base font-bold text-slate-700">
              {t.noUpcomingReminders || "No upcoming reminders scheduled right now."}
            </p>
            <p className="text-xs text-slate-500">
              All scheduled tasks for today are completed, or you haven't added an upcoming reminder yet.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addReminder || "Add New Reminder"}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingReminders.map(rem => renderReminderCard(rem, true))}
          </div>
        )}
      </div>

      {/* SECTION 2: PREVIOUS REMINDERS */}
      <div className="space-y-4 pt-6 border-t-2 border-slate-200">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-slate-500" />
            <span>{t.previousReminders || "Previous Reminders"}</span>
            <span className="text-sm font-bold bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300">
              {previousReminders.length}
            </span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Completed tasks & past scheduled routines
          </span>
        </div>

        {previousReminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200 text-slate-500 text-sm font-semibold">
            {t.noPreviousReminders || "No previous reminders yet. Once you complete reminders, they will be archived here."}
          </div>
        ) : (
          <div className="space-y-4">
            {previousReminders.map(rem => renderReminderCard(rem, false))}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-md w-full p-6 sm:p-8 border-4 border-teal-400 shadow-2xl animate-gentle-float">
            <h2 className="text-2xl font-black text-teal-950 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600" />
              <span>{t.addReminder || "Add New Scheduled Reminder"}</span>
            </h2>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {t.newReminderTitle || "Reminder Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Donepezil Tablet or Morning Tea"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-teal-500 font-semibold text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {t.category || "Category"}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-3 rounded-2xl border-2 border-slate-300 focus:border-teal-500 font-semibold text-sm"
                >
                  <option value="medicine">Medicine 💊</option>
                  <option value="water">Water / Hydration 💧</option>
                  <option value="appointment">Doctor Appointment 🏥</option>
                  <option value="daily_task">Daily Task / Exercise 🌿</option>
                </select>
              </div>

              {/* Date & Time Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Specific Date Picker */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{t.scheduledDate || "Date"}</span>
                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {formatDateDisplay(newDate)}
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-300 focus:border-teal-500 font-bold text-sm bg-white"
                  />
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setNewDate(getTodayDateStr(0))}
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg border transition ${
                        newDate === getTodayDateStr(0)
                          ? 'bg-teal-600 text-white border-teal-700'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDate(getTodayDateStr(1))}
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg border transition ${
                        newDate === getTodayDateStr(1)
                          ? 'bg-teal-600 text-white border-teal-700'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>

                {/* Specific Time Picker */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{t.timeScheduled || "Time"}</span>
                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {newTime}
                    </span>
                  </label>
                  <input
                    type="time"
                    required
                    value={convert12To24Hour(newTime)}
                    onChange={(e) => setNewTime(convert24To12Hour(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-300 focus:border-teal-500 font-bold text-sm bg-white"
                  />
                  {/* Quick Preset / Test Time Buttons */}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setNewDate(getTodayDateStr(0));
                        setNewTime(getCurrentTime12Hour(1));
                      }}
                      className="text-[11px] font-black px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 transition"
                      title="Set for 1 minute from now to test high alert immediately"
                    >
                      ⚡ +1m Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTime("08:30 AM")}
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    >
                      08:30 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTime("01:30 PM")}
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    >
                      01:30 PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {t.medicineDosage || "Details / Instructions"}
                </label>
                <textarea
                  placeholder="e.g. 1 tablet after breakfast with warm water"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 rounded-2xl border-2 border-slate-300 focus:border-teal-500 font-medium text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 transition"
                >
                  {t.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 font-extrabold text-white shadow-tactile-btn transition"
                >
                  {t.saveReminder || "Save Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
