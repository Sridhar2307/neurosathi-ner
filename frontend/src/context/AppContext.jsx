import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAccessibility } from './AccessibilityContext';
import { api, cleanupDemoData } from '../services/api';
import { isReminderDueNow } from '../services/reminderScheduler';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Ensure demo mock data is cleaned on startup while preserving real user sessions
  cleanupDemoData();

  const { language, setLanguage } = useAccessibility();
  // Current active mode: 'elder' | 'caregiver' | 'landing'
  const [appMode, setAppMode] = useState(() => localStorage.getItem('ns_appMode') || 'landing');
  
  // Current active page view within the mode
  const [currentView, setCurrentView] = useState('dashboard');

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('ns_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && !['demo-user-123', 'patient-lakshmi-demo'].includes(parsed.id) && !['Bhaben Kalita', 'Lakshmi Devi'].includes(parsed.name)) {
          return parsed;
        }
      }
      return null;
    } catch { return null; }
  });
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
      if (stored) {
        const session = JSON.parse(stored);
        if (session?.activePatient?.id && !['demo-user-123', 'patient-lakshmi-demo'].includes(session.activePatient.id)) {
          return session;
        }
      }
      return null;
    } catch { return null; }
  });

  // Track activePatientId explicitly across Elder & Caregiver modes
  const [activePatientId, setActivePatientId] = useState(() => {
    try {
      const storedSession = localStorage.getItem('ns_caregiver_session');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed?.activePatient?.id && !['demo-user-123', 'patient-lakshmi-demo'].includes(parsed.activePatient.id)) {
          return parsed.activePatient.id;
        }
      }
      const rawActive = localStorage.getItem('ns_active_patient_id');
      if (rawActive && !['demo-user-123', 'patient-lakshmi-demo'].includes(rawActive)) {
        return rawActive;
      }
      return null;
    } catch {
      return null;
    }
  });

  const setCaregiverSession = (session) => {
    setCaregiverSessionRaw(session);
    if (session) {
      localStorage.setItem('ns_caregiver_session', JSON.stringify(session));
      if (session.activePatient) {
        setActivePatientId(session.activePatient.id);
        localStorage.setItem('ns_active_patient_id', session.activePatient.id);
        localStorage.setItem('ns_profile', JSON.stringify(session.activePatient));
        setUserProfile(session.activePatient);

        // Auto-sync UI and voice language to patient's language preference
        const pLang = session.activePatient.language_preference;
        if (pLang && ['en', 'as', 'bn', 'hi', 'mni', 'lus'].includes(pLang)) {
          setLanguage(pLang);
          localStorage.setItem('ns_language', pLang);
        }
      }
    } else {
      localStorage.removeItem('ns_caregiver_session');
    }
  };

  // In Caregiver mode, active patient strictly derives from the authenticated session
  // In Elder mode, fallback to userProfile if logged in
  const activePatient = caregiverSession?.activePatient || (appMode === 'elder' ? (userProfile || null) : null);
  const allPatients = caregiverSession?.allPatients || [];

  const switchPatient = (patient) => {
    if (!patient) return;
    const updatedSession = caregiverSession ? { ...caregiverSession, activePatient: patient } : { activePatient: patient };
    setCaregiverSession(updatedSession);
    setActivePatientId(patient.id);
    localStorage.setItem('ns_active_patient_id', patient.id);
    localStorage.setItem('ns_profile', JSON.stringify(patient));
    setUserProfile(patient);

    const pLang = patient.language_preference;
    if (pLang && ['en', 'as', 'bn', 'hi', 'mni', 'lus'].includes(pLang)) {
      setLanguage(pLang);
      localStorage.setItem('ns_language', pLang);
    }

    showToast(`Active patient switched to ${patient.name}`);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const caregiverLogout = () => {
    setCaregiverSession(null);
    localStorage.removeItem('ns_caregiver_session');
    localStorage.removeItem('ns_active_patient_id');
    localStorage.removeItem('ns_profile');
    localStorage.removeItem('ns_appMode');
    setUserProfile(null);
    setActivePatientId(null);
    setAppMode('landing');
    setCurrentView('dashboard');
    showToast('Logged out of caregiver portal');
  };

  // Load user data and check backend connectivity
  const refreshUserData = async () => {
    const health = await api.checkHealth();
    setIsOnline(health.online);

    // Only load profile if activePatientId is known and not demo
    const uid = activePatientId;
    if (uid && !['demo-user-123', 'patient-lakshmi-demo'].includes(uid)) {
      const profile = await api.getUserProfile(uid);
      if (profile) {
        setUserProfile(profile);
        localStorage.setItem('ns_profile', JSON.stringify(profile));
      }
    } else {
      if (appMode === 'caregiver' && !caregiverSession) {
        setUserProfile(null);
      }
    }
  };

  useEffect(() => {
    refreshUserData();
    localStorage.setItem('ns_appMode', appMode);
  }, [appMode, activePatientId]);

  // Real-time Reminder Scheduler: Checks every 5 seconds if any scheduled reminder is due
  useEffect(() => {
    const checkScheduledReminders = async () => {
      // Don't interrupt if an alert popup is already open or no active patient logged in
      if (activeReminderAlert || !activePatientId) return;

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
        allPatients,
        switchPatient,
        caregiverLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
