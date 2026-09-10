/**
 * NeuroSathi NER - API Service & Offline-First Sync Layer
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const DEMO_USER_ID = "demo-user-123";

// Per-patient storage key helpers
function patientKey(baseKey, userId) {
  return `${baseKey}_${userId}`;
}

// Initial fallback state stored in localStorage if backend is unreachable
const STORAGE_KEYS = {
  REMINDERS: 'neurosathi_reminders',
  GAME_RESULTS: 'neurosathi_game_results',
  ALERTS: 'neurosathi_alerts',
  PROFILE: 'neurosathi_profile',
  OFFLINE_QUEUE: 'neurosathi_sync_queue',
  CAREGIVER_SESSION: 'ns_caregiver_session',
  PATIENTS: 'ns_all_patients',
  GAME_DIFFICULTY: 'neurosathi_game_difficulty',
};

const DEFAULT_PROFILE = {
  id: DEMO_USER_ID,
  name: "Bhaben Kalita",
  email: "bhaben.kalita@neurosathi.in",
  role: "elder",
  age: 74,
  location: "Guwahati, Assam",
  language_preference: "en",
  emergency_contact_name: "Priya Sharma (Daughter)",
  emergency_contact_phone: "+91 98765 43210",
  current_streak: 4,
  total_stars: 56,
  avatar_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
};

const DEFAULT_REMINDERS = [
  {
    id: "rem-1",
    user_id: DEMO_USER_ID,
    title: "Blood Pressure Tablet (Amlodipine)",
    category: "medicine",
    time: "08:30 AM",
    dosage_or_detail: "1 tablet after morning tea with water",
    audio_prompt: "Please take your Blood Pressure tablet with water.",
    is_completed: true,
    completed_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    icon_name: "Pill",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "rem-2",
    user_id: DEMO_USER_ID,
    title: "Drink Fresh Water",
    category: "water",
    time: "11:00 AM",
    dosage_or_detail: "1 full copper glass of filtered water",
    audio_prompt: "Time to drink a warm glass of water to stay hydrated.",
    is_completed: true,
    completed_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    icon_name: "Droplet",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "rem-3",
    user_id: DEMO_USER_ID,
    title: "Afternoon Memory Game Session",
    category: "daily_task",
    time: "03:30 PM",
    dosage_or_detail: "Play 1 session of North East Heritage Match",
    audio_prompt: "Let's exercise your mind with the Heritage Memory Game.",
    is_completed: false,
    icon_name: "Brain",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "rem-4",
    user_id: DEMO_USER_ID,
    title: "Evening Walk in Courtyard",
    category: "daily_task",
    time: "05:30 PM",
    dosage_or_detail: "15 minutes gentle stroll in the courtyard",
    audio_prompt: "Time for your gentle evening courtyard walk.",
    is_completed: false,
    icon_name: "Footprints",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "rem-5",
    user_id: DEMO_USER_ID,
    title: "Night Heart Medication & Milk",
    category: "medicine",
    time: "09:00 PM",
    dosage_or_detail: "1 tablet with warm milk before sleep",
    audio_prompt: "Take your bedtime medicine with warm milk.",
    is_completed: false,
    icon_name: "Moon",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const DEFAULT_GAME_RESULTS = [
  {
    id: "gr-1",
    user_id: DEMO_USER_ID,
    game_type: "memory_match",
    difficulty: "easy",
    score: 95,
    max_score: 100,
    attempts: 1,
    duration_seconds: 34,
    mistakes: 1,
    cultural_theme: "NER Heritage Icons",
    completed: true,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    encouraging_message: "Shandar! Wonderful memory recall today!",
    adaptive_next_difficulty: "medium"
  },
  {
    id: "gr-2",
    user_id: DEMO_USER_ID,
    game_type: "sequence_recall",
    difficulty: "easy",
    score: 88,
    max_score: 100,
    attempts: 2,
    duration_seconds: 42,
    mistakes: 2,
    cultural_theme: "Bihu Rhythms & Folk Bells",
    completed: true,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    encouraging_message: "Great rhythm recognition! You're keeping your focus sharp.",
    adaptive_next_difficulty: "medium"
  },
  {
    id: "gr-3",
    user_id: DEMO_USER_ID,
    game_type: "object_recognition",
    difficulty: "easy",
    score: 92,
    max_score: 100,
    attempts: 1,
    duration_seconds: 28,
    mistakes: 1,
    cultural_theme: "Daily North East Utensils & Objects",
    completed: true,
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    encouraging_message: "Outstanding! You recognized the Japi and Xorai effortlessly!",
    adaptive_next_difficulty: "medium"
  }
];

const DEFAULT_ALERTS = [
  {
    id: "alt-1",
    user_id: DEMO_USER_ID,
    alert_type: "milestone",
    severity: "info",
    message: "Bhaben completed 4 consecutive days of cognitive exercises! Streak active.",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    is_resolved: true
  },
  {
    id: "alt-2",
    user_id: DEMO_USER_ID,
    alert_type: "cognitive_drop",
    severity: "warning",
    message: "Sequence Recall response time increased slightly yesterday. Recommend gentle music rhythm exercise.",
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    is_resolved: false
  }
];

// Helper: Local Storage Sync
function getLocal(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

// Difficulty persistence per game per user
function difficultyKey(userId, gameType) {
  return `${STORAGE_KEYS.GAME_DIFFICULTY}_${userId}_${gameType}`;
}

function getSavedDifficulty(userId, gameType) {
  return getLocal(difficultyKey(userId, gameType), 'easy');
}

function saveDifficulty(userId, gameType, difficulty) {
  setLocal(difficultyKey(userId, gameType), difficulty);
}

// Initialise storage with defaults if empty
if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) setLocal(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
if (!localStorage.getItem(STORAGE_KEYS.GAME_RESULTS)) setLocal(STORAGE_KEYS.GAME_RESULTS, DEFAULT_GAME_RESULTS);
if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) setLocal(STORAGE_KEYS.ALERTS, DEFAULT_ALERTS);
if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) setLocal(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);

export const api = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return { online: true, data: await res.json() };
    } catch (e) {}
    return { online: false, data: { status: 'offline-mode', message: 'Running on local offline store' } };
  },

  // Reminders — per-patient namespaced
  async getReminders(userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.REMINDERS, userId);
    // Seed defaults only for demo patient
    if (userId === DEMO_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, DEFAULT_REMINDERS);
    }
    try {
      const res = await fetch(`${API_BASE}/reminders/${userId}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        setLocal(key, data);
        return data;
      }
    } catch (e) {}
    return getLocal(key, userId === DEMO_USER_ID ? DEFAULT_REMINDERS : []);
  },

  async createReminder(reminderData) {
    const uid = reminderData.user_id || DEMO_USER_ID;
    const key = patientKey(STORAGE_KEYS.REMINDERS, uid);
    const localReminders = getLocal(key, []);
    
    // Handle recurring reminders
    const isRecurring = reminderData.recurrence && reminderData.recurrence !== 'none';
    const baseReminder = {
      ...reminderData,
      id: `rem-${Date.now().toString(36)}`,
      user_id: uid,
      is_completed: false,
      created_at: new Date().toISOString(),
      recurrence: reminderData.recurrence || 'none',
      recurrence_days: reminderData.recurrence_days || [],
      original_time: reminderData.time,
      snoozed_until: null,
      taken_later: false
    };
    
    localReminders.push(baseReminder);
    
    // If recurring, create future instances
    if (isRecurring) {
      const futureReminders = generateRecurringReminders(baseReminder);
      localReminders.push(...futureReminders);
    }
    
    setLocal(key, localReminders);

    try {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return baseReminder;
  },

  // Generate recurring reminder instances for the next 30 days
  generateRecurringReminders: (baseReminder) => {
    const reminders = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Generate 30 days ahead
    
    const baseTime = baseReminder.time; // e.g., "08:30 AM"
    const recurrence = baseReminder.recurrence;
    const recurrenceDays = baseReminder.recurrence_days; // [0,1,2,3,4,5,6] for Sun-Sat
    
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
    
    while (currentDate <= endDate) {
      let shouldCreate = false;
      
      if (recurrence === 'daily') {
        shouldCreate = true;
      } else if (recurrence === 'weekly' && recurrenceDays.includes(currentDate.getDay())) {
        shouldCreate = true;
      } else if (recurrence === 'weekdays' && currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
        shouldCreate = true;
      } else if (recurrence === 'weekends' && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        shouldCreate = true;
      }
      
      if (shouldCreate) {
        reminders.push({
          ...baseReminder,
          id: `rem-${Date.now().toString(36)}-${currentDate.getTime()}`,
          time: baseTime,
          date: currentDate.toISOString().split('T')[0],
          is_recurring_instance: true,
          parent_id: baseReminder.id
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return reminders;
  },

  async updateReminder(id, updates, userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.REMINDERS, userId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      localReminders[index] = { ...localReminders[index], ...updates };
      if (updates.is_completed) {
        localReminders[index].completed_at = new Date().toISOString();
        const profileKey = patientKey(STORAGE_KEYS.PROFILE, userId);
        const profile = getLocal(profileKey, DEFAULT_PROFILE);
        profile.total_stars = (profile.total_stars || 0) + 2;
        setLocal(profileKey, profile);
        
        // If this is a recurring instance, create the next occurrence
        if (localReminders[index].is_recurring_instance && localReminders[index].parent_id) {
          const parentReminder = localReminders.find(r => r.id === localReminders[index].parent_id);
          if (parentReminder) {
            const nextInstance = createNextRecurringInstance(parentReminder, localReminders[index]);
            if (nextInstance) {
              localReminders.push(nextInstance);
            }
          }
        }
      }
      setLocal(key, localReminders);
    }

    try {
      const res = await fetch(`${API_BASE}/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return localReminders[index];
  },

  // Snooze reminder - remind again after specified minutes
  async snoozeReminder(id, minutes, userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.REMINDERS, userId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      const reminder = localReminders[index];
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
      
      // Create a snoozed copy
      const snoozedReminder = {
        ...reminder,
        id: `rem-${Date.now().toString(36)}-snooze`,
        time: snoozeTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        snoozed_until: snoozeTime.toISOString(),
        original_id: reminder.id,
        is_snoozed: true
      };
      
      localReminders.push(snoozedReminder);
      // Mark original as snoozed
      localReminders[index] = { ...reminder, snoozed_until: snoozeTime.toISOString() };
      setLocal(key, localReminders);
      
      return snoozedReminder;
    }
    return null;
  },

  // Mark as "take later" - moves to end of day
  async takeLaterReminder(id, userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.REMINDERS, userId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      const reminder = localReminders[index];
      const laterTime = new Date();
      laterTime.setHours(20, 0, 0, 0); // 8 PM
      
      const laterReminder = {
        ...reminder,
        id: `rem-${Date.now().toString(36)}-later`,
        time: laterTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        taken_later: true,
        original_id: reminder.id,
        is_take_later: true
      };
      
      localReminders.push(laterReminder);
      localReminders[index] = { ...reminder, taken_later: true };
      setLocal(key, localReminders);
      
      return laterReminder;
    }
    return null;
  },

  // Create next recurring instance after completion
  createNextRecurringInstance: (parentReminder, completedInstance) => {
    const completedDate = new Date(completedInstance.date || Date.now());
    let nextDate = new Date(completedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    // Find next valid date based on recurrence pattern
    while (nextDate <= endDate) {
      let shouldCreate = false;
      
      if (parentReminder.recurrence === 'daily') {
        shouldCreate = true;
      } else if (parentReminder.recurrence === 'weekly' && parentReminder.recurrence_days.includes(nextDate.getDay())) {
        shouldCreate = true;
      } else if (parentReminder.recurrence === 'weekdays' && nextDate.getDay() >= 1 && nextDate.getDay() <= 5) {
        shouldCreate = true;
      } else if (parentReminder.recurrence === 'weekends' && (nextDate.getDay() === 0 || nextDate.getDay() === 6)) {
        shouldCreate = true;
      }
      
      if (shouldCreate) {
        return {
          ...parentReminder,
          id: `rem-${Date.now().toString(36)}-${nextDate.getTime()}`,
          time: parentReminder.original_time || parentReminder.time,
          date: nextDate.toISOString().split('T')[0],
          is_recurring_instance: true,
          parent_id: parentReminder.id,
          is_completed: false,
          completed_at: null
        };
      }
      
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return null;
  },

  async deleteReminder(id, userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.REMINDERS, userId);
    const localReminders = getLocal(key, []);
    const filtered = localReminders.filter(r => r.id !== id);
    setLocal(key, filtered);

    try {
      await fetch(`${API_BASE}/reminders/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(2500)
      });
    } catch (e) {}
    return { success: true, id };
  },

  // Games
  async recordGameResult(resultData) {
    const localResults = getLocal(STORAGE_KEYS.GAME_RESULTS, DEFAULT_GAME_RESULTS);
    const userId = resultData.user_id || DEMO_USER_ID;
    const gameType = resultData.game_type;
    
    // Get saved difficulty for this game type
    const savedDifficulty = getSavedDifficulty(userId, gameType);
    
    // Calculate adaptive difficulty heuristic locally - start from saved difficulty
    let nextDiff = resultData.difficulty || savedDifficulty || 'easy';
    if (resultData.score >= 85 && (resultData.mistakes || 0) <= 2) {
      nextDiff = nextDiff === 'easy' ? 'medium' : 'hard';
    } else if (resultData.score < 60) {
      nextDiff = nextDiff === 'hard' ? 'medium' : 'easy';
    }

    // Save the new difficulty for next time
    saveDifficulty(userId, gameType, nextDiff);

    const encouragement = resultData.score >= 90
      ? "Shandar! Exceptional memory recall and focus! You did brilliantly."
      : (resultData.score >= 75 ? "Wonderful effort! Your mind is active and agile." : "Great participation! Keep smiling.");

    const newResult = {
      ...resultData,
      id: `gr-${Date.now().toString(36)}`,
      user_id: userId,
      timestamp: new Date().toISOString(),
      encouraging_message: encouragement,
      adaptive_next_difficulty: nextDiff
    };

    localResults.unshift(newResult);
    setLocal(STORAGE_KEYS.GAME_RESULTS, localResults);

    // Update stars
    const profile = getLocal(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    profile.total_stars = (profile.total_stars || 0) + (resultData.score >= 80 ? 5 : 3);
    setLocal(STORAGE_KEYS.PROFILE, profile);

    try {
      const res = await fetch(`${API_BASE}/games/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return newResult;
  },

  // Get saved difficulty for a game type
  async getSavedDifficulty(userId = DEMO_USER_ID, gameType) {
    return getSavedDifficulty(userId, gameType);
  },

  async getGameResults(userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.GAME_RESULTS, userId);
    if (userId === DEMO_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, DEFAULT_GAME_RESULTS);
    }
    try {
      const res = await fetch(`${API_BASE}/games/results/${userId}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        setLocal(key, data);
        return data;
      }
    } catch (e) {}
    return getLocal(key, userId === DEMO_USER_ID ? DEFAULT_GAME_RESULTS : []);
  },

  // Caregiver Summary & AI
  async getCaregiverDashboard(userId = DEMO_USER_ID) {
    try {
      const res = await fetch(`${API_BASE}/caregiver/dashboard/${userId}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const profile = getLocal(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    const reminders = getLocal(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
    const games = getLocal(STORAGE_KEYS.GAME_RESULTS, DEFAULT_GAME_RESULTS);
    const alerts = getLocal(STORAGE_KEYS.ALERTS, DEFAULT_ALERTS);

    const completed = reminders.filter(r => r.is_completed).length;
    const adherence = Math.round((completed / Math.max(reminders.length, 1)) * 100);
    const avgScore = games.length > 0 ? Math.round(games.reduce((acc, g) => acc + g.score, 0) / games.length) : 85;

    return {
      patient_profile: profile,
      today_activity_count: reminders.length + games.length,
      adherence_percentage: adherence,
      average_cognitive_score: avgScore,
      cognitive_trend: avgScore >= 88 ? "Improving" : (avgScore >= 70 ? "Stable" : "Needs Attention"),
      recent_game_scores: games.slice(0, 5),
      today_reminders: reminders,
      missed_reminders_count: reminders.filter(r => !r.is_completed).length,
      active_alerts: alerts,
      recent_activity_timeline: [
        { id: "log-1", action: "Completed Morning BP Medicine", category: "health", timestamp: "08:32 AM", status: "completed" },
        { id: "log-2", action: "Played Heritage Memory Match (Easy) - 95%", category: "game", timestamp: "10:15 AM", status: "completed" },
        { id: "log-3", action: "Drank Fresh Copper Glass Water", category: "hydration", timestamp: "11:02 AM", status: "completed" },
        { id: "log-4", action: "Voice Query: 'Read my daily reminders'", category: "voice", timestamp: "01:20 PM", status: "completed" },
      ],
      score_history_by_game: {
        "Memory Match": [92, 95, 90, 96, 94],
        "Sequence Recall": [80, 85, 88, 84, 89],
        "Object Recognition": [90, 94, 92, 98, 95]
      }
    };
  },

  // Caregiver Auth
  async caregiverLogin(contact, pin) {
    try {
      const res = await fetch(`${API_BASE}/auth/caregiver-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, pin }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        // Store all patients locally
        if (data.all_patients) setLocal(STORAGE_KEYS.PATIENTS, data.all_patients);
        return data;
      }
    } catch (e) {}

    // Offline fallback: check PIN against stored patients
    const allPatients = getLocal(STORAGE_KEYS.PATIENTS, [DEFAULT_PROFILE]);
    const demoProfile = getLocal(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    const patients = allPatients.length ? allPatients : [demoProfile];
    const activePatient = patients[0];

    const validPins = ['1234', activePatient.caregiver_pin].filter(Boolean);
    const validContacts = [
      'demo', 'demo@care.in', '9876543210',
      activePatient.emergency_contact_phone,
      activePatient.emergency_contact_email
    ].filter(Boolean);

    const pinOk = validPins.includes(pin) || pin === activePatient.caregiver_pin;
    const contactOk = validContacts.some(c => c && c.replace(/\s/g,'') === contact.replace(/\s/g,''));

    if (!pinOk && !contactOk && contact !== 'demo') {
      return { success: false, message: 'Invalid credentials. Try contact: demo@care.in, PIN: 1234' };
    }

    return {
      success: true,
      message: 'Caregiver session authenticated (offline mode).',
      caregiver: {
        name: activePatient.emergency_contact_name || 'Primary Caregiver',
        relation: activePatient.emergency_contact_relation || 'Family',
        phone: activePatient.emergency_contact_phone || contact,
        email: activePatient.emergency_contact_email || null,
        contact
      },
      active_patient: activePatient,
      all_patients: patients
    };
  },

  // Get all patients
  async getAllPatients() {
    try {
      const res = await fetch(`${API_BASE}/users`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.PATIENTS, data);
        return data;
      }
    } catch (e) {}
    return getLocal(STORAGE_KEYS.PATIENTS, [DEFAULT_PROFILE]);
  },

  // Register new patient
  async registerPatient(patientData) {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const newPatient = await res.json();
        const patients = getLocal(STORAGE_KEYS.PATIENTS, [DEFAULT_PROFILE]);
        patients.push(newPatient);
        setLocal(STORAGE_KEYS.PATIENTS, patients);
        return { success: true, patient: newPatient };
      }
    } catch (e) {}

    // Offline: create locally
    const newPatient = {
      ...patientData,
      id: `patient-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      current_streak: 1,
      total_stars: 10,
      role: 'elder'
    };
    const patients = getLocal(STORAGE_KEYS.PATIENTS, []);
    patients.push(newPatient);
    setLocal(STORAGE_KEYS.PATIENTS, patients);
    setLocal(patientKey(STORAGE_KEYS.PROFILE, newPatient.id), newPatient);
    return { success: true, patient: newPatient };
  },

  // Update patient details
  async updatePatient(userId, updates) {
    const profileKey = patientKey(STORAGE_KEYS.PROFILE, userId);
    const current = getLocal(profileKey, DEFAULT_PROFILE);
    const updated = { ...current, ...updates };
    setLocal(profileKey, updated);

    // Also update in patients list
    const patients = getLocal(STORAGE_KEYS.PATIENTS, []);
    const idx = patients.findIndex(p => p.id === userId);
    if (idx !== -1) { patients[idx] = updated; setLocal(STORAGE_KEYS.PATIENTS, patients); }

    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return updated;
  },

  // Get user profile — per-patient namespaced
  async getUserProfile(userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.PROFILE, userId);
    if (userId === DEMO_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, DEFAULT_PROFILE);
    }
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        setLocal(key, data);
        return data;
      }
    } catch (e) {}
    return getLocal(key, DEFAULT_PROFILE);
  },

  async getAIRecommendation(userId = DEMO_USER_ID) {
    try {
      const res = await fetch(`${API_BASE}/ai/recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Local deterministic AI recommendation
    return {
      user_id: userId,
      recommended_game: "memory_match",
      recommended_game_name: "North East Heritage Match",
      recommended_difficulty: "medium",
      reasoning: "Visual associative memory exercises with North East cultural pairs will gently reinforce spatial pattern recognition and sustained attention.",
      caregiver_note: "Elder patient demonstrates high engagement with familiar imagery (Assam tea leaf & Kaziranga rhino). Visual memory is steady.",
      encouraging_voice_message: "Good day, Bhaben! Let's explore beautiful pictures of North East heritage in the Memory Match game today.",
      disclaimer: "AI Cognitive Assistance is designed for stimulation and engagement, not clinical diagnosis."
    };
  }
};
