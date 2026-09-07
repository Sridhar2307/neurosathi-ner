/**
 * Cultural Dataset for North Eastern Region (NER)
 * Smart India Hackathon 2026 - SIH26003
 */

export const REGIONAL_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', greeting: 'Good Day!' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', greeting: 'নমস্কাৰ (Namaskar)' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', greeting: 'নমস্কার (Nomoshkar)' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', greeting: 'नमस्ते (Namaste)' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', greeting: 'খুরুমজরি (Khurumjari)' },
  { code: 'lus', name: 'Mizo', native: 'Mizo ṭawng', greeting: 'Chibai!' },
];

export const NER_MEMORY_TILES = [
  {
    id: 'rhino',
    name: 'Kaziranga Rhino',
    state: 'Assam',
    icon: '🦏',
    desc: 'The majestic one-horned rhinoceros of Kaziranga National Park.',
    voiceText: 'Kaziranga one-horned Rhino from Assam.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'tea',
    name: 'Assam Tea Leaf',
    state: 'Assam',
    icon: '🍵',
    desc: 'World famous fragrant golden Assam orthodox tea leaves.',
    voiceText: 'Fresh Assam golden tea leaves.',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'hornbill',
    name: 'Great Hornbill',
    state: 'Nagaland / Arunachal',
    icon: '🦅',
    desc: 'The iconic bird celebrated in the great Hornbill Festival of Kohima.',
    voiceText: 'Great Indian Hornbill bird of Nagaland.',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  {
    id: 'dhol',
    name: 'Bihu Dhol',
    state: 'Assam',
    icon: '🥁',
    desc: 'Traditional folk drum played during the vibrant Rongali Bihu festival.',
    voiceText: 'Rongali Bihu rhythm drum.',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  {
    id: 'cheraw',
    name: 'Cheraw Bamboo',
    state: 'Mizoram',
    icon: '🎋',
    desc: 'Rhythmic bamboo dance of Mizoram performed during Chapchar Kut.',
    voiceText: 'Cheraw bamboo dance of Mizoram.',
    color: 'bg-lime-100 text-lime-800 border-lime-300'
  },
  {
    id: 'loktak',
    name: 'Loktak Phumdi',
    state: 'Manipur',
    icon: '🏝️',
    desc: 'The floating islands of Loktak Lake and Sangai deer sanctuary.',
    voiceText: 'Floating Loktak lake island of Manipur.',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    id: 'japi',
    name: 'Assamese Japi',
    state: 'Assam',
    icon: '👒',
    desc: 'Traditional conical headgear woven with Tokow leaves and bamboo.',
    voiceText: 'Traditional Assamese woven Japi hat.',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  {
    id: 'gamusa',
    name: 'Phulam Gamusa',
    state: 'Assam',
    icon: '🧣',
    desc: 'Sacred handwoven white and red cotton towel honoring guests and elders.',
    voiceText: 'Phulam Gamusa symbol of respect and honor.',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    id: 'pung',
    name: 'Manipuri Pung',
    state: 'Manipur',
    icon: '🪘',
    desc: 'Soulful clay drum played in classical Manipuri Sankirtana dance.',
    voiceText: 'Manipuri classical Pung drum.',
    color: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    id: 'mask',
    name: 'Majuli Clay Mask',
    state: 'Assam',
    icon: '🎭',
    desc: 'Mukha craft from the river island of Majuli representing epic heroes.',
    voiceText: 'Traditional Majuli island clay mask.',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }
];

export const NER_SEQUENCE_ITEMS = [
  { id: 'bell_temple', name: 'Kamakhya Temple Bell', soundNote: 440, color: 'bg-amber-500', icon: '🔔', label: 'Golden Bell' },
  { id: 'bihu_drum', name: 'Bihu Dhol Beat', soundNote: 330, color: 'bg-red-500', icon: '🥁', label: 'Bihu Drum' },
  { id: 'bamboo_flute', name: 'Bamboo Flute', soundNote: 550, color: 'bg-emerald-500', icon: '🎋', label: 'Hill Flute' },
  { id: 'gong_monastery', name: 'Tawang Monastery Gong', soundNote: 220, color: 'bg-indigo-500', icon: '🪘', label: 'Monk Gong' },
];

export const NER_OBJECT_RECOGNITION_STORIES = [
  {
    id: 'obj-1',
    title: 'Warm Morning Hospitality',
    promptQuestion: 'What traditional North East item is used to serve betel nut, pan, and welcome respected elders home?',
    imageEmoji: '✨👑🍽️',
    correctAnswer: 'Xorai (বঁটা / শৰাই)',
    options: [
      'Xorai (বঁটা / শৰাই)',
      'Plastic Plate',
      'Modern Mug',
      'Glass Bowl'
    ],
    hint: 'It is a brass or bell-metal offering tray on a raised pedestal, often covered with a red Gamusa.',
    culturalFact: 'In Assamese culture, a Xorai is a sacred symbol of reverence presented during Bihu and prayer ceremonies.',
    state: 'Assam'
  },
  {
    id: 'obj-2',
    title: 'Spring Festival Melody',
    promptQuestion: 'Which traditional wind instrument made from buffalo horn is played during the Rongali Bihu celebrations?',
    imageEmoji: '🎺🐃🌿',
    correctAnswer: 'Pepa (পেঁপা)',
    options: [
      'Modern Trumpet',
      'Pepa (পেঁপা)',
      'Acoustic Guitar',
      'Steel Whistle'
    ],
    hint: 'It is crafted from the horn of a domestic water buffalo and a small bamboo reed.',
    culturalFact: 'The Pepa has a high-pitched, festive tone that calls villagers together for spring dancing.',
    state: 'Assam'
  },
  {
    id: 'obj-3',
    title: 'Living Root Wonders',
    promptQuestion: 'In Meghalaya (Cherrapunji & Mawlynnong), what living natural structures were shaped across rivers by the Khasi people?',
    imageEmoji: '🌳🌉🌊',
    correctAnswer: 'Living Root Bridges (Jingkieng Jri)',
    options: [
      'Concrete Flyovers',
      'Living Root Bridges (Jingkieng Jri)',
      'Iron Ropeway',
      'Wooden Plank Bridge'
    ],
    hint: 'They are grown using the aerial roots of the Ficus elastica (Indian rubber tree) over decades.',
    culturalFact: 'These bridges grow stronger over time and can withstand heavy monsoons for centuries.',
    state: 'Meghalaya'
  },
  {
    id: 'obj-4',
    title: 'Harvest & Sunshine Headgear',
    promptQuestion: 'What conical woven hat protects farmers and tea garden workers from monsoon rains and bright sunshine?',
    imageEmoji: '👒🍃☀️',
    correctAnswer: 'Japi (জাপি)',
    options: [
      'Japi (জাপি)',
      'Woolen Beanie',
      'Baseball Cap',
      'Helmets'
    ],
    hint: 'Made from tight bamboo cane weave and palm leaves, decorated with red, black, and white felt.',
    culturalFact: 'The Japi is an indelible emblem of Assamese folk dignity and rural farming resilience.',
    state: 'Assam'
  },
  {
    id: 'obj-5',
    title: 'Floating Island Wildlife',
    promptQuestion: 'Which rare dancing deer is protected on the floating phumdis of Keibul Lamjao National Park in Manipur?',
    imageEmoji: '🦌🏝️🌺',
    correctAnswer: 'Sangai Deer (Dancing Deer)',
    options: [
      'Reindeer',
      'Sangai Deer (Dancing Deer)',
      'Spotted Leopard',
      'Desert Camel'
    ],
    hint: 'Known for its delicate, springy gait as it walks across soft floating biomass vegetation on Loktak Lake.',
    culturalFact: 'The Sangai is the proud state animal of Manipur, cherished in Meitei folklore.',
    state: 'Manipur'
  }
];

export const CULTURAL_TRANSLATIONS = {
  en: {
    welcome: "Good Day, Bhaben!",
    welcomeSubtitle: "Here is your gentle cognitive routine for today. Let's keep your mind active and happy!",
    startGames: "Play Mind Games",
    viewReminders: "My Daily Reminders",
    voiceAssistant: "Speak to Voice Sathi",
    progress: "My Stars & Progress",
    caregiverContact: "Call Caregiver / Doctor",
    streak: "Day Streak",
    stars: "Stars Earned",
    quickAudio: "Tap to Listen",
    tapToFlip: "Tap cards to find pairs",
    home: "Home",
    mindGames: "Mind Games",
    reminders: "Reminders",
    memorySupport: "Memory Support",
  },
  as: {
    welcome: "নমস্কাৰ, ভবেন দেউতা!",
    welcomeSubtitle: "আজি আপোনাৰ দিনটোৰ স্মৃতি আৰু মনৰ যত্নৰ সূচী। আহক মনটো সতেজ ৰাখোঁ!",
    startGames: "মগজুৰ খেল খেলক",
    viewReminders: "মোৰ দৈনিক সোঁৱৰণী",
    voiceAssistant: "ভইচ সাথীৰ সৈতে কথা পাতক",
    progress: "মোৰ তৰা আৰু প্ৰগতি",
    caregiverContact: "পৰিয়াল / ডাক্তৰক মাতক",
    streak: "দিনৰ ধাৰা",
    stars: "অৰ্জন কৰা তৰা",
    quickAudio: "শুনিবলৈ টিপক",
    tapToFlip: "জোৰা বিচাৰিবলৈ কাৰ্ডত টিপক",
    home: "গৃহ",
    mindGames: "মগজুৰ খেল",
    reminders: "সোঁৱৰণী",
    memorySupport: "স্মৃতি সহায়",
  },
  bn: {
    welcome: "নমস্কার, ভবেন বাবু!",
    welcomeSubtitle: "আজকের আপনার যত্ন ও স্মৃতি অনুশীলনের তালিকা। মন সুস্থ ও প্রফুল্ল রাখুন!",
    startGames: "মস্তিষ্কের খেলা খেলুন",
    viewReminders: "দৈনিক রিমাইন্ডার",
    voiceAssistant: "ভয়েস সাথীর সাথে কথা বলুন",
    progress: "আমার তারা ও উন্নতি",
    caregiverContact: "সেবিকা / ডাক্তারকে কল করুন",
    streak: "দিনের ধারা",
    stars: "প্রাপ্ত তারা",
    quickAudio: "শুনতে চাপুন",
    tapToFlip: "জোড়া মেলাতে কার্ডে চাপুন",
    home: "মূল পাতা",
    mindGames: "মাথার খেলা",
    reminders: "রিমাইন্ডার",
    memorySupport: "স্মৃতি সহায়তা",
  },
  hi: {
    welcome: "नमस्ते, भवेन जी!",
    welcomeSubtitle: "आज के आपके मानसिक व्यायाम और दिनचर्या। आइए मन को सक्रिय और प्रसन्न रखें!",
    startGames: "दिमागी खेल खेलें",
    viewReminders: "मेरी दिनचर्या व दवाइयां",
    voiceAssistant: "वॉइस साथी से बात करें",
    progress: "मेरी प्रगति और सितारे",
    caregiverContact: "केयरगिवर / डॉक्टर को कॉल करें",
    streak: "दिनों का सिलसिला",
    stars: "अर्जित सितारे",
    quickAudio: "सुनने के लिए टैप करें",
    tapToFlip: "जोड़े खोजने के लिए कार्ड पर टैप करें",
    home: "होम",
    mindGames: "दिमागी खेल",
    reminders: "दिनचर्या",
    memorySupport: "स्मृति सहायता",
  },
  mni: {
    welcome: "খুরুমজরি, ভবেন ইবুংঙো!",
    welcomeSubtitle: "ঙসিগীদমক নহাক্কী ৱাখল অমসুং নীংশিংবা ফগৎহন্নবা থৌরমনি। ৱাখলবু নুংঙাইহনসি!",
    startGames: "ৱাখলগী খেল শানবীয়ু",
    viewReminders: "ঐহাক্কী নোংমগী নীংশিংবা",
    voiceAssistant: "ভইচ সাথীগা ৱারী শানবীয়ু",
    progress: "ঐহাক্কী থৌজাল অমসুং চাউখৎপা",
    caregiverContact: "কেয়ারগিভর / ডাক্তর কৌবীয়ু",
    streak: "নোংমগী পরিং",
    stars: "ফংলবা থৌজাল",
    quickAudio: "তাবেনবগীদমক নমবীয়ু",
    tapToFlip: "কার্দ অমমম নমদুনা যোর পুথোকপীয়ু",
    home: "য়ুম",
    mindGames: "ৱাখলগী খেল",
    reminders: "নীংশিংবা",
    memorySupport: "নীংশিংবা তেংবাং",
  },
  lus: {
    welcome: "Chibai, Pu Bhaben!",
    welcomeSubtitle: "Vawiin atan i rilru tihchakna leh hriatna vawn ṭhatna tur ruahmanna te chu le.",
    startGames: "Rilru Tihhmasawnna Games",
    viewReminders: "Ka Ni Tin Hriattirna",
    voiceAssistant: "Aw Thian (Voice Sathi) Be Rawh",
    progress: "Ka Hmasawnna leh Arsi",
    caregiverContact: "Enkawltu / Doctor Be Rawh",
    streak: "Ni Tin Zawn Zât",
    stars: "Arsi Hmuh Zât",
    quickAudio: "Ngaithla tura Hmet Rawh",
    tapToFlip: "Thlalak inkawp zawng tura hmet rawh",
    home: "Inpuina",
    mindGames: "Rilru Games",
    reminders: "Hriattirna",
    memorySupport: "Hriatna Tihchakna",
  }
};
