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

export const VOICE_I18N = {
  en: {
    headerTitle: "Voice Sathi",
    headerSub: "Elderly Voice & Speech Companion",
    listening: "🔴 LISTENING TO YOUR VOICE...",
    tapToSpeak: "TAP MICROPHONE TO SPEAK",
    listeningPrompt: "Listening for your voice...",
    cantHear: "I couldn't hear clearly. Please tap one of the voice shortcut buttons below.",
    cantHearShort: "Please tap one of the buttons below.",
    orTapCommand: "Or Tap a Voice Command:",
    chipReminders: '"Read my reminders"',
    chipGame: '"Start Memory Match"',
    chipProgress: '"What is my progress?"',
    chipCaregiver: '"Call Caregiver"',
    greeting: "How can I help you today? You can speak or tap any option below.",
    remindersPending: (count, title, time) => `You have ${count} pending items today. Next is: ${title} scheduled for ${time}.`,
    remindersCompleted: "All your routine reminders for today are completed! Wonderful job.",
    startMemoryMatch: "Starting the North East Heritage Memory Match game now. Enjoy matching the regional cards!",
    startSequence: "Starting the Rhythm and Sequence Recall game. Listen to the gentle beats!",
    startObject: "Opening North East Object and Story Recall game. Let's look at familiar memories!",
    progress: (stars, streak) => `You have earned ${stars} stars and are on a ${streak}-day cognitive streak. You are doing fantastic!`,
    callCaregiver: (name, phone) => `Connecting to your caregiver ${name} at ${phone}.`,
    contrastUpdated: "Display contrast updated for your comfort.",
    textSizeUpdated: "Text size adjusted.",
    fallback: (raw) => `I heard: "${raw}". Let me guide you to your Mind Games or Reminders.`
  },
  as: {
    headerTitle: "ভইচ সাথী",
    headerSub: "বয়োজ্যেষ্ঠ সকলৰ বাবে কণ্ঠ সংগী",
    listening: "🔴 আপোনাৰ কথা শুনি থকা হৈছে...",
    tapToSpeak: "কথা ক'বলৈ মাইক্ৰ'ফোনত টিপক",
    listeningPrompt: "আপোনাৰ কথা শুনি থকা হৈছে...",
    cantHear: "মই স্পষ্টকৈ শুনি নাপালোঁ। অনুগ্ৰহ কৰি তলৰ যিকোনো এটা বুটাম টিপক।",
    cantHearShort: "তলৰ বুটামত টিপক।",
    orTapCommand: "বা এটা ভইচ কমাণ্ড বাছক:",
    chipReminders: '"মোৰ সোঁৱৰণী পঢ়ক"',
    chipGame: '"মেমৰি মেচ আৰম্ভ কৰক"',
    chipProgress: '"মোৰ প্ৰগতি কিমান?"',
    chipCaregiver: '"পৰিয়ালক কল কৰক"',
    greeting: "নমস্কাৰ! মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ? কওক বা তলৰ বিকল্প বাচনী কৰক।",
    remindersPending: (count, title, time) => `আজি আপোনাৰ ${count} টা কাম বাকী আছে। পৰৱৰ্তীটো হ'ল ${time} বজাত ${title}।`,
    remindersCompleted: "আজিৰ সকলো কাম আৰু ঔষধ খোৱা সম্পূৰ্ণ হৈছে! বহুত ভাল কাম কৰিছে।",
    startMemoryMatch: "উত্তৰ-পূব ঐতিহ্য মেমৰি মেচ খেল আৰম্ভ কৰা হৈছে। ছবিবোৰ মিলাওক!",
    startSequence: "ছন্দ আৰু ক্ৰমিক সোঁৱৰণ খেল আৰম্ভ কৰা হৈছে। সুমধুৰ ছন্দ শুনক!",
    startObject: "উত্তৰ-পূব চিনাকী বস্তু আৰু সাধু সোঁৱৰণ খেল খোলা হৈছে। স্মৃতিবোৰ চাওঁ আহক!",
    progress: (stars, streak) => `আপুনি ${stars} টা তৰা লাভ কৰিছে আৰু ${streak} দিনীয়া ধাৰাবাহিকতাত আছে। চমৎকার!`,
    callCaregiver: (name, phone) => `আপোনাৰ যত্নলোৱা ${name} লৈ ${phone} নম্বৰত যোগাযোগ কৰা হৈছে।`,
    contrastUpdated: "আপোনাৰ সুবিধাৰ বাবে ডিস্প্লে কন্ট্রাস্ট সলনি কৰা হৈছে।",
    textSizeUpdated: "আখৰৰ আকাৰ সলনি কৰা হৈছে।",
    fallback: (raw) => `মই শুনিলোঁ: "${raw}"। আহক আপোনাক মগজুৰ খেল বা সোঁৱৰণীলৈ লৈ যাওঁ।`
  },
  bn: {
    headerTitle: "ভয়েস সাথী",
    headerSub: "প্রবীণদের জন্য কণ্ঠ সঙ্গী",
    listening: "🔴 আপনার কথা শোনা হচ্ছে...",
    tapToSpeak: "কথা বলতে মাইক্রোফোনে চাপুন",
    listeningPrompt: "আপনার কথা শোনা হচ্ছে...",
    cantHear: "স্পষ্ট শুনতে পাইনি। অনুগ্রহ করে নিচের যেকোনো একটি বোতাম চাপুন।",
    cantHearShort: "নিচের বোতাম চাপুন।",
    orTapCommand: "অথবা একটি ভয়েস কমান্ড বেছে নিন:",
    chipReminders: '"আমার রিমাইন্ডার পড়ুন"',
    chipGame: '"মেমরি ম্যাচ শুরু করুন"',
    chipProgress: '"আমার উন্নতি কতদূর?"',
    chipCaregiver: '"কেয়ারগিভারকে কল করুন"',
    greeting: "নমস্কার! আজ আপনাকে কীভাবে সাহায্য করতে পারি? কথা বলুন অথবা নিচের বোতাম চাপুন।",
    remindersPending: (count, title, time) => `আজ আপনার ${count}টি কাজ বাকি আছে। পরবর্তীটি হল ${time} টায় ${title}।`,
    remindersCompleted: "আজকের সমস্ত রুটিন এবং ওষুধ সম্পূর্ণ হয়েছে! চমৎকার কাজ।",
    startMemoryMatch: "নর্থ ইস্ট হেরিটেজ মেমরি ম্যাচ খেলা শুরু করা হচ্ছে। কার্ডগুলো মেলান!",
    startSequence: "রিদম এবং সিকোয়েন্স রিকল খেলা শুরু করা হচ্ছে। সুর শুনুন!",
    startObject: "নর্থ ইস্ট পরিচিত বস্তু এবং স্মৃতিকথা খেলা শুরু হচ্ছে। আসুন স্মৃতিগুলো দেখি!",
    progress: (stars, streak) => `আপনি ${stars}টি তারা অর্জন করেছেন এবং ${streak} দিনের স্ট্রিকে আছেন। দারুণ!`,
    callCaregiver: (name, phone) => `আপনার কেয়ারগিভার ${name}-এর সাথে ${phone} নম্বরে সংযোগ করা হচ্ছে।`,
    contrastUpdated: "আপনার সুবিধার জন্য ডিসপ্লে কনট্রাস্ট পরিবর্তন করা হয়েছে।",
    textSizeUpdated: "অক্ষরের আকার পরিবর্তিত হয়েছে।",
    fallback: (raw) => `আমি শুনলাম: "${raw}"। আসুন আপনাকে গেম বা রিমাইন্ডারে নিয়ে যাই।`
  },
  hi: {
    headerTitle: "वॉइस साथी",
    headerSub: "वरिष्ठ नागरिकों के लिए आवाज़ साथी",
    listening: "🔴 आपकी आवाज़ सुनी जा रही है...",
    tapToSpeak: "बोलने के लिए माइक्रोफ़ोन दबाएँ",
    listeningPrompt: "आपकी आवाज़ सुनी जा रही है...",
    cantHear: "मैं साफ़ नहीं सुन पाया। कृपया नीचे दिए गए बटनों में से किसी एक को छुएँ।",
    cantHearShort: "कृपया नीचे दिए बटन छुएँ।",
    orTapCommand: "या वॉइस कमांड चुनें:",
    chipReminders: '"मेरे रिमाइंडर पढ़ें"',
    chipGame: '"मेमोरी मैच शुरू करें"',
    chipProgress: '"मेरी प्रगति क्या है?"',
    chipCaregiver: '"केयरगिवर को कॉल करें"',
    greeting: "नमस्ते! मैं आज आपकी कैसे सहायता कर सकता हूँ? बोलिए या नीचे दिए गए विकल्पों को चुनिए।",
    remindersPending: (count, title, time) => `आज आपके ${count} रिमाइंडर बाकी हैं। अगला रिमाइंडर ${time} बजे ${title} का है।`,
    remindersCompleted: "आज की आपकी सभी दवाएं और काम पूरे हो चुके हैं! बहुत बढ़िया।",
    startMemoryMatch: "नॉर्थ ईस्ट हेरिटेज मेमोरी मैच खेल शुरू किया जा रहा है। आनंद लें!",
    startSequence: "रिदम और सीक्वेंस रिकॉल खेल शुरू किया जा रहा है। मधुर धुनें सुनें!",
    startObject: "नॉर्थ ईस्ट वस्तु और कहानी खेल खुल रहा है। आइए यादें ताज़ा करें!",
    progress: (stars, streak) => `आपने ${stars} सितारे अर्जित किए हैं और आप ${streak} दिन की स्ट्रीक पर हैं। बहुत बढ़िया!`,
    callCaregiver: (name, phone) => `आपके केयरगिवर ${name} से ${phone} पर संपर्क किया जा रहा है।`,
    contrastUpdated: "डिस्प्ले कंट्रास्ट आपकी सुविधा के अनुसार बदल दिया गया है।",
    textSizeUpdated: "अक्षर का आकार बदल दिया गया है।",
    fallback: (raw) => `मैंने सुना: "${raw}". आइए मैं आपको आपके खेल या रिमाइंडर पर ले चलता हूँ।`
  },
  mni: {
    headerTitle: "ভইচ সাথী",
    headerSub: "অহল ওজরশিংগী খোন্থোক তেংবাংবী",
    listening: "🔴 অদোমগী খোন্থোক তারি...",
    tapToSpeak: "ৱারী শাননবগীদমক মাইক্ৰোফোন নমবীয়ু",
    listeningPrompt: "অদোমগী খোন্থোক তারি...",
    cantHear: "ময়েক শেংনা তাদে। চানবীদুনা মখাগী বোতাম অমদা নম্বীয়ু।",
    cantHearShort: "মখাগী বোতাম অমদা নম্বীয়ু।",
    orTapCommand: "নত্রগা খোন্থোক্কী কমান্দ অমদা নম্বীয়ু:",
    chipReminders: '"নীংশিংবা পারি"',
    chipGame: '"মেমরি মেচ শানসি"',
    chipProgress: '"ঐগী থৌজাল চাউখৎপা"',
    chipCaregiver: '"কেয়ারগিভরদা ফোন তৌবীয়ু"',
    greeting: "খুরুমজরি! ঙসি ঐহাক্না করম্না তেংবাংগদগে? ৱারী শানবীয়ু নত্রগা মখাদা লৈবা ওক্সনশিং নমবীয়ু।",
    remindersPending: (count, title, time) => `ঙসি অদোমগী নীংশিংবা ${count} লৈরি। মথংগী অসি ${time} দা ${title} নি।`,
    remindersCompleted: "ঙসিগী থবক অমসুং হিদাক পুম্নমক লোইশিনখ্রে! য়াম্না ফরে।",
    startMemoryMatch: "নোর্থ ইস্ট হেরিতেজ মেমরি মেচ শানবা হৌরে। কার্দশিং অসিবু চান্নহনবীয়ু!",
    startSequence: "রিদম অমসুং সিক্বেন্স রিকল শানবা হৌরে। নুংঙাইরবা ঈশৈ তাবীয়ু!",
    startObject: "নোর্থ ইস্ট অচুম্বা পোৎলম অমসুং ৱারী নীংশিংবা শানবা হৌরে।",
    progress: (stars, streak) => `অদোম্না থৌজালগী ${stars} তারা ফংলে অমসুং নুমিৎ ${streak} নিগী লেপ্তনা শানরি।`,
    callCaregiver: (name, phone) => `অদোমগী ঙাকশেনবা ${name} দা ${phone} দা কন্নেক্ত তৌরি।`,
    contrastUpdated: "অদোমগী সুবিধারদমক দিস্তপ্লে কন্ট্রাস্ট শেমদোক্লে।",
    textSizeUpdated: "ময়োক্কী অচৌবা শেমদোক্লে।",
    fallback: (raw) => `ঐহাক্না তাখি: "${raw}"। অদোমগী শান্নপোৎ নত্রগা নীংশিংবদা চৎসি।`
  },
  lus: {
    headerTitle: "Voice Sathi",
    headerSub: "Upate Tana Aw Leh Tawng Puitu",
    listening: "🔴 I AW NGAITHLAK MEK A NI...",
    tapToSpeak: "TAWNG TURIN MICROPHONE HMET RAWH",
    listeningPrompt: "I aw ngaithlak mek a ni...",
    cantHear: "Ka hre chiang thei lo. Khawngaihin hnuai a button hi hmet rawh.",
    cantHearShort: "Hnuai a button hi hmet rawh.",
    orTapCommand: "Emaw Aw Thupe Hmet Rawh:",
    chipReminders: '"Ka hriattirna chhiar rawh"',
    chipGame: '"Memory Match khel tan rawh"',
    chipProgress: '"Ka hmasawnna en rawh"',
    chipCaregiver: '"Enkawltu be rawh"',
    greeting: "Chibai! Vawiin chu engtin nge ka puih theih ang che? Ṭawng la emaw hnuai lam hi hmet rawh.",
    remindersPending: (count, title, time) => `Vawiin atan hriattirna ${count} i la nei. A dawt leh chu ${time} a ${title} a ni.`,
    remindersCompleted: "Vawiin atan i thil tih tur zawng zawng i zo ta! A va tha em.",
    startMemoryMatch: "North East Heritage Memory Match infiamna tan a ni e. Hlim takin khel rawh!",
    startSequence: "Rhythm and Sequence Recall infiamna tan a ni e. Rimawi ngaihthlak nuam tak chu ngaithla rawh!",
    startObject: "North East Object and Story Recall infiamna hawn a ni e. I thil hriat than te i thlir ho ang u!",
    progress: (stars, streak) => `Arsi ${stars} i hlawhchhuak tawh a, ni ${streak} chhung i khel tluantling ta. A ropui e!`,
    callCaregiver: (name, phone) => `I enkawltu ${name} chu ${phone} ah biak pawh a ni.`,
    contrastUpdated: "I hmuh chian theih nan a rawng tihdanglam a ni e.",
    textSizeUpdated: "Hawrawp len zawng tihdanglam a ni e.",
    fallback: (raw) => `Ka hria e: "${raw}". Mind Games emaw Reminders lamah ka hruai ang che.`
  }
};

