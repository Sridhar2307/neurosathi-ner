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
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Pill,
  Droplet,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  Bell,
  Volume2,
  CalendarDays
} from 'lucide-react';

export default function CaregiverReminders() {
  const { navigateTo, triggerReminderAlert, showToast, activePatientId, activePatient } = useApp();
  const { t } = useAccessibility();
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // New reminder form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('medicine');
  const [date, setDate] = useState(() => getTodayDateStr(0));
  const [time, setTime] = useState(() => getCurrentTime12Hour(1));
  const [detail, setDetail] = useState('');

  const [notifPermission, setNotifPermission] = useState(() => notificationService.getPermission());

  const loadData = async () => {
    const data = await api.getReminders(activePatientId);
    setReminders(data || []);
  };

  useEffect(() => {
    loadData();
    setNotifPermission(notificationService.getPermission());
  }, [activePatientId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return;

    await api.createReminder({
      user_id: activePatientId,
      title,
      category,
      date,
      time,
      dosage_or_detail: detail,
      audio_prompt: `Reminder for ${title} scheduled on ${formatDateDisplay(date)} at ${time}`,
      icon_name: category === 'medicine' ? 'Pill' : 'Bell'
    });

    setTitle('');
    setDetail('');
    setDate(getTodayDateStr(0));
    setShowModal(false);
    await loadData();
    showToast(`✓ Scheduled for ${formatDateDisplay(date)} at ${time}. High alert & notification will trigger!`, 4500, 'reminder');
  };

  const handleToggle = async (r) => {
    const nextStatus = !r.is_completed;
    await api.updateReminder(r.id, { is_completed: nextStatus }, activePatientId);
    await loadData();
  };

  const handleDelete = async (id) => {
    await api.deleteReminder(id, activePatientId);
    await loadData();
  };

  const upcomingReminders = reminders.filter(isReminderUpcoming);
  const previousReminders = reminders.filter(isReminderPast);

  const renderReminderCard = (r, isUpcoming) => {
    const dateLabel = formatDateDisplay(r.date);

    return (
      <div
        key={r.id}
        className={`p-5 rounded-2xl border flex items-start justify-between gap-4 transition ${
          r.is_completed
            ? 'bg-slate-800/60 border-emerald-800/80 text-slate-300'
            : isUpcoming
              ? 'bg-slate-800 border-cyan-800/90 text-white shadow-lg shadow-cyan-950/20'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-cyan-300 px-2 py-0.5 rounded">
              {r.category || 'medicine'}
            </span>

            {/* Date Tag */}
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> {dateLabel}
            </span>

            {/* Time Tag */}
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> {r.time}
            </span>

            {r.is_completed && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t.done || "Done"}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-100">{r.title}</h3>
          {r.dosage_or_detail && (
            <p className="text-xs text-slate-400">{r.dosage_or_detail}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              speechService.playHighAlertSound(3);
              triggerReminderAlert(r);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800 text-xs font-bold flex items-center gap-1 transition"
            title="Test High Alert Sound & Notification Bar for this reminder"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t.highAlertReminder || "Alert"}</span>
          </button>

          <button
            onClick={() => handleToggle(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              r.is_completed
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
            }`}
            title={r.is_completed ? "Click to mark as Pending" : "Click to mark as Completed"}
          >
            {r.is_completed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.done || "Done"}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.markDone || "Mark Done"}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleDelete(r.id)}
            className="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900 border border-rose-800 transition"
            title={t.delete || "Delete Reminder"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => navigateTo('caregiver', 'dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.overview ? `← ${t.overview}` : (t.backToHome || "Back to Overview")}</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={async () => {
              if (notifPermission !== 'granted') {
                const res = await notificationService.requestPermission();
                setNotifPermission(res);
              }
              await notificationService.testNotification();
              const sample = reminders[0] || {
                title: "Blood Pressure Tablet (Amlodipine)",
                category: "medicine",
                date: getTodayDateStr(0),
                time: "08:30 AM",
                dosage_or_detail: "1 tablet after breakfast with water"
              };
              triggerReminderAlert(sample);
              showToast("🚨 High-Alert Alarm & Notification Bar Pop-up triggered", 4000, 'reminder');
            }}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition"
            title="Test High Alert Sound and System Notification Bar Pop-up"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{t.testHighAlertBtn || "Test High-Alert & Notification Bar"}</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addReminder || "New Scheduled Reminder"}</span>
          </button>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-cyan-900/60 text-cyan-300 px-3 py-1 rounded-full border border-cyan-700">
            {t.patient || "Active"}: {activePatient?.name || 'Elder Patient'}
          </span>
          {notifPermission === 'granted' && (
            <span className="text-xs font-bold bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700 flex items-center gap-1">
              🔔 Notification Bar Pop-ups Active
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">{t.scheduleMeds || "Patient Medication & Routine Scheduler"}</h1>
        <p className="text-sm text-slate-400">
          Reminders configured here with specific <strong className="text-cyan-300">Date and Time</strong> automatically synchronize with the Elder Dashboard, sound regional audio alerts, and trigger native pop-ups in the system notification bar even when the platform is closed.
        </p>
      </div>

      {/* Reminders Content: Upcoming vs Previous */}
      {reminders.length === 0 ? (
        <div className="p-10 text-center bg-slate-800/60 rounded-3xl border border-slate-700 space-y-3">
          <p className="text-lg text-slate-300 font-bold">No reminders scheduled yet for {activePatient?.name || 'this patient'}.</p>
          <p className="text-sm text-slate-400 max-w-md mx-auto">Create a medication or routine reminder to have it pop up with audio prompts and system notification alerts.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" /> {t.addReminder || "Add First Reminder"}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* UPCOMING REMINDERS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>{t.upcomingReminders || "Upcoming Reminders"}</span>
                <span className="text-xs font-extrabold bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-700">
                  {upcomingReminders.length}
                </span>
              </h2>
              <span className="text-xs text-slate-400">Due today & scheduled future dates</span>
            </div>

            {upcomingReminders.length === 0 ? (
              <div className="p-6 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700 text-slate-400 text-sm">
                {t.noUpcomingReminders || "No upcoming reminders scheduled. All tasks are completed or up to date."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingReminders.map(r => renderReminderCard(r, true))}
              </div>
            )}
          </div>

          {/* PREVIOUS REMINDERS */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-slate-400" />
                <span>{t.previousReminders || "Previous Reminders"}</span>
                <span className="text-xs font-extrabold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {previousReminders.length}
                </span>
              </h2>
              <span className="text-xs text-slate-400">Completed & past scheduled routines</span>
            </div>

            {previousReminders.length === 0 ? (
              <div className="p-6 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700 text-slate-400 text-sm">
                {t.noPreviousReminders || "No previous reminders archived yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previousReminders.map(r => renderReminderCard(r, false))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal to Add New Scheduled Reminder */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl text-slate-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>{t.addReminder || "Add Scheduled Reminder"}</span>
            </h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {t.newReminderTitle || "Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Donepezil 5mg Tablet"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value="medicine">Medicine</option>
                  <option value="water">Water / Hydration</option>
                  <option value="meal">Nutritious Meal / Assam Tea</option>
                  <option value="appointment">Doctor Appointment</option>
                  <option value="daily_task">Daily Exercise / Walk</option>
                </select>
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                    <span>{t.scheduledDate || "Date"}</span>
                    <span className="text-xs font-bold text-amber-400">
                      {formatDateDisplay(date)}
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:border-cyan-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setDate(getTodayDateStr(0))}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition ${
                        date === getTodayDateStr(0)
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getTodayDateStr(1))}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition ${
                        date === getTodayDateStr(1)
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                    <span>Schedule Time</span>
                    <span className="text-xs font-black text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700">
                      {time}
                    </span>
                  </label>
                  <input
                    type="time"
                    required
                    value={convert12To24Hour(time)}
                    onChange={e => setTime(convert24To12Hour(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:border-cyan-500 focus:outline-none"
                  />
                  {/* Quick Preset / Test Time Buttons */}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setDate(getTodayDateStr(0));
                        setTime(getCurrentTime12Hour(1));
                      }}
                      className="text-[11px] font-black px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 transition"
                      title="Schedule 1 min from now to test alert"
                    >
                      ⚡ +1m Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime("08:30 AM")}
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                      08:30 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime("01:30 PM")}
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                      01:30 PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Dosage / Instructions
                </label>
                <textarea
                  placeholder="e.g. Take 1 tablet with lukewarm water after breakfast"
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold text-sm transition"
                >
                  {t.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-sm text-white transition"
                >
                  {t.saveReminder || t.save || "Save Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
