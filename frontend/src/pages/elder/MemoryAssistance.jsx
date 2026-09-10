import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { speechService } from '../../services/speechService';
import {
  convert24To12Hour,
  convert12To24Hour,
  getCurrentTime12Hour
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
  AlertTriangle
} from 'lucide-react';

export default function MemoryAssistance() {
  const { navigateTo, refreshUserData, triggerReminderAlert, showToast } = useApp();
  const { speakText, autoVoiceRead, t } = useAccessibility();

  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'medicine'
  const [showAddModal, setShowAddModal] = useState(false);

  // New reminder form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('medicine');
  const [newTime, setNewTime] = useState(() => getCurrentTime12Hour(1));
  const [newDetail, setNewDetail] = useState('');

  const loadReminders = async () => {
    const data = await api.getReminders();
    setReminders(data);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleToggleComplete = async (rem) => {
    const nextStatus = !rem.is_completed;
    await api.updateReminder(rem.id, { is_completed: nextStatus });
    await loadReminders();
    refreshUserData();

    if (nextStatus) {
      speakText(`Marked ${rem.title} as completed. You earned 2 stars!`);
    } else {
      speakText(`Marked ${rem.title} as pending.`);
    }
  };

  const handleDelete = async (id, title) => {
    await api.deleteReminder(id);
    await loadReminders();
    speakText(`Deleted reminder ${title}`);
  };

  const handleSnoozeReminder = async (rem, minutes) => {
    const updated = await api.snoozeReminder(rem.id, minutes);
    await loadReminders();
    refreshUserData();
    const newTimeDisplay = updated?.time || `${minutes}m later`;
    speakText(`Reminder snoozed until ${newTimeDisplay}.`);
    showToast(`⏰ Snoozed to ${newTimeDisplay}`, 3500, 'reminder');
  };

  const handleTakeLaterReminder = async (rem) => {
    const updated = await api.takeLaterReminder(rem.id);
    await loadReminders();
    refreshUserData();
    const newTimeDisplay = updated?.time || "08:00 PM";
    speakText(`Reminder moved to ${newTimeDisplay} tonight.`);
    showToast(`🌙 Rescheduled to ${newTimeDisplay} tonight`, 3500, 'reminder');
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    await api.createReminder({
      title: newTitle,
      category: newCategory,
      time: newTime,
      dosage_or_detail: newDetail || "Daily routine reminder",
      audio_prompt: `Reminder for ${newTitle} scheduled for ${newTime}`,
      icon_name: newCategory === 'medicine' ? 'Pill' : (newCategory === 'water' ? 'Droplet' : 'Bell')
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewDetail('');
    await loadReminders();
    refreshUserData();
    speakText(`New reminder for ${newTitle} scheduled for ${newTime}.`);
    showToast(`✓ Scheduled for ${newTime}. High alert will pop up at this time!`, 4000, 'reminder');
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'pending') return !r.is_completed;
    if (filter === 'completed') return r.is_completed;
    if (filter === 'medicine') return r.category === 'medicine';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => {
            speakText(t.navToHome || t.home);
            navigateTo('elder', 'dashboard');
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-teal-900 font-bold text-base shadow-sm transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
          <span>{t.backToHome || "Back to Home"}</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          {/* Test High Alert Button */}
          <button
            onClick={() => {
              const targetRem = reminders.find(r => !r.is_completed) || reminders[0] || {
                title: "Blood Pressure Tablet (Amlodipine)",
                category: "medicine",
                time: "10:00 AM",
                dosage_or_detail: "1 tablet after food with a warm cup of water"
              };
              triggerReminderAlert(targetRem);
              showToast("🚨 Testing High Alert Sound & Red Pop-up Notification", 3000, 'reminder');
            }}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base flex items-center gap-2 shadow-md active:scale-95 transition"
            title="Test High Alert Sound and Red Notification Pop-up"
          >
            <Bell className="w-5 h-5 animate-bounce" />
            <span>{t.testHighAlertBtn || "Test High Alert Sound & Pop-up"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base sm:text-lg flex items-center gap-2 shadow-tactile-btn transition"
          >
            <Plus className="w-6 h-6" />
            <span>{t.addReminder || "Add Reminder"}</span>
          </button>
        </div>
      </div>

      {/* Title & Filter Tabs */}
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
            { id: 'all', label: t.filterAll || 'All Items' },
            { id: 'pending', label: t.filterPending || 'Pending Only' },
            { id: 'completed', label: t.filterCompleted || 'Completed' },
            { id: 'medicine', label: t.filterMedicine || 'Medicines 💊' }
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

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-slate-200 text-slate-500 font-bold text-lg">
            {t.noRemindersPending || "No reminders found in this filter."}
          </div>
        ) : (
          filteredReminders.map(rem => {
            const isDone = rem.is_completed;
            const categoryIcon = rem.category === 'medicine' ? '💊' : (rem.category === 'water' ? '💧' : '⏰');

            return (
              <div
                key={rem.id}
                className={`elder-card p-5 sm:p-7 transition-all border-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-300 opacity-80'
                    : 'bg-white border-amber-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${
                    isDone ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {categoryIcon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300">
                        {rem.category.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-extrabold text-amber-900 flex items-center gap-1">
                        <Clock className="w-4 h-4 text-amber-700" /> {rem.time}
                      </span>
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

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <AudioButton
                    textToRead={`Reminder: ${rem.title} at ${rem.time}. ${rem.dosage_or_detail || ''}`}
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
                        title="Trigger High Alert Sound & Red Pop-up"
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
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-tactile-amber'
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
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-md w-full p-6 sm:p-8 border-4 border-teal-400 shadow-2xl animate-gentle-float">
            <h2 className="text-2xl font-black text-teal-950 mb-4">
              {t.addReminder || "Add New Daily Reminder"}
            </h2>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {t.newReminderTitle || "Reminder Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Tea with Almonds"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-teal-500 font-semibold text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <option value="water">Water 💧</option>
                    <option value="appointment">Appointment 🏥</option>
                    <option value="daily_task">Daily Task 🌿</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{t.timeScheduled || "Scheduled Time"}</span>
                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {newTime}
                    </span>
                  </label>
                  <input
                    type="time"
                    required
                    value={convert12To24Hour(newTime)}
                    onChange={(e) => setNewTime(convert24To12Hour(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-teal-500 font-bold text-base bg-white"
                  />
                  {/* Quick Preset / Test Time Buttons */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setNewTime(getCurrentTime12Hour(1))}
                      className="text-xs font-black px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 transition"
                      title="Set for 1 minute from now to test high alert immediately"
                    >
                      ⚡ +1m (Test Now)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTime(getCurrentTime12Hour(5))}
                      className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    >
                      +5m
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTime("08:30 AM")}
                      className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                    >
                      08:30 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTime("01:30 PM")}
                      className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200"
                    >
                      01:30 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTime("08:00 PM")}
                      className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200"
                    >
                      08:00 PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {t.medicineDosage || "Details / Instructions"}
                </label>
                <textarea
                  placeholder="e.g. 1 cup warm tea with 4 soaked almonds"
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
