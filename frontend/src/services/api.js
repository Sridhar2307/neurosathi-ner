import { supabase } from './supabaseClient';

/**
 * NeuroSathi NER - API Service & Offline-First Sync Layer
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const DEMO_USER_ID = "demo-user-123";
export const LAKSHMI_USER_ID = "patient-lakshmi-demo";

// Supabase UUID deterministic mapping
const ID_TO_UUID_MAP = {
  [DEMO_USER_ID]: "e0000000-0000-0000-0000-000000000002",
  [LAKSHMI_USER_ID]: "e0000000-0000-0000-0000-000000000001",
};
const UUID_TO_ID_MAP = {
  "e0000000-0000-0000-0000-000000000002": DEMO_USER_ID,
  "e0000000-0000-0000-0000-000000000001": LAKSHMI_USER_ID,
};

export function toSupabaseUuid(id) {
  if (!id) return "e0000000-0000-0000-0000-000000000002";
  if (ID_TO_UUID_MAP[id]) return ID_TO_UUID_MAP[id];
  // If it's already a valid UUID format (8-4-4-4-12)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  // Deterministic valid UUID generation from non-UUID string
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h) + id.charCodeAt(i);
    h |= 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, '0');
  return `f0000000-0000-4000-8000-${hex.padEnd(12, '0').slice(0, 12)}`;
}

export function fromSupabaseUuid(uuidStr) {
  if (!uuidStr) return DEMO_USER_ID;
  return UUID_TO_ID_MAP[uuidStr] || uuidStr;
}

// Per-patient storage key helpers
function patientKey(baseKey, userId) {
  return `${baseKey}_${userId || DEMO_USER_ID}`;
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

export const DEFAULT_PROFILE = {
  id: DEMO_USER_ID,
  name: "Bhaben Kalita",
  email: "bhaben.kalita@neurosathi.in",
  role: "elder",
  age: 74,
  gender: "Male",
  blood_group: "O+",
  location: "Guwahati, Assam",
  language_preference: "en",
  medical_stage: "Early-stage Dementia / MCI",
  allergies: "None reported",
  doctor_name: "Dr. Anupam Sarma (Neurologist)",
  doctor_phone: "+91 98640 12345",
  doctor_hospital: "Guwahati Neurological Center, Assam",
  emergency_contact_name: "Priya Sharma (Daughter)",
  emergency_contact_relation: "Daughter & Caregiver",
  emergency_contact_phone: "+91 98765 43210",
  emergency_contact_email: "priya@care.in",
  caregiver_notes: "Prefers morning tea and Assamese Bihu folk songs.",
  caregiver_pin: "1234",
  current_streak: 4,
  total_stars: 56,
  avatar_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
};

export const LAKSHMI_PROFILE = {
  id: LAKSHMI_USER_ID,
  name: "Lakshmi Devi",
  email: "lakshmi.devi@neurosathi.in",
  role: "elder",
  age: 72,
  gender: "Female",
  blood_group: "B+",
  location: "Beltola, Guwahati, Assam",
  language_preference: "en",
  medical_stage: "Mild Cognitive Impairment (Early Stage)",
  allergies: "None reported",
  doctor_name: "Dr. Anupam Sarma (Neurologist)",
  doctor_phone: "+91 98640 12345",
  doctor_hospital: "Guwahati Neurological Center, Assam",
  emergency_contact_name: "Dr. Priya Sharma (Daughter)",
  emergency_contact_relation: "Daughter & Primary Caregiver",
  emergency_contact_phone: "+91 98765 43210",
  emergency_contact_email: "caregiver@neurosathi.in",
  emergency_contact_address: "Beltola, Guwahati, Assam",
  caregiver_notes: "Enjoys Assamese folklore and visual memory matching. Responds well to gentle reminders.",
  caregiver_pin: "1234",
  current_streak: 5,
  total_stars: 62,
  avatar_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
};

export const INITIAL_PATIENTS = [DEFAULT_PROFILE, LAKSHMI_PROFILE];

export const LAKSHMI_REMINDERS = [
  {
    id: "rem-lakshmi-1",
    user_id: LAKSHMI_USER_ID,
    title: "Donepezil 5mg (Memory Support)",
    category: "medicine",
    time: "09:00 AM",
    dosage_or_detail: "1 tablet with water after breakfast",
    audio_prompt: "Good morning Lakshmi, please take your Donepezil memory tablet.",
    is_completed: false,
    icon_name: "Pill",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "rem-lakshmi-2",
    user_id: LAKSHMI_USER_ID,
    title: "Midday Fresh Water & Tulsi Tea",
    category: "water",
    time: "12:30 PM",
    dosage_or_detail: "1 glass lukewarm water with fresh tulsi leaves",
    audio_prompt: "Time for a relaxing drink of fresh water and herbal tea, Lakshmi.",
    is_completed: true,
    completed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    icon_name: "Droplet",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "rem-lakshmi-3",
    user_id: LAKSHMI_USER_ID,
    title: "Afternoon Memory Story Recall",
    category: "daily_task",
    time: "04:00 PM",
    dosage_or_detail: "15 minutes North East folk story recall game",
    audio_prompt: "Lakshmi, let's play your afternoon memory story game!",
    is_completed: false,
    icon_name: "Brain",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

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
if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) setLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);

// Seed patient-specific stores if empty
if (!localStorage.getItem(patientKey(STORAGE_KEYS.PROFILE, DEMO_USER_ID))) {
  setLocal(patientKey(STORAGE_KEYS.PROFILE, DEMO_USER_ID), DEFAULT_PROFILE);
}
if (!localStorage.getItem(patientKey(STORAGE_KEYS.REMINDERS, DEMO_USER_ID))) {
  setLocal(patientKey(STORAGE_KEYS.REMINDERS, DEMO_USER_ID), DEFAULT_REMINDERS);
}
if (!localStorage.getItem(patientKey(STORAGE_KEYS.GAME_RESULTS, DEMO_USER_ID))) {
  setLocal(patientKey(STORAGE_KEYS.GAME_RESULTS, DEMO_USER_ID), DEFAULT_GAME_RESULTS);
}

if (!localStorage.getItem(patientKey(STORAGE_KEYS.PROFILE, LAKSHMI_USER_ID))) {
  setLocal(patientKey(STORAGE_KEYS.PROFILE, LAKSHMI_USER_ID), LAKSHMI_PROFILE);
}
if (!localStorage.getItem(patientKey(STORAGE_KEYS.REMINDERS, LAKSHMI_USER_ID))) {
  setLocal(patientKey(STORAGE_KEYS.REMINDERS, LAKSHMI_USER_ID), LAKSHMI_REMINDERS);
}

export const api = {
  // Check backend health & database connectivity
  async checkHealth() {
    // 1. Try FastAPI backend first
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { online: true, database: 'supabase_connected', data };
      }
    } catch (e) {}

    // 2. Direct Supabase ping (works seamlessly on Netlify static hosting)
    if (supabase) {
      try {
        const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        if (!error) {
          return {
            online: true,
            database: 'supabase_connected',
            data: {
              status: 'healthy',
              database: {
                status: 'connected',
                provider: 'Supabase PostgreSQL (Cloud)',
                activated: true
              }
            }
          };
        }
      } catch (err) {
        console.warn('Supabase direct ping error:', err);
      }
    }

    return { online: false, database: 'offline_local', data: { status: 'offline-mode', message: 'Running on local offline store' } };
  },

  // Reminders — per-patient namespaced with live Supabase & offline-first sync
  async getReminders(userId = DEMO_USER_ID) {
    const uid = userId || DEMO_USER_ID;
    const key = patientKey(STORAGE_KEYS.REMINDERS, uid);
    // Seed defaults for demo and lakshmi patients if not present
    if (uid === DEMO_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, DEFAULT_REMINDERS);
    } else if (uid === LAKSHMI_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, LAKSHMI_REMINDERS);
    }

    // Try live FastAPI endpoint
    try {
      const res = await fetch(`${API_BASE}/reminders/${uid}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        setLocal(key, data);
        return data;
      }
    } catch (e) {}

    // If FastAPI not reached, query Supabase directly
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(uid);
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', targetUuid)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(r => ({
            id: r.id,
            user_id: uid,
            title: r.title,
            category: r.category || 'medicine',
            time: r.time_schedule || r.time || '08:30 AM',
            dosage_or_detail: r.dosage_or_detail || '',
            audio_prompt: r.audio_prompt || '',
            is_completed: Boolean(r.is_completed),
            icon_name: r.icon_name || 'Pill',
            created_at: r.created_at || new Date().toISOString()
          }));
          setLocal(key, mapped);
          return mapped;
        }
      } catch (sbErr) {
        console.warn('Supabase direct reminder fetch notice:', sbErr);
      }
    }

    const defaultList = uid === LAKSHMI_USER_ID ? LAKSHMI_REMINDERS : (uid === DEMO_USER_ID ? DEFAULT_REMINDERS : []);
    return getLocal(key, defaultList);
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

    // Sync to Supabase directly if available
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(uid);
        const validCategory = ['medicine', 'water', 'appointment', 'daily_task', 'meal'].includes(baseReminder.category)
          ? baseReminder.category
          : 'medicine';
        await supabase.from('reminders').insert({
          id: baseReminder.id,
          user_id: targetUuid,
          title: baseReminder.title,
          category: validCategory,
          time_schedule: baseReminder.time,
          dosage_or_detail: baseReminder.dosage_or_detail || null,
          audio_prompt: baseReminder.audio_prompt || null,
          is_completed: false,
          icon_name: baseReminder.icon_name || 'Pill'
        });
      } catch (sbErr) {
        console.warn('Supabase createReminder notice:', sbErr);
      }
    }

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

    // Sync to Supabase directly if available
    if (supabase) {
      try {
        const sbPayload = {};
        if (updates.title !== undefined) sbPayload.title = updates.title;
        if (updates.category !== undefined) sbPayload.category = updates.category;
        if (updates.time !== undefined) sbPayload.time_schedule = updates.time;
        if (updates.dosage_or_detail !== undefined) sbPayload.dosage_or_detail = updates.dosage_or_detail;
        if (updates.audio_prompt !== undefined) sbPayload.audio_prompt = updates.audio_prompt;
        if (updates.is_completed !== undefined) sbPayload.is_completed = Boolean(updates.is_completed);
        if (updates.icon_name !== undefined) sbPayload.icon_name = updates.icon_name;
        if (updates.is_completed) sbPayload.completed_at = new Date().toISOString();

        if (Object.keys(sbPayload).length > 0) {
          await supabase.from('reminders').update(sbPayload).eq('id', id);
        }
      } catch (sbErr) {
        console.warn('Supabase updateReminder notice:', sbErr);
      }
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

  // Snooze reminder - updates time to now + specified minutes
  async snoozeReminder(id, minutes, userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.REMINDERS, userId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      const reminder = localReminders[index];
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);

      const updatedTime = snoozeTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const updatedReminder = {
        ...reminder,
        time: updatedTime,
        snoozed_until: snoozeTime.toISOString(),
        is_completed: false,
        is_snoozed: true
      };

      localReminders[index] = updatedReminder;
      setLocal(key, localReminders);
      return updatedReminder;
    }
    return null;
  },

  // Mark as "take later" - updates time to 08:00 PM tonight
  async takeLaterReminder(id, userId = DEMO_USER_ID) {
    const key = patientKey(STORAGE_KEYS.REMINDERS, userId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      const reminder = localReminders[index];
      const laterTime = new Date();
      laterTime.setHours(20, 0, 0, 0); // 8:00 PM

      const updatedReminder = {
        ...reminder,
        time: "08:00 PM",
        is_completed: false,
        taken_later: true
      };

      localReminders[index] = updatedReminder;
      setLocal(key, localReminders);
      return updatedReminder;
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

    if (supabase) {
      try {
        await supabase.from('reminders').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase deleteReminder notice:', sbErr);
      }
    }

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
    const userId = resultData.user_id || DEMO_USER_ID;
    const gameResultsKey = patientKey(STORAGE_KEYS.GAME_RESULTS, userId);
    const localResults = getLocal(gameResultsKey, userId === DEMO_USER_ID ? DEFAULT_GAME_RESULTS : []);
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
    setLocal(gameResultsKey, localResults);
    setLocal(STORAGE_KEYS.GAME_RESULTS, localResults);

    // Update stars on patient profile
    const profileKey = patientKey(STORAGE_KEYS.PROFILE, userId);
    const defaultProf = userId === LAKSHMI_USER_ID ? LAKSHMI_PROFILE : DEFAULT_PROFILE;
    const profile = getLocal(profileKey, defaultProf);
    profile.total_stars = (profile.total_stars || 0) + (resultData.score >= 80 ? 5 : 3);
    setLocal(profileKey, profile);
    if (userId === DEMO_USER_ID) {
      setLocal(STORAGE_KEYS.PROFILE, profile);
    }

    // Also update in allPatients list
    const patients = getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const pIdx = patients.findIndex(p => p.id === userId);
    if (pIdx !== -1) {
      patients[pIdx].total_stars = profile.total_stars;
      setLocal(STORAGE_KEYS.PATIENTS, patients);
    }

    try {
      const res = await fetch(`${API_BASE}/games/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Direct Supabase telemetry sync
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(userId);
        const validDiff = ['easy', 'medium', 'hard'].includes(resultData.difficulty) ? resultData.difficulty : 'easy';
        await supabase.from('game_results').insert({
          user_id: targetUuid,
          game_slug: resultData.game_type || 'memory_match',
          score: Math.round(resultData.score || 0),
          duration_seconds: Math.round(resultData.time_taken_seconds || 60),
          difficulty: validDiff,
          mistakes: Math.round(resultData.mistakes || 0),
          stars_earned: (resultData.score >= 80 ? 5 : 3)
        });
      } catch (sbErr) {
        console.warn('Supabase game_results insert notice:', sbErr);
      }
    }

    return newResult;
  },

  // Get saved difficulty for a game type
  async getSavedDifficulty(userId = DEMO_USER_ID, gameType) {
    return getSavedDifficulty(userId, gameType);
  },

  async getGameResults(userId = DEMO_USER_ID) {
    const uid = userId || DEMO_USER_ID;
    const key = patientKey(STORAGE_KEYS.GAME_RESULTS, uid);
    if (uid === DEMO_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, DEFAULT_GAME_RESULTS);
    }
    try {
      const res = await fetch(`${API_BASE}/games/results/${uid}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        setLocal(key, data);
        return data;
      }
    } catch (e) {}

    // Fallback direct Supabase query
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(uid);
        const { data, error } = await supabase
          .from('game_results')
          .select('*')
          .eq('user_id', targetUuid)
          .order('played_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(g => ({
            id: g.id,
            user_id: uid,
            game_type: g.game_slug,
            game_name: g.game_slug === 'memory_match' ? 'North East Heritage Match' : (g.game_slug === 'sequence_recall' ? 'Daily Sequence Recall' : 'Tea Garden Item Spotter'),
            score: g.score,
            time_taken_seconds: g.duration_seconds,
            difficulty: g.difficulty,
            mistakes: g.mistakes,
            stars_earned: g.stars_earned || 3,
            timestamp: g.played_at || new Date().toISOString()
          }));
          setLocal(key, mapped);
          return mapped;
        }
      } catch (sbErr) {
        console.warn('Supabase game_results fetch notice:', sbErr);
      }
    }

    return getLocal(key, uid === DEMO_USER_ID ? DEFAULT_GAME_RESULTS : []);
  },

  // Caregiver Summary & AI
  async getCaregiverDashboard(userId = DEMO_USER_ID) {
    const uid = userId || DEMO_USER_ID;
    try {
      const res = await fetch(`${API_BASE}/caregiver/dashboard/${uid}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const profile = await this.getUserProfile(uid);
    const reminders = await this.getReminders(uid);
    const games = await this.getGameResults(uid);
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
    const cleanDigits = (str) => (str || '').toString().replace(/\D/g, '');
    const cleanStr = (str) => (str || '').toString().toLowerCase().trim();
    const enteredContact = cleanStr(contact);
    const enteredDigits = cleanDigits(contact);
    const enteredPin = (pin || '').toString().trim();

    try {
      const res = await fetch(`${API_BASE}/auth/caregiver-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, pin }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.active_patient) {
          const act = data.active_patient;
          setLocal(patientKey(STORAGE_KEYS.PROFILE, act.id), act);
          setLocal(STORAGE_KEYS.PROFILE, act);
          localStorage.setItem('ns_profile', JSON.stringify(act));
          localStorage.setItem('ns_active_patient_id', act.id);
          if (data.all_patients) setLocal(STORAGE_KEYS.PATIENTS, data.all_patients);
        }
        return data;
      }
    } catch (e) {}

    // Offline & Supabase Direct Fallback: match contact or PIN against all stored patients
    const allPatients = getLocal(STORAGE_KEYS.PATIENTS, []);
    const demoProfile = getLocal(STORAGE_KEYS.PROFILE, null);
    const nsProfile = getLocal('ns_profile', null);
    const pDemo = getLocal(patientKey(STORAGE_KEYS.PROFILE, DEMO_USER_ID), null);
    const pLakshmi = getLocal(patientKey(STORAGE_KEYS.PROFILE, LAKSHMI_USER_ID), null);

    // Combine all patient candidates
    const patientMap = new Map();
    // Default seed patients
    INITIAL_PATIENTS.forEach(p => { if (p && p.id) patientMap.set(p.id, p); });

    // Overlay cached profiles
    if (demoProfile && demoProfile.id) patientMap.set(demoProfile.id, demoProfile);
    if (nsProfile && nsProfile.id) patientMap.set(nsProfile.id, nsProfile);
    if (pDemo && pDemo.id) patientMap.set(pDemo.id, pDemo);
    if (pLakshmi && pLakshmi.id) patientMap.set(pLakshmi.id, pLakshmi);
    allPatients.forEach(p => { if (p && p.id) patientMap.set(p.id, p); });

    // If Supabase is available, query cloud profiles too
    if (supabase) {
      try {
        const { data: supaProfiles } = await supabase.from('profiles').select('*').limit(20);
        if (supaProfiles && supaProfiles.length > 0) {
          supaProfiles.forEach(sp => {
            const uid = fromSupabaseUuid(sp.id);
            const localP = patientMap.get(uid) || {};
            const merged = {
              id: uid,
              name: sp.name || localP.name || 'Patient',
              email: sp.emergency_contact_email || localP.email || `${uid}@neurosathi.in`,
              role: sp.role || 'elder',
              age: sp.age || localP.age || 74,
              gender: sp.gender || localP.gender || 'Female',
              blood_group: sp.blood_group || localP.blood_group || 'O+',
              location: sp.location || localP.location || 'Guwahati, Assam',
              language_preference: sp.preferred_language || localP.language_preference || 'en',
              medical_stage: sp.medical_stage || localP.medical_stage || 'Early-stage Dementia / MCI',
              allergies: sp.allergies || localP.allergies || 'None reported',
              doctor_name: sp.doctor_name || localP.doctor_name || 'Dr. Anupam Sarma (Neurologist)',
              doctor_phone: sp.doctor_phone || localP.doctor_phone || '+91 98640 12345',
              doctor_hospital: sp.doctor_hospital || localP.doctor_hospital || 'Guwahati Neurological Center, Assam',
              emergency_contact_name: sp.emergency_contact_name || localP.emergency_contact_name || 'Primary Caregiver',
              emergency_contact_relation: sp.emergency_contact_relation || localP.emergency_contact_relation || 'Family',
              emergency_contact_phone: sp.emergency_contact_phone || localP.emergency_contact_phone || '+91 98765 43210',
              emergency_contact_email: sp.emergency_contact_email || localP.emergency_contact_email || 'caregiver@neurosathi.in',
              emergency_contact_address: sp.emergency_contact_address || localP.emergency_contact_address || 'Guwahati, Assam',
              current_streak: sp.streak_count || localP.current_streak || 4,
              total_stars: sp.total_stars || localP.total_stars || 56,
              caregiver_pin: localP.caregiver_pin || '1234',
              caregiver_notes: localP.caregiver_notes || '',
              avatar_url: sp.avatar_url || localP.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
            };
            patientMap.set(uid, merged);
          });
        }
      } catch (sbErr) {
        console.warn('Supabase login check notice:', sbErr);
      }
    }

    // Rehydrate each candidate with the most granular patient-specific local store
    for (const [id, p] of patientMap.entries()) {
      const specific = getLocal(patientKey(STORAGE_KEYS.PROFILE, id), null);
      if (specific) {
        patientMap.set(id, { ...p, ...specific });
      }
    }

    const patients = Array.from(patientMap.values());
    if (patients.length === 0) patients.push(DEFAULT_PROFILE);

    const isDemoContact = ['demo', 'democarein', '9876543210', 'demo@care.in'].includes(enteredContact);

    // Step 1: find all patients whose phone (last 10 digits) or email matches the entered contact
    const candidates = patients.filter(p => {
      const pPhoneDigits = cleanDigits(p.emergency_contact_phone).slice(-10);
      const pEmail = cleanStr(p.emergency_contact_email);
      const enteredDigitsShort = enteredDigits.slice(-10);

      const phoneMatches = Boolean(enteredDigitsShort && pPhoneDigits && pPhoneDigits === enteredDigitsShort);
      const emailMatches = Boolean(pEmail && enteredContact && pEmail === enteredContact);

      return phoneMatches || emailMatches;
    });

    let matchedPatient = null;

    if (candidates.length === 1) {
      matchedPatient = candidates[0];
    } else if (candidates.length > 1) {
      // Multiple patients share this contact — disambiguate strictly by PIN
      matchedPatient = candidates.find(p => String(p.caregiver_pin || '1234').trim() === enteredPin) || null;
      if (!matchedPatient) {
        return {
          success: false,
          message: 'Multiple patients found for this contact. Please enter the correct PIN for the patient you want to access.'
        };
      }
    } else if (isDemoContact) {
      matchedPatient = patients.find(p => p.id === DEMO_USER_ID) || patients[0];
    }

    if (!matchedPatient) {
      return {
        success: false,
        message: 'No patient record found matching the entered contact. Please check your credentials.'
      };
    }

    // Step 2: validate PIN strictly against the matched patient only
    const storedPin = String(matchedPatient.caregiver_pin || '1234').trim();
    const pinOk = isDemoContact || storedPin === enteredPin;

    if (!pinOk) {
      return {
        success: false,
        message: 'Incorrect PIN entered for this caregiver account.'
      };
    }

    // Persist matched patient into active profiles immediately
    const activeId = matchedPatient.id;
    setLocal(patientKey(STORAGE_KEYS.PROFILE, activeId), matchedPatient);
    setLocal(STORAGE_KEYS.PROFILE, matchedPatient);
    localStorage.setItem('ns_profile', JSON.stringify(matchedPatient));
    localStorage.setItem('ns_active_patient_id', activeId);

    // Filter candidates strictly to patients belonging to THIS caregiver's contact number
    const myPatientsMap = new Map();
    candidates.forEach(p => {
      if (p && p.id && p.role !== 'caregiver') myPatientsMap.set(p.id, p);
    });
    if (!myPatientsMap.has(matchedPatient.id)) {
      myPatientsMap.set(matchedPatient.id, matchedPatient);
    }
    const myPatients = Array.from(myPatientsMap.values());

    const caregiverInfo = {
      name: matchedPatient.emergency_contact_name || 'Primary Caregiver',
      relation: matchedPatient.emergency_contact_relation || 'Family',
      phone: matchedPatient.emergency_contact_phone || contact,
      email: matchedPatient.emergency_contact_email || null,
      contact
    };

    const sessionData = {
      caregiver: caregiverInfo,
      activePatient: matchedPatient,
      allPatients: myPatients
    };
    localStorage.setItem('ns_caregiver_session', JSON.stringify(sessionData));

    return {
      success: true,
      message: 'Caregiver authenticated successfully.',
      caregiver: caregiverInfo,
      active_patient: matchedPatient,
      all_patients: myPatients
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

    // Direct Supabase query
    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = data.map(p => {
            const uid = fromSupabaseUuid(p.id);
            const localP = getLocal(patientKey(STORAGE_KEYS.PROFILE, uid), {});
            return {
              id: uid,
              name: p.name || localP.name || 'Patient',
              email: p.emergency_contact_email || localP.email || `${uid}@neurosathi.in`,
              role: p.role || 'elder',
              age: p.age || localP.age || 74,
              gender: p.gender || localP.gender || 'Female',
              blood_group: p.blood_group || localP.blood_group || 'O+',
              location: p.location || localP.location || 'Guwahati, Assam',
              language_preference: p.preferred_language || localP.language_preference || 'en',
              medical_stage: p.medical_stage || localP.medical_stage || 'Early-stage Dementia / MCI',
              allergies: p.allergies || localP.allergies || 'None reported',
              doctor_name: p.doctor_name || localP.doctor_name || 'Dr. Anupam Sarma (Neurologist)',
              doctor_phone: p.doctor_phone || localP.doctor_phone || '+91 98640 12345',
              doctor_hospital: p.doctor_hospital || localP.doctor_hospital || 'Guwahati Neurological Center, Assam',
              emergency_contact_name: p.emergency_contact_name || localP.emergency_contact_name || 'Primary Caregiver',
              emergency_contact_relation: p.emergency_contact_relation || localP.emergency_contact_relation || 'Family',
              emergency_contact_phone: p.emergency_contact_phone || localP.emergency_contact_phone || '+91 98765 43210',
              emergency_contact_email: p.emergency_contact_email || localP.emergency_contact_email || 'caregiver@neurosathi.in',
              emergency_contact_address: p.emergency_contact_address || localP.emergency_contact_address || 'Guwahati, Assam',
              current_streak: p.streak_count || localP.current_streak || 4,
              total_stars: p.total_stars || localP.total_stars || 56,
              caregiver_pin: localP.caregiver_pin || '1234',
              caregiver_notes: localP.caregiver_notes || '',
              avatar_url: p.avatar_url || localP.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
            };
          });
          setLocal(STORAGE_KEYS.PATIENTS, mapped);
          return mapped;
        }
      } catch (sbErr) {
        console.warn('Supabase getAllPatients notice:', sbErr);
      }
    }

    return getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  },

  // Register new patient
  async registerPatient(patientData) {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `patient-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const newPatient = {
      id: newId,
      name: patientData.name || 'New Patient',
      email: patientData.emergency_contact_email || `${patientData.name?.toLowerCase().replace(/\s+/g, '') || 'patient'}@neurosathi.in`,
      role: 'elder',
      age: patientData.age ? parseInt(patientData.age) : 70,
      gender: patientData.gender || 'Male',
      blood_group: patientData.blood_group || 'O+',
      location: patientData.location || 'Guwahati, Assam',
      language_preference: patientData.language_preference || 'en',
      medical_stage: patientData.medical_stage || 'Early-stage Dementia / MCI',
      allergies: patientData.allergies || 'None reported',
      doctor_name: patientData.doctor_name || '',
      doctor_phone: patientData.doctor_phone || '',
      doctor_hospital: patientData.doctor_hospital || '',
      emergency_contact_name: patientData.emergency_contact_name || 'Primary Caregiver',
      emergency_contact_relation: patientData.emergency_contact_relation || 'Family',
      emergency_contact_phone: patientData.emergency_contact_phone || '',
      emergency_contact_email: patientData.emergency_contact_email || '',
      emergency_contact_address: patientData.emergency_contact_address || patientData.location || 'Guwahati, Assam',
      caregiver_notes: patientData.caregiver_notes || '',
      caregiver_pin: String(patientData.caregiver_pin || '1234').trim(),
      created_at: new Date().toISOString(),
      current_streak: 1,
      total_stars: 10,
      avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
    };

    // 1. Save patient-specific store
    setLocal(patientKey(STORAGE_KEYS.PROFILE, newPatient.id), newPatient);

    // 2. Add to global patients roster
    const patients = getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const existingIdx = patients.findIndex(p => p.id === newPatient.id);
    if (existingIdx !== -1) {
      patients[existingIdx] = newPatient;
    } else {
      patients.push(newPatient);
    }
    setLocal(STORAGE_KEYS.PATIENTS, patients);

    // 3. Create starter default reminders for this newly registered patient
    const remKey = patientKey(STORAGE_KEYS.REMINDERS, newPatient.id);
    const starterReminders = [
      {
        id: `rem-${Date.now().toString(36)}-1`,
        user_id: newPatient.id,
        title: "Morning Fresh Water & Hydration",
        category: "water",
        time: "08:30 AM",
        dosage_or_detail: "1 glass fresh water to stay hydrated",
        audio_prompt: `Good morning ${newPatient.name}, please drink a refreshing glass of water.`,
        is_completed: false,
        icon_name: "Droplet",
        created_at: new Date().toISOString()
      },
      {
        id: `rem-${Date.now().toString(36)}-2`,
        user_id: newPatient.id,
        title: "Afternoon Memory Routine",
        category: "daily_task",
        time: "03:00 PM",
        dosage_or_detail: "Daily cognitive exercise and music",
        audio_prompt: `Time for a gentle cognitive exercise, ${newPatient.name}.`,
        is_completed: false,
        icon_name: "Brain",
        created_at: new Date().toISOString()
      }
    ];
    setLocal(remKey, starterReminders);

    // 4. Direct Supabase cloud insert / upsert
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(newPatient.id);
        await supabase.from('profiles').upsert({
          id: targetUuid,
          name: newPatient.name,
          role: 'elder',
          preferred_language: newPatient.language_preference,
          age: newPatient.age,
          gender: newPatient.gender,
          blood_group: newPatient.blood_group,
          location: newPatient.location,
          medical_stage: newPatient.medical_stage,
          allergies: newPatient.allergies,
          doctor_name: newPatient.doctor_name || null,
          doctor_phone: newPatient.doctor_phone || null,
          doctor_hospital: newPatient.doctor_hospital || null,
          emergency_contact_name: newPatient.emergency_contact_name,
          emergency_contact_relation: newPatient.emergency_contact_relation,
          emergency_contact_phone: newPatient.emergency_contact_phone,
          emergency_contact_email: newPatient.emergency_contact_email || null,
          emergency_contact_address: newPatient.emergency_contact_address || null,
          streak_count: 1,
          total_stars: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } catch (sbErr) {
        console.warn('Supabase registerPatient cloud insert notice:', sbErr);
      }
    }

    // 5. Try live FastAPI backend
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const backendPatient = await res.json();
        const merged = { ...newPatient, ...backendPatient };
        setLocal(patientKey(STORAGE_KEYS.PROFILE, merged.id), merged);
        const updatedPatients = getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS).map(p =>
          p.id === newPatient.id ? merged : p
        );
        setLocal(STORAGE_KEYS.PATIENTS, updatedPatients);
        return { success: true, patient: merged };
      }
    } catch (e) {}

    return { success: true, patient: newPatient };
  },

  // Update patient details — two-way synced across Caregiver & Elder views and persisted in Supabase
  async updatePatient(userId, updates) {
    const profileKey = patientKey(STORAGE_KEYS.PROFILE, userId);
    const current = getLocal(profileKey, getLocal(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE));
    const updated = { ...current, ...updates, id: userId };

    // 1. Save patient-specific store
    setLocal(profileKey, updated);

    // 2. Update active profile so Elder view immediately reflects all new details
    setLocal(STORAGE_KEYS.PROFILE, updated);
    localStorage.setItem('ns_profile', JSON.stringify(updated));
    localStorage.setItem('ns_active_patient_id', userId);

    // 3. Update in allPatients list
    const patients = getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const idx = patients.findIndex(p => p.id === userId);
    if (idx !== -1) {
      patients[idx] = updated;
    } else {
      patients.push(updated);
    }
    setLocal(STORAGE_KEYS.PATIENTS, patients);

    // 4. Update caregiver session in localStorage if active
    try {
      const storedSession = localStorage.getItem('ns_caregiver_session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        parsedSession.activePatient = updated;
        if (parsedSession.allPatients) {
          parsedSession.allPatients = parsedSession.allPatients.map(p => p.id === userId ? updated : p);
        }
        localStorage.setItem('ns_caregiver_session', JSON.stringify(parsedSession));
      }
    } catch (e) {}

    // 5. Upsert to Supabase profiles cloud table
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(userId);
        const sbUpdates = { id: targetUuid, updated_at: new Date().toISOString() };
        if (updates.name !== undefined) sbUpdates.name = updates.name;
        if (updates.age !== undefined) sbUpdates.age = updates.age ? parseInt(updates.age) : null;
        if (updates.gender !== undefined) sbUpdates.gender = updates.gender;
        if (updates.blood_group !== undefined) sbUpdates.blood_group = updates.blood_group;
        if (updates.location !== undefined) sbUpdates.location = updates.location;
        if (updates.language_preference !== undefined) sbUpdates.preferred_language = updates.language_preference;
        if (updates.medical_stage !== undefined) sbUpdates.medical_stage = updates.medical_stage;
        if (updates.allergies !== undefined) sbUpdates.allergies = updates.allergies;
        if (updates.doctor_name !== undefined) sbUpdates.doctor_name = updates.doctor_name;
        if (updates.doctor_phone !== undefined) sbUpdates.doctor_phone = updates.doctor_phone;
        if (updates.doctor_hospital !== undefined) sbUpdates.doctor_hospital = updates.doctor_hospital;
        if (updates.emergency_contact_name !== undefined) sbUpdates.emergency_contact_name = updates.emergency_contact_name;
        if (updates.emergency_contact_relation !== undefined) sbUpdates.emergency_contact_relation = updates.emergency_contact_relation;
        if (updates.emergency_contact_phone !== undefined) sbUpdates.emergency_contact_phone = updates.emergency_contact_phone;
        if (updates.emergency_contact_email !== undefined) sbUpdates.emergency_contact_email = updates.emergency_contact_email;
        if (updates.emergency_contact_address !== undefined) sbUpdates.emergency_contact_address = updates.emergency_contact_address;
        if (updates.total_stars !== undefined) sbUpdates.total_stars = updates.total_stars;
        if (updates.current_streak !== undefined) sbUpdates.streak_count = updates.current_streak;

        await supabase.from('profiles').upsert(sbUpdates);
      } catch (sbErr) {
        console.warn('Supabase updatePatient upsert notice:', sbErr);
      }
    }

    // 6. FastApi backend update
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

  // Get user profile — per-patient namespaced with fallback merging
  async getUserProfile(userId = DEMO_USER_ID) {
    const uid = userId || DEMO_USER_ID;
    const key = patientKey(STORAGE_KEYS.PROFILE, uid);
    if (uid === DEMO_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, DEFAULT_PROFILE);
    } else if (uid === LAKSHMI_USER_ID && !localStorage.getItem(key)) {
      setLocal(key, LAKSHMI_PROFILE);
    }

    // Try FastAPI first
    try {
      const res = await fetch(`${API_BASE}/users/${uid}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        const localProf = getLocal(key, {});
        const merged = { ...localProf, ...data };
        setLocal(key, merged);
        return merged;
      }
    } catch (e) {}

    // Fallback direct Supabase profile fetch
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(uid);
        const { data, error } = await supabase.from('profiles').select('*').eq('id', targetUuid).single();
        if (!error && data) {
          const localProf = getLocal(key, {});
          const profile = {
            id: uid,
            name: data.name || localProf.name || 'Patient',
            email: data.emergency_contact_email || localProf.email || `${uid}@neurosathi.in`,
            role: data.role || 'elder',
            age: data.age || localProf.age || 74,
            gender: data.gender || localProf.gender || 'Female',
            blood_group: data.blood_group || localProf.blood_group || 'O+',
            location: data.location || localProf.location || 'Guwahati, Assam',
            language_preference: data.preferred_language || localProf.language_preference || 'en',
            medical_stage: data.medical_stage || localProf.medical_stage || 'Early-stage Dementia / MCI',
            allergies: data.allergies || localProf.allergies || 'None reported',
            doctor_name: data.doctor_name || localProf.doctor_name || 'Dr. Anupam Sarma (Neurologist)',
            doctor_phone: data.doctor_phone || localProf.doctor_phone || '+91 98640 12345',
            doctor_hospital: data.doctor_hospital || localProf.doctor_hospital || 'Guwahati Neurological Center, Assam',
            emergency_contact_name: data.emergency_contact_name || localProf.emergency_contact_name || 'Primary Caregiver',
            emergency_contact_relation: data.emergency_contact_relation || localProf.emergency_contact_relation || 'Family',
            emergency_contact_phone: data.emergency_contact_phone || localProf.emergency_contact_phone || '+91 98765 43210',
            emergency_contact_email: data.emergency_contact_email || localProf.emergency_contact_email || 'caregiver@neurosathi.in',
            emergency_contact_address: data.emergency_contact_address || localProf.emergency_contact_address || 'Guwahati, Assam',
            current_streak: data.streak_count || localProf.current_streak || 4,
            total_stars: data.total_stars || localProf.total_stars || 56,
            caregiver_pin: localProf.caregiver_pin || '1234',
            caregiver_notes: localProf.caregiver_notes || '',
            avatar_url: data.avatar_url || localProf.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
          };
          setLocal(key, profile);
          return profile;
        }
      } catch (sbErr) {
        console.warn('Supabase getUserProfile notice:', sbErr);
      }
    }

    // Check cached patientKey
    const cached = getLocal(key, null);
    if (cached) return cached;

    // Check allPatients
    const allPatients = getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const found = allPatients.find(p => p.id === uid);
    if (found) {
      setLocal(key, found);
      return found;
    }

    return uid === LAKSHMI_USER_ID ? LAKSHMI_PROFILE : DEFAULT_PROFILE;
  },

  async getAIRecommendation(userId = DEMO_USER_ID) {
    const uid = userId || DEMO_USER_ID;
    try {
      const res = await fetch(`${API_BASE}/ai/recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const profile = await this.getUserProfile(uid);
    const pName = (profile?.name || 'Elder').split(' ')[0];

    // Local deterministic AI recommendation
    return {
      user_id: uid,
      recommended_game: "memory_match",
      recommended_game_name: "North East Heritage Match",
      recommended_difficulty: "medium",
      reasoning: "Visual associative memory exercises with North East cultural pairs will gently reinforce spatial pattern recognition and sustained attention.",
      caregiver_note: `${pName} demonstrates high engagement with familiar imagery (Assam tea leaf & Kaziranga rhino). Visual memory is steady.`,
      encouraging_voice_message: `Good day, ${pName}! Let's explore beautiful pictures of North East heritage in the Memory Match game today.`,
      disclaimer: "AI Cognitive Assistance is designed for stimulation and engagement, not clinical diagnosis."
    };
  }
};
