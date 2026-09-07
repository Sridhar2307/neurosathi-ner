import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { speechService } from '../services/speechService';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Play,
  Bell,
  Award,
  PhoneCall,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function VoiceAssistantModal() {
  const { isVoiceAssistantOpen, setIsVoiceAssistantOpen, navigateTo } = useApp();
  const { speakText, stopSpeaking, fontSize, cycleTheme, cycleFontSize, setLanguage, language, t } = useAccessibility();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const getInitialGreeting = (lang) => {
    switch (lang) {
      case 'mni':
        return 'খুরুমজরি! ঙসি ঐহাক্না করম্না তেংবাংগদগে? ৱারী শানবীয়ু নত্রগা মখাদা লৈবা ওক্সনশিং নমবীয়ু।';
      case 'lus':
        return 'Chibai! Vawiin chu engtin nge ka puih theih ang che? Ṭawng la emaw hnuai lam hi hmet rawh.';
      case 'as':
        return 'নমস্কাৰ! মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ? কওক বা তলৰ বিকল্প বাচনী কৰক।';
      case 'bn':
        return 'নমস্কার! আজ আপনাকে কীভাবে সাহায্য করতে পারি? কথা বলুন অথবা নিচের বোতাম চাপুন।';
      case 'hi':
        return 'नमस्ते! मैं आज आपकी कैसे सहायता कर सकता हूँ? बोलिए या नीचे दिए गए विकल्पों को चुनिए।';
      default:
        return 'How can I help you today? You can speak or tap any option below.';
    }
  };

  const [responseMessage, setResponseMessage] = useState(() => getInitialGreeting(language));
  const [isSttSupported, setIsSttSupported] = useState(true);

  useEffect(() => {
    setIsSttSupported(speechService.isSTTAvailable());
    setResponseMessage(getInitialGreeting(language));
  }, [language]);

  if (!isVoiceAssistantOpen) return null;

  const processCommand = async (rawText) => {
    const text = rawText.toLowerCase().trim();
    setTranscript(rawText);

    // 1. Reminders
    if (
      text.includes('reminder') || text.includes('medicine') || text.includes('water') ||
      text.includes('today') || text.includes('schedule') || text.includes('have today') ||
      text.includes('হিদাক') || text.includes('নীংশিংবা') || text.includes('ঈশিং') ||
      text.includes('hriattirna') || text.includes('damdawi') || text.includes('tui') ||
      text.includes('দাওয়াই') || text.includes('ওষুধ') || text.includes('ঔষধ') || text.includes('সোঁৱৰণী')
    ) {
      const reminders = await api.getReminders();
      const pending = reminders.filter(r => !r.is_completed);
      const msg = pending.length > 0
        ? `You have ${pending.length} pending items today. Next is: ${pending[0].title} scheduled for ${pending[0].time}.`
        : `All your routine reminders for today are completed! Wonderful job.`;
      
      setResponseMessage(msg);
      speakText(msg);
      setTimeout(() => {
        navigateTo('elder', 'reminders');
        setIsVoiceAssistantOpen(false);
      }, 3500);
      return;
    }

    // 2. Memory Match Game
    if (
      text.includes('match') || text.includes('game') || text.includes('memory') || text.includes('play') ||
      text.includes('খেল') || text.includes('শানবা') || text.includes('শানসি') || text.includes('জোৰা') ||
      text.includes('infiamna') || text.includes('tihtak')
    ) {
      const msg = "Starting the North East Heritage Memory Match game now. Enjoy matching the regional cards!";
      setResponseMessage(msg);
      speakText(msg);
      setTimeout(() => {
        navigateTo('elder', 'game_memory');
        setIsVoiceAssistantOpen(false);
      }, 2500);
      return;
    }

    // 3. Sequence Recall
    if (
      text.includes('sequence') || text.includes('rhythm') || text.includes('drum') || text.includes('bell') ||
      text.includes('ঢোল') || text.includes('ঘণ্টা') || text.includes('পুং') || text.includes('buh')
    ) {
      const msg = "Starting the Rhythm and Sequence Recall game. Listen to the gentle beats!";
      setResponseMessage(msg);
      speakText(msg);
      setTimeout(() => {
        navigateTo('elder', 'game_sequence');
        setIsVoiceAssistantOpen(false);
      }, 2500);
      return;
    }

    // 4. Object Recognition
    if (
      text.includes('object') || text.includes('story') || text.includes('recognize') || text.includes('japi') ||
      text.includes('জাপি') || text.includes('শৰাই') || text.includes('থাগৎপা') || text.includes('thawnthu')
    ) {
      const msg = "Opening North East Object and Story Recall game. Let's look at familiar memories!";
      setResponseMessage(msg);
      speakText(msg);
      setTimeout(() => {
        navigateTo('elder', 'game_object');
        setIsVoiceAssistantOpen(false);
      }, 2500);
      return;
    }

    // 5. Progress / Stars
    if (
      text.includes('progress') || text.includes('star') || text.includes('streak') || text.includes('score') ||
      text.includes('থৌজাল') || text.includes('চাউখৎপা') || text.includes('arsi') || text.includes('hmasawnna') ||
      text.includes('তৰা') || text.includes('তারা') || text.includes('सितारे')
    ) {
      const profile = await api.getUserProfile();
      const msg = `You have earned ${profile.total_stars} stars and are on a ${profile.current_streak}-day cognitive streak. You are doing fantastic!`;
      setResponseMessage(msg);
      speakText(msg);
      setTimeout(() => {
        navigateTo('elder', 'progress');
        setIsVoiceAssistantOpen(false);
      }, 3500);
      return;
    }

    // 6. Caregiver Call
    if (
      text.includes('caregiver') || text.includes('call') || text.includes('daughter') || text.includes('doctor') ||
      text.includes('emergency') || text.includes('কেয়ারগিভর') || text.includes('ডাক্তর') ||
      text.includes('enkawltu') || text.includes('chhungte')
    ) {
      const profile = await api.getUserProfile();
      const msg = `Connecting to your caregiver ${profile.emergency_contact_name} at ${profile.emergency_contact_phone}.`;
      setResponseMessage(msg);
      speakText(msg);
      return;
    }

    // 7. Contrast
    if (text.includes('contrast') || text.includes('dark') || text.includes('color')) {
      cycleTheme();
      const msg = "Display contrast updated for your comfort.";
      setResponseMessage(msg);
      speakText(msg);
      return;
    }

    // 8. Font Size
    if (text.includes('text') || text.includes('font') || text.includes('bigger') || text.includes('large')) {
      cycleFontSize();
      const msg = "Text size adjusted.";
      setResponseMessage(msg);
      speakText(msg);
      return;
    }

    // Default Fallback
    const fallbackMsg = `I heard: "${rawText}". Let me guide you to your Mind Games or Reminders.`;
    setResponseMessage(fallbackMsg);
    speakText(fallbackMsg);
  };

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript('Listening for your voice...');
      speechService.startListening({
        onResult: (result) => {
          setIsListening(false);
          processCommand(result);
        },
        onError: (err) => {
          setIsListening(false);
          setResponseMessage("I couldn't hear clearly. Please tap one of the voice shortcut buttons below.");
          speakText("Please tap one of the buttons below.");
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-400 max-w-2xl w-full p-6 sm:p-8 relative animate-gentle-float text-slate-900">
        {/* Close Button */}
        <button
          onClick={() => {
            stopSpeaking();
            speechService.stopListening();
            setIsVoiceAssistantOpen(false);
          }}
          className="absolute top-5 right-5 p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          aria-label="Close Voice Assistant"
        >
          <X className="w-7 h-7" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-teal-950 font-sans">
              Voice Sathi <span className="text-amber-600">ভইচ সাথী</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Elderly Voice & Speech Companion
            </p>
          </div>
        </div>

        {/* Dynamic Voice Wave / Status Display */}
        <div className="bg-teal-50 rounded-2xl p-6 border-2 border-teal-200 text-center mb-6 shadow-inner">
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-xl ${
                isListening
                  ? 'bg-rose-500 animate-audio-pulse ring-8 ring-rose-200'
                  : 'bg-amber-500 hover:bg-amber-600 ring-8 ring-amber-100 shadow-tactile-amber'
              }`}
              title={isListening ? "Listening... Tap to Stop" : "Tap to Speak"}
            >
              {isListening ? <Mic className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
            </button>
          </div>

          <p className="text-sm font-bold uppercase tracking-wider text-teal-800 mb-1">
            {isListening ? "🔴 LISTENING TO YOUR VOICE..." : "TAP MICROPHONE TO SPEAK"}
          </p>

          {transcript && (
            <p className="text-base text-slate-700 font-medium italic mt-2">
              "{transcript}"
            </p>
          )}

          <div className="mt-4 p-3 bg-white rounded-xl border border-teal-200 text-left flex items-start gap-2.5 shadow-sm">
            <Volume2 className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-base sm:text-lg text-teal-950 font-semibold leading-relaxed">
              {responseMessage}
            </p>
          </div>
        </div>

        {/* Fallback Command Chips (Crucial for SIH accessibility specs) */}
        <div>
          <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Or Tap a Voice Command:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => processCommand("What medicines and reminders do I have today?")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-left font-bold text-teal-900 transition hover:border-teal-400 shadow-sm"
            >
              <Bell className="w-6 h-6 text-teal-600 shrink-0" />
              <span className="text-base">"Read my reminders"</span>
            </button>

            <button
              onClick={() => processCommand("Start North East memory match game")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-200 text-left font-bold text-amber-950 transition hover:border-amber-400 shadow-sm"
            >
              <Play className="w-6 h-6 text-amber-500 shrink-0" />
              <span className="text-base">"Start Memory Match"</span>
            </button>

            <button
              onClick={() => processCommand("Read my progress and stars")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-purple-50 border-2 border-purple-200 text-left font-bold text-purple-950 transition hover:border-purple-400 shadow-sm"
            >
              <Award className="w-6 h-6 text-purple-600 shrink-0" />
              <span className="text-base">"What is my progress?"</span>
            </button>

            <button
              onClick={() => processCommand("Call my caregiver and daughter")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-rose-50 border-2 border-rose-200 text-left font-bold text-rose-950 transition hover:border-rose-400 shadow-sm"
            >
              <PhoneCall className="w-6 h-6 text-rose-600 shrink-0" />
              <span className="text-base">"Call Caregiver"</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
