import React from 'react';
import { useApp } from './context/AppContext';
import AccessibilityBar from './components/AccessibilityBar';
import Navbar from './components/Navbar';
import VoiceAssistantModal from './components/VoiceAssistantModal';

// Landing Page
import LandingPage from './pages/LandingPage';

// Elder Pages
import ElderDashboard from './pages/elder/ElderDashboard';
import GamesHub from './pages/elder/GamesHub';
import GameMemoryMatch from './pages/elder/GameMemoryMatch';
import GameSequenceRecall from './pages/elder/GameSequenceRecall';
import GameObjectRecognition from './pages/elder/GameObjectRecognition';
import MemoryAssistance from './pages/elder/MemoryAssistance';
import ElderProgress from './pages/elder/ElderProgress';
import AccessibilitySettings from './pages/elder/AccessibilitySettings';

// Caregiver Pages
import CaregiverLogin from './pages/caregiver/CaregiverLogin';
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import CaregiverReminders from './pages/caregiver/CaregiverReminders';
import CaregiverAnalytics from './pages/caregiver/CaregiverAnalytics';
import AIRecommendationView from './pages/caregiver/AIRecommendationView';

export default function App() {
  const { appMode, currentView, toastMessage } = useApp();

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
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Accessibility Quick Bar */}
      <AccessibilityBar />

      {/* Adaptive Header Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Voice Assistant Modal Popup */}
      <VoiceAssistantModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 text-base font-bold animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-6 px-4 border-t border-slate-800 text-center space-y-1">
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