export default function VoiceAssistantModal() {
  const { isVoiceAssistantOpen, setIsVoiceAssistantOpen, navigateTo } = useApp();
  const { speakText, stopSpeaking, cycleTheme, cycleFontSize, language } = useAccessibility();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const currentI18n = VOICE_I18N[language] || VOICE_I18N.en;

  const [responseMessage, setResponseMessage] = useState(() => currentI18n.greeting);
  const [isSttSupported, setIsSttSupported] = useState(true);

  useEffect(() => {
    setIsSttSupported(speechService.isSTTAvailable());
    const dict = VOICE_I18N[language] || VOICE_I18N.en;
    setResponseMessage(dict.greeting);
  }, [language]);

  if (!isVoiceAssistantOpen) return null;

  const dict = VOICE_I18N[language] || VOICE_I18N.en;

  const processCommand = async (rawText) => {
    const text = rawText.toLowerCase().trim();
    setTranscript(rawText);

    // 1. Reminders
    if (
      text.includes('reminder') || text.includes('medicine') || text.includes('water') ||
      text.includes('today') || text.includes('schedule') || text.includes('have today') ||
      text.includes('হিদাক') || text.includes('নীংশিংবা') || text.includes('ঈশিং') ||
      text.includes('hriattirna') || text.includes('damdawi') || text.includes('tui') ||
      text.includes('দাওয়াই') || text.includes('ওষুধ') || text.includes('ঔষধ') || text.includes('সোঁৱৰণী') ||
      text.includes('दवा') || text.includes('दवाई') || text.includes('याद') || text.includes('पानी') ||
      text.includes('routine') || text.includes('কাজ') || text.includes('থবক')
    ) {
      const reminders = await api.getReminders();
      const pending = reminders.filter(r => !r.is_completed);
      const msg = pending.length > 0
        ? dict.remindersPending(pending.length, pending[0].title, pending[0].time)
        : dict.remindersCompleted;
      
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
      text.includes('infiamna') || text.includes('tihtak') || text.includes('খেলা') || text.includes('মেচ') ||
      text.includes('ম্যাচ') || text.includes('জোড়া')
    ) {
      const msg = dict.startMemoryMatch;
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
      text.includes('ঢোল') || text.includes('ঘণ্টা') || text.includes('পুং') || text.includes('buh') ||
      text.includes('তাল') || text.includes('ছন্দ') || text.includes('সুর') || text.includes('धुन')
    ) {
      const msg = dict.startSequence;
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
      text.includes('জাপি') || text.includes('শৰাই') || text.includes('থাগৎপা') || text.includes('thawnthu') ||
      text.includes('বস্তু') || text.includes('গল্প') || text.includes('সাধু') || text.includes('পোৎলম') ||
      text.includes('कहानी') || text.includes('चीज')
    ) {
      const msg = dict.startObject;
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
      text.includes('তৰা') || text.includes('তারা') || text.includes('सितारे') || text.includes('प्रगति') ||
      text.includes('উন্নতি') || text.includes('প্ৰগতি')
    ) {
      const profile = await api.getUserProfile();
      const msg = dict.progress(profile.total_stars, profile.current_streak);
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
      text.includes('enkawltu') || text.includes('chhungte') || text.includes('ডাক্তার') ||
      text.includes('পৰিয়াল') || text.includes('परिवार') || text.includes('फोन') || text.includes('ফোন')
    ) {
      const profile = await api.getUserProfile();
      const msg = dict.callCaregiver(profile.emergency_contact_name, profile.emergency_contact_phone);
      setResponseMessage(msg);
      speakText(msg);
      return;
    }

    // 7. Contrast
    if (text.includes('contrast') || text.includes('dark') || text.includes('color') || text.includes('रंग') || text.includes('ৰং') || text.includes('রং')) {
      cycleTheme();
      const msg = dict.contrastUpdated;
      setResponseMessage(msg);
      speakText(msg);
      return;
    }

    // 8. Font Size
    if (text.includes('text') || text.includes('font') || text.includes('bigger') || text.includes('large') || text.includes('बड़ा') || text.includes('ডাঙৰ') || text.includes('বড়')) {
      cycleFontSize();
      const msg = dict.textSizeUpdated;
      setResponseMessage(msg);
      speakText(msg);
      return;
    }

    // Default Fallback
    const fallbackMsg = dict.fallback(rawText);
    setResponseMessage(fallbackMsg);
    speakText(fallbackMsg);
  };

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      const dictNow = VOICE_I18N[language] || VOICE_I18N.en;
      setTranscript(dictNow.listeningPrompt);
      speechService.startListening({
        lang: language,
        onResult: (result) => {
          setIsListening(false);
          processCommand(result);
        },
        onError: (err) => {
          setIsListening(false);
          const currentDict = VOICE_I18N[language] || VOICE_I18N.en;
          setResponseMessage(currentDict.cantHear);
          speakText(currentDict.cantHearShort);
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
              {dict.headerTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {dict.headerSub}
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
              <Mic className="w-12 h-12" />
            </button>
          </div>

          <p className="text-sm font-bold uppercase tracking-wider text-teal-800 mb-1">
            {isListening ? dict.listening : dict.tapToSpeak}
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

        {/* Fallback Command Chips */}
        <div>
          <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>{dict.orTapCommand}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => processCommand("reminder")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-teal-50 border-2 border-teal-200 text-left font-bold text-teal-900 transition hover:border-teal-400 shadow-sm"
            >
              <Bell className="w-6 h-6 text-teal-600 shrink-0" />
              <span className="text-base">{dict.chipReminders}</span>
            </button>

            <button
              onClick={() => processCommand("match")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-200 text-left font-bold text-amber-950 transition hover:border-amber-400 shadow-sm"
            >
              <Play className="w-6 h-6 text-amber-500 shrink-0" />
              <span className="text-base">{dict.chipGame}</span>
            </button>

            <button
              onClick={() => processCommand("progress")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-purple-50 border-2 border-purple-200 text-left font-bold text-purple-950 transition hover:border-purple-400 shadow-sm"
            >
              <Award className="w-6 h-6 text-purple-600 shrink-0" />
              <span className="text-base">{dict.chipProgress}</span>
            </button>

            <button
              onClick={() => processCommand("caregiver")}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-rose-50 border-2 border-rose-200 text-left font-bold text-rose-950 transition hover:border-rose-400 shadow-sm"
            >
              <PhoneCall className="w-6 h-6 text-rose-600 shrink-0" />
              <span className="text-base">{dict.chipCaregiver}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
