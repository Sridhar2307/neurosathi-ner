import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { speechService } from '../services/speechService';
import { api } from '../services/api';
import {
  Bell,
  Volume2,
  CheckCircle2,
  Clock,
  X,
  RotateCcw,
  AlertTriangle,
  Pill,
  Droplet
} from 'lucide-react';

export default function ReminderAlertModal() {
  const {
    activeReminderAlert,
    closeReminderAlert,
    refreshUserData,
    showToast
  } = useApp();
  const { speakText, stopSpeaking, t } = useAccessibility();

  // Play high alert alarm and voice prompt when the red popup appears
  useEffect(() => {
    if (activeReminderAlert) {
      // 1. Play loud, penetrating high-alert dual-frequency sound
      speechService.playHighAlertSound(3);

      // 2. Speak reminder details after alarm tone starts
      const timeoutId = setTimeout(() => {
        const textToRead = activeReminderAlert.audio_prompt ||
          `Urgent reminder: Time to take ${activeReminderAlert.title}. ${activeReminderAlert.dosage_or_detail || ''}`;
        speakText(textToRead);
      }, 1200);

      return () => {
        clearTimeout(timeoutId);
        stopSpeaking();
      };
    }
  }, [activeReminderAlert]);

  if (!activeReminderAlert) return null;

  const handlePlaySound = () => {
    speechService.playHighAlertSound(3);
  };

  const handleReadAloud = () => {
    const textToRead = activeReminderAlert.audio_prompt ||
      `Reminder for ${activeReminderAlert.title}. ${activeReminderAlert.dosage_or_detail || ''}`;
    speakText(textToRead);
  };

  const handleComplete = async () => {
    try {
      if (activeReminderAlert.id) {
        await api.updateReminder(activeReminderAlert.id, { is_completed: true });
      }
      speechService.playSuccessChime();
      speakText(`Marked ${activeReminderAlert.title} as completed. Excellent job!`);
      showToast(`✓ Completed: ${activeReminderAlert.title}`, 4000, 'reminder');
      refreshUserData();
    } catch (e) {
      console.error(e);
    } finally {
      closeReminderAlert();
    }
  };

  const handleSnooze = async (minutes = 10) => {
    try {
      if (activeReminderAlert.id) {
        await api.snoozeReminder(activeReminderAlert.id, minutes);
      }
      speakText(`Reminder snoozed for ${minutes} minutes.`);
      showToast(`⏰ Snoozed for ${minutes} mins`, 3000, 'reminder');
      refreshUserData();
    } catch (e) {
      console.error(e);
    } finally {
      closeReminderAlert();
    }
  };

  const isMedicine = activeReminderAlert.category === 'medicine';
  const isWater = activeReminderAlert.category === 'water';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="High Alert Reminder Notification"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/75 backdrop-blur-md animate-fadeIn"
    >
      {/* High-Alert Red Notification Window */}
      <div className="relative w-full max-w-xl bg-white rounded-4xl border-4 border-red-600 shadow-2xl shadow-red-600/40 ring-8 ring-red-500/30 overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Red Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-white shadow-inner animate-bounce">
              <Bell className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-red-700 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                  🚨 HIGH ALERT REMINDER
                </span>
                <span className="text-xs font-bold text-red-100 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {activeReminderAlert.time || 'Due Now'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Attention Required
              </h2>
            </div>
          </div>

          <button
            onClick={closeReminderAlert}
            className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/30"
            title="Dismiss Alert"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body in Red Tint */}
        <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-red-50/60 to-white">
          
          {/* Main Reminder Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-red-300 shadow-md flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-red-100 border-2 border-red-300 text-red-700 flex items-center justify-center text-3xl font-black shrink-0 shadow-inner">
              {isMedicine ? '💊' : isWater ? '💧' : '🔔'}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  {activeReminderAlert.category ? activeReminderAlert.category.replace('_', ' ') : 'Reminder'}
                </span>
                <span className="text-sm font-extrabold text-red-700 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {activeReminderAlert.time}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {activeReminderAlert.title}
              </h3>

              {activeReminderAlert.dosage_or_detail && (
                <div className="mt-2 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 font-semibold text-base sm:text-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{activeReminderAlert.dosage_or_detail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sound Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-red-100/70 border-2 border-red-300 p-3.5 rounded-2xl">
            <span className="text-xs sm:text-sm font-black text-red-900 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              High-Audibility Alarm Active
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlaySound}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Replay High Alert Sound</span>
              </button>
              <button
                type="button"
                onClick={handleReadAloud}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-red-800 border border-red-300 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <span>Voice Read</span>
              </button>
            </div>
          </div>

          {/* Big Tactile Action Buttons for Elderly Accessibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleComplete}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>{t.markDone || "Mark as Taken / Done"}</span>
            </button>

            <button
              onClick={() => handleSnooze(10)}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-tactile-btn active:shadow-tactile-btn-pressed transform active:translate-y-1 transition"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Snooze (10 mins)</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={closeReminderAlert}
              className="text-sm font-bold text-red-800 hover:text-red-950 underline underline-offset-4 transition"
            >
              Dismiss alert for now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
