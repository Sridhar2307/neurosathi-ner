import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api, DEMO_USER_ID } from '../services/api';
import { isReminderDueNow } from '../services/reminderScheduler';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current active mode: 'elder' | 'caregiver' | 'landing'
  const [appMode, setAppMode] = useState(() => localStorage.getItem('ns_appMode') || 'landing');
  
  // Current active page view within the mode
  const [currentView, setCurrentView] = useState('dashboard');

  const [userProfile, setUserProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); // string or { message, type }
  const [activeReminderAlert, setActiveReminderAlert] = useState(null);

  // Set of reminders already triggered today so we don't spam
  const triggeredRemindersRef = useRef(new Set());

  // Caregiver session — stores login info + patient list
  const [caregiverSession, setCaregiverSessionRaw] = useState(() => {
    try {
      const stored = localStorage.getItem('ns_caregiver_session');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const setCaregiverSession = (session) => {
    setCaregiverSessionRaw(session);
    if (session) {
      localStorage.setItem('ns_caregiver_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('ns_caregiver_session');
    }
  };

  // Active patient derived from session
  const activePatient = caregiverSession?.activePatient || null;
  const activePatientId = activePatient?.id || DEMO_USER_ID;

  const switchPatient = (patient) => {
    setCaregiverSession({ ...caregiverSession, activePatient: patient });
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const caregiverLogout = () => {
    setCaregiverSession(null);
    localStorage.removeItem('ns_appMode');
    setAppMode('landing');
    setCurrentView('dashboard');
  };

  // Load user data and check backend connectivity
  const refreshUserData = async () => {
    const health = await api.checkHealth();
    setIsOnline(health.online);

    const uid = activePatientId;
    const profile = await api.getUserProfile(uid);
    setUserProfile(profile);
  };

  useEffect(() => {
    refreshUserData();
    localStorage.setItem('ns_appMode', appMode);
  }, [appMode, activePatientId]);

  // Real-time Reminder Scheduler: Checks every 5 seconds if any scheduled reminder is due
  useEffect(() => {
    const checkScheduledReminders = async () => {
      // Don't interrupt if an alert popup is already open
      if (activeReminderAlert) return;

      try {
        const reminders = await api.getReminders(activePatientId);
        const pending = (reminders || []).filter(r => !r.is_completed);
        const todayStr = new Date().toDateString();

        for (const rem of pending) {
          if (!rem.time) continue;

          // Check if due right now (at current minute)
          if (isReminderDueNow(rem.time, 1)) {
            const triggerKey = `${rem.id}_${rem.time}_${todayStr}`;
            if (!triggeredRemindersRef.current.has(triggerKey)) {
              triggeredRemindersRef.current.add(triggerKey);
              setActiveReminderAlert(rem);
              break; // Pop up one reminder at a time
            }
          }
        }
      } catch (err) {
        console.warn("Reminder scheduler check error:", err);
      }
    };

    checkScheduledReminders();
    const interval = setInterval(checkScheduledReminders, 5000);
    return () => clearInterval(interval);
  }, [activePatientId, activeReminderAlert]);

  const showToast = (msg, duration = 3000, type = 'normal') => {
    setToastMessage(typeof msg === 'object' ? msg : { message: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  const triggerReminderAlert = (reminder) => {
    setActiveReminderAlert(reminder);
  };

  const closeReminderAlert = () => {
    setActiveReminderAlert(null);
  };

  const navigateTo = (mode, view = 'dashboard') => {
    setAppMode(mode);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        appMode,
        setAppMode,
        currentView,
        setCurrentView,
        navigateTo,
        userProfile,
        setUserProfile,
        refreshUserData,
        isOnline,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        toastMessage,
        showToast,
        activeReminderAlert,
        triggerReminderAlert,
        closeReminderAlert,
        caregiverSession,
        setCaregiverSession,
        activePatient,
        activePatientId,
        switchPatient,
        caregiverLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
