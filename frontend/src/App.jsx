import React from 'react';
import { useApp } from './context/AppContext';
import AccessibilityBar from './components/AccessibilityBar';
import Navbar from './components/Navbar';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import ReminderAlertModal from './components/ReminderAlertModal';

// Landing Page
import LandingPage from './pages/LandingPage';

// Elder Pages
import ElderDashboard from './pages/elder/ElderDashboard';
import GamesHub from './pages/elder/GamesHub';
import GameMemoryMatch from './pages/elder/GameMemoryMatch';
import GameSequenceRecall from './pages/elder/GameSequenceRecall';
import GameObjectRecognition from './pages/elder/GameObjectRecognition';
import GameDailyLifeSequence from './pages/elder/GameDailyLifeSequence';
import MemoryAssistance from './pages/elder/MemoryAssistance';
import ElderProgress from './pages/elder/ElderProgress';
import AccessibilitySettings from './pages/elder/AccessibilitySettings';

// Caregiver Pages
import CaregiverLogin from './pages/caregiver/CaregiverLogin';
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import CaregiverReminders from './pages/caregiver/CaregiverReminders';
import CaregiverAnalytics from './pages/caregiver/CaregiverAnalytics';
import AIRecommendationView from './pages/caregiver/AIRecommendationView';

import MobileBottomNav from './components/MobileBottomNav';

export default function App() {
  const { appMode, currentView, setCurrentView, caregiverSession, toastMessage } = useApp();

  // Route guard: if appMode is restored as 'caregiver' but there is no active session, force currentView to 'login'
  React.useEffect(() => {
    if (appMode === 'caregiver' && !caregiverSession && currentView !== 'login') {
      setCurrentView('login');
    }
  }, [appMode, caregiverSession, currentView, setCurrentView]);

  const renderCurrentView = () => {
    if (appMode === 'landing') {
      return <LandingPage />;
    }

    if (appMode === 'elder') {
      switch (currentView) {
        case 'dashboard':
          return <ElderDashboard />;
        case 'games_hub':
          return <GamesHub />;
        case 'game_memory':
          return <GameMemoryMatch />;
        case 'game_sequence':
          return <GameSequenceRecall />;
        case 'game_object':
          return <GameObjectRecognition />;
        case 'game_daily_life':
          return <GameDailyLifeSequence />;
        case 'reminders':
          return <MemoryAssistance />;
        case 'progress':
          return <ElderProgress />;
        case 'accessibility':
          return <AccessibilitySettings />;
        default:
          return <ElderDashboard />;
      }
    }

    if (appMode === 'caregiver') {
      // Guard: if no active caregiverSession in AppContext, always require login
      if (!caregiverSession) {
        return <CaregiverLogin />;
      }

      switch (currentView) {
        case 'login':
          return <CaregiverLogin />;
        case 'dashboard':
          return <CaregiverDashboard />;
        case 'reminders_mgr':
          return <CaregiverReminders />;
        case 'analytics':
          return <CaregiverAnalytics />;
        case 'ai_view':
          return <AIRecommendationView />;
        default:
          return <CaregiverDashboard />;
      }
    }

    return <LandingPage />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Sticky Header Group: AccessibilityBar + Navbar */}
      <div className="sticky top-0 z-40 w-full shadow-sm">
        <AccessibilityBar />
        <Navbar />
      </div>

      {/* Main Content Area (padded at bottom on mobile to accommodate MobileBottomNav) */}
      <main className="flex-1 w-full max-w-full pb-20 sm:pb-0 overflow-x-hidden">
        {renderCurrentView()}
      </main>

      {/* Voice Assistant Modal Popup */}
      <VoiceAssistantModal />

      {/* High Alert Reminder Modal Popup */}
      <ReminderAlertModal />

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Notification Pop-up (Vivid Red for Reminders & Alerts, offset above bottom nav on mobile) */}
      {toastMessage && (
        <div
          className={`fixed bottom-20 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl shadow-2xl text-sm sm:text-base font-black animate-fadeIn flex items-center gap-3 border-2 ${
            (typeof toastMessage === 'object' && (toastMessage.type === 'reminder' || toastMessage.type === 'alert'))
              ? 'bg-red-600 text-white border-red-400 ring-4 ring-red-400/40 shadow-red-600/50'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {(typeof toastMessage === 'object' && (toastMessage.type === 'reminder' || toastMessage.type === 'alert')) && (
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-red-600 flex items-center justify-center text-sm sm:text-base shrink-0 animate-bounce">
              🔔
            </span>
          )}
          <span className="truncate">{typeof toastMessage === 'object' ? toastMessage.message : toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-5 px-4 border-t border-slate-800 text-center space-y-1 mb-14 sm:mb-0">
        <p className="font-bold text-slate-300">
          NeuroSathi NER • SIH 2026 Problem Statement ID: SIH26003 • Team Mavericks
        </p>
        <p>
          AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region
        </p>
      </footer>
    </div>
  );
}
