import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { speechService } from '../../services/speechService';
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
  Volume2
} from 'lucide-react';

export default function CaregiverReminders() {
  const { navigateTo, triggerReminderAlert, showToast } = useApp();
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('medicine');
  const [time, setTime] = useState('08:00 AM');
  const [detail, setDetail] = useState('');

  const loadData = async () => {
    const data = await api.getReminders();
    setReminders(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return;

    await api.createReminder({
      title,
      category,
      time,
      dosage_or_detail: detail,
      audio_prompt: `Reminder for ${title} scheduled at ${time}`,
      icon_name: category === 'medicine' ? 'Pill' : 'Bell'
    });

    setTitle('');
    setDetail('');
    setShowModal(false);
    await loadData();
  };

  const handleToggle = async (r) => {
    const nextStatus = !r.is_completed;
    await api.updateReminder(r.id, { is_completed: nextStatus });
    await loadData();
  };

  const handleDelete = async (id) => {
    await api.deleteReminder(id);
    await loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('caregiver', 'dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const sample = reminders[0] || {
                title: "Blood Pressure Tablet (Amlodipine)",
                category: "medicine",
                time: "08:30 AM",
                dosage_or_detail: "1 tablet after breakfast with water"
              };
              triggerReminderAlert(sample);
              showToast("🚨 High-Alert Alarm & Red Pop-up triggered", 3500, 'reminder');
            }}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition"
            title="Preview how the high alert sound and red modal pop-up appear on the Elder's screen"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Test Elder High-Alert Sound & Red Pop-up</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Scheduled Reminder</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-2">
        <h1 className="text-2xl font-bold text-white">Patient Medication & Routine Scheduler</h1>
        <p className="text-sm text-slate-400">
          Reminders configured here will automatically synchronize with the Elder Dashboard and trigger regional audio alerts.
        </p>
      </div>

      {/* Reminders Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map(r => (
          <div
            key={r.id}
            className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
              r.is_completed
                ? 'bg-slate-800/60 border-emerald-800/80 text-slate-300'
                : 'bg-slate-800 border-slate-700 text-white'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-cyan-300 px-2 py-0.5 rounded">
                  {r.category}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {r.time}
                </span>
                {r.is_completed && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-100">{r.title}</h3>
              <p className="text-xs text-slate-400">{r.dosage_or_detail}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  speechService.playHighAlertSound(3);
                  triggerReminderAlert(r);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800 text-xs font-bold flex items-center gap-1 transition"
                title="Test High Alert Sound & Red Pop-up for this reminder"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Alert</span>
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
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mark Done</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDelete(r.id)}
                className="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900 border border-rose-800 transition"
                title="Delete Reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl text-slate-100">
            <h2 className="text-xl font-bold mb-4">Add Scheduled Reminder</h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Title
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

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Schedule Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 AM"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:border-cyan-500 focus:outline-none"
                  />
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-sm text-white transition"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
