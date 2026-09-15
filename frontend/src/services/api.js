import { supabase } from './supabaseClient';

/**
 * NeuroSathi NER - API Service & Offline-First Sync Layer
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const DEMO_USER_ID = "demo-user-123";
export const LAKSHMI_USER_ID = "patient-lakshmi-demo";

export function toSupabaseUuid(id) {
  if (!id) return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h) + id.charCodeAt(i);
    h |= 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, '0');
  return `f0000000-0000-4000-8000-${hex.padEnd(12, '0').slice(0, 12)}`;
}

export function fromSupabaseUuid(uuidStr) {
  return uuidStr || null;
}

// PIN persistence helper: safely encodes/extracts caregiver PIN via address field since Supabase profiles lacks caregiver_pin column
export function extractPinAndAddress(rawAddress, fallbackPin = '1234') {
  if (!rawAddress) return { address: '', pin: fallbackPin };
  const pinMatch = rawAddress.match(/\[PIN:([a-zA-Z0-9]+)\]/);
  const pin = pinMatch ? pinMatch[1] : fallbackPin;
  const cleanAddress = rawAddress.replace(/\s*\[PIN:[a-zA-Z0-9]+\]/, '').trim();
  return { address: cleanAddress || '', pin };
}

export function formatAddressWithPin(address, pin = '1234') {
  const clean = (address || '').replace(/\s*\[PIN:[a-zA-Z0-9]+\]/, '').trim();
  const safePin = String(pin || '1234').trim();
  return clean ? `${clean} [PIN:${safePin}]` : `[PIN:${safePin}]`;
}

// Per-patient storage key helpers
function patientKey(baseKey, userId) {
  return `${baseKey}_${userId || 'none'}`;
}

// Local storage keys
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

// Helper: Purge legacy records, demo data, and all saved logins/sessions across devices
export function cleanupDemoData() {
  try {
    const WIPE_VERSION_KEY = 'ns_clean_slate_v2026_09_15_nodefaults';

    if (!localStorage.getItem(WIPE_VERSION_KEY)) {
      const demoIds = ['demo-user-123', 'patient-lakshmi-demo'];
      const storedActive = localStorage.getItem('ns_active_patient_id');
      if (demoIds.includes(storedActive)) {
        localStorage.removeItem('ns_active_patient_id');
      }
      const storedProf = localStorage.getItem('ns_profile');
      if (storedProf) {
        try {
          const p = JSON.parse(storedProf);
          if (demoIds.includes(p?.id) || p?.name === 'Bhaben Kalita' || p?.name === 'Lakshmi Devi') {
            localStorage.removeItem('ns_profile');
          }
        } catch (e) {}
      }
      const storedSession = localStorage.getItem('ns_caregiver_session');
      if (storedSession) {
        try {
          const s = JSON.parse(storedSession);
          if (demoIds.includes(s?.activePatient?.id)) {
            localStorage.removeItem('ns_caregiver_session');
          }
        } catch (e) {}
      }

      // Filter all patients list to remove demo patients
      const storedPatients = localStorage.getItem('ns_all_patients');
      if (storedPatients) {
        try {
          const pts = JSON.parse(storedPatients);
          if (Array.isArray(pts)) {
            const filtered = pts.filter(p => !demoIds.includes(p?.id) && p?.name !== 'Bhaben Kalita' && p?.name !== 'Lakshmi Devi');
            localStorage.setItem('ns_all_patients', JSON.stringify(filtered));
          }
        } catch (e) {}
      }

      localStorage.removeItem('neurosathi_reminders');
      localStorage.removeItem('neurosathi_game_results');
      localStorage.removeItem('neurosathi_alerts');

      demoIds.forEach(demoId => {
        localStorage.removeItem(`neurosathi_profile_${demoId}`);
        localStorage.removeItem(`neurosathi_reminders_${demoId}`);
        localStorage.removeItem(`neurosathi_game_results_${demoId}`);
        localStorage.removeItem(`neurosathi_game_difficulty_${demoId}_memory_match`);
        localStorage.removeItem(`neurosathi_game_difficulty_${demoId}_sequence_recall`);
        localStorage.removeItem(`neurosathi_game_difficulty_${demoId}_object_recognition`);
        localStorage.removeItem(`neurosathi_game_difficulty_${demoId}_daily_life_sequence`);
      });

      localStorage.setItem(WIPE_VERSION_KEY, 'true');
    }
  } catch (err) {
    console.warn('cleanupDemoData notice:', err);
  }
}

// Run cleanup immediately on script execution to ensure completely clean slate for user data
cleanupDemoData();

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

  // Resolve active patient ID without demo fallback
  resolveEffectiveUserId(userId) {
    if (userId && typeof userId === 'string' && userId.trim() && userId !== 'null' && userId !== 'undefined' && !['demo-user-123', 'patient-lakshmi-demo'].includes(userId.trim())) {
      return userId.trim();
    }
    try {
      const stored = localStorage.getItem('ns_active_patient_id');
      if (stored && typeof stored === 'string' && stored.trim() && stored !== 'null' && stored !== 'undefined' && !['demo-user-123', 'patient-lakshmi-demo'].includes(stored.trim())) {
        return stored.trim();
      }
      const session = localStorage.getItem('ns_caregiver_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.activePatient?.id && !['demo-user-123', 'patient-lakshmi-demo'].includes(parsed.activePatient.id)) return parsed.activePatient.id;
      }
      const profile = localStorage.getItem('ns_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        if (parsed?.id && !['demo-user-123', 'patient-lakshmi-demo'].includes(parsed.id)) return parsed.id;
      }
    } catch (e) {}
    return null;
  },

  // Reminders — per-patient namespaced with live Supabase & offline-first sync
  async getReminders(userId) {
    const uid = this.resolveEffectiveUserId(userId);
    if (!uid) return [];
    const key = patientKey(STORAGE_KEYS.REMINDERS, uid);
    let localReminders = getLocal(key, null);
    if (localReminders === null || !Array.isArray(localReminders)) {
      localReminders = [];
      setLocal(key, localReminders);
    }

    // Try live FastAPI endpoint
    try {
      const res = await fetch(`${API_BASE}/reminders/${uid}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mergedMap = new Map();
          data.forEach(item => mergedMap.set(item.id, item));
          (localReminders || []).forEach(item => {
            if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
          });
          const mergedList = Array.from(mergedMap.values());
          setLocal(key, mergedList);
          return mergedList;
        }
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

        if (!error && Array.isArray(data) && data.length > 0) {
          const todayStr = new Date().toISOString().slice(0, 10);
          const localList = Array.isArray(localReminders) ? [...localReminders] : [];
          const localMap = new Map();
          localList.forEach(lr => {
            localMap.set(lr.id, lr);
            localMap.set(toSupabaseUuid(lr.id), lr);
          });

          const remoteMapped = data.map(r => {
            const local = localMap.get(r.id) || localMap.get(fromSupabaseUuid(r.id));
            return {
              id: local?.id || r.id,
              user_id: uid,
              title: r.title || local?.title || 'Reminder',
              category: r.category || local?.category || 'medicine',
              time: r.time_schedule || r.time || local?.time || '08:30 AM',
              date: r.date || local?.date || todayStr,
              dosage_or_detail: r.dosage_or_detail || local?.dosage_or_detail || '',
              audio_prompt: r.audio_prompt || local?.audio_prompt || '',
              is_completed: Boolean(r.is_completed !== undefined ? r.is_completed : local?.is_completed),
              icon_name: r.icon_name || local?.icon_name || 'Pill',
              created_at: r.created_at || local?.created_at || new Date().toISOString()
            };
          });

          // Any locally added reminders not yet in Supabase stay at the top
          const remoteIdSet = new Set(data.map(r => r.id).concat(data.map(r => fromSupabaseUuid(r.id))));
          const unSyncedLocal = localList.filter(lr => !remoteIdSet.has(lr.id) && !remoteIdSet.has(toSupabaseUuid(lr.id)));

          const combined = [...unSyncedLocal, ...remoteMapped];
          setLocal(key, combined);
          return combined;
        }
      } catch (sbErr) {
        console.warn('Supabase direct reminder fetch notice:', sbErr);
      }
    }

    return localReminders || [];
  },

  async createReminder(reminderData) {
    const uid = this.resolveEffectiveUserId(reminderData.user_id);
    const key = patientKey(STORAGE_KEYS.REMINDERS, uid);
    const localReminders = getLocal(key, []);
    const today = new Date().toISOString().slice(0, 10);
    
    // Ensure valid UUID format for seamless local + Supabase consistency
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `f0000000-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`;
    const isRecurring = reminderData.recurrence && reminderData.recurrence !== 'none';
    
    const baseReminder = {
      ...reminderData,
      id: reminderData.id || newId,
      user_id: uid,
      title: reminderData.title || 'Scheduled Reminder',
      category: reminderData.category || 'medicine',
      date: reminderData.date || today,
      time: reminderData.time || '10:00 AM',
      dosage_or_detail: reminderData.dosage_or_detail || '',
      audio_prompt: reminderData.audio_prompt || `Reminder for ${reminderData.title}`,
      is_completed: Boolean(reminderData.is_completed),
      icon_name: reminderData.icon_name || (reminderData.category === 'medicine' ? 'Pill' : 'Bell'),
      created_at: new Date().toISOString(),
      recurrence: reminderData.recurrence || 'none',
      recurrence_days: reminderData.recurrence_days || [],
      original_time: reminderData.time,
      snoozed_until: null,
      taken_later: false
    };
    
    // Prepend to local storage immediately
    localReminders.unshift(baseReminder);
    
    // If recurring, create future instances
    if (isRecurring) {
      try {
        const futureReminders = this.generateRecurringReminders(baseReminder);
        if (Array.isArray(futureReminders)) {
          localReminders.push(...futureReminders);
        }
      } catch (recErr) {
        console.warn('generateRecurringReminders error:', recErr);
      }
    }
    
    setLocal(key, localReminders);

    // Sync to Supabase directly if available
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(uid);
        const validCategory = ['medicine', 'water', 'appointment', 'daily_task', 'meal'].includes(baseReminder.category)
          ? baseReminder.category
          : 'medicine';
        const supabaseRow = {
          id: toSupabaseUuid(baseReminder.id),
          user_id: targetUuid,
          title: baseReminder.title,
          category: validCategory,
          time_schedule: baseReminder.time,
          dosage_or_detail: baseReminder.dosage_or_detail || null,
          audio_prompt: baseReminder.audio_prompt || null,
          is_completed: false,
          icon_name: baseReminder.icon_name || 'Pill'
        };

        try {
          const { error: insErr } = await supabase.from('reminders').insert({ ...supabaseRow, date: baseReminder.date });
          if (insErr) {
            await supabase.from('reminders').insert(supabaseRow);
          }
        } catch (e) {
          await supabase.from('reminders').insert(supabaseRow);
        }
      } catch (sbErr) {
        console.warn('Supabase createReminder notice:', sbErr);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reminderData, user_id: uid }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const backendCreated = await res.json();
        return backendCreated;
      }
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

  async updateReminder(id, updates, userId) {
    const effectiveUserId = this.resolveEffectiveUserId(userId || updates?.user_id);
    if (!effectiveUserId) return null;
    const key = patientKey(STORAGE_KEYS.REMINDERS, effectiveUserId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id || toSupabaseUuid(r.id) === toSupabaseUuid(id));
    if (index !== -1) {
      localReminders[index] = { ...localReminders[index], ...updates };
      if (updates.is_completed) {
        localReminders[index].completed_at = new Date().toISOString();
        const profileKey = patientKey(STORAGE_KEYS.PROFILE, effectiveUserId);
        const profile = getLocal(profileKey, null);
        if (profile) {
          profile.total_stars = (profile.total_stars || 0) + 2;
          setLocal(profileKey, profile);
        }
        
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
        if (updates.date !== undefined) sbPayload.date = updates.date;
        if (updates.dosage_or_detail !== undefined) sbPayload.dosage_or_detail = updates.dosage_or_detail;
        if (updates.audio_prompt !== undefined) sbPayload.audio_prompt = updates.audio_prompt;
        if (updates.is_completed !== undefined) sbPayload.is_completed = Boolean(updates.is_completed);
        if (updates.icon_name !== undefined) sbPayload.icon_name = updates.icon_name;
        if (updates.is_completed) sbPayload.completed_at = new Date().toISOString();

        if (Object.keys(sbPayload).length > 0) {
          await supabase.from('reminders').update(sbPayload).in('id', [id, toSupabaseUuid(id)]);
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
    return index !== -1 ? localReminders[index] : null;
  },

  // Snooze reminder - updates time to now + specified minutes
  async snoozeReminder(id, minutes, userId) {
    const effectiveUserId = this.resolveEffectiveUserId(userId);
    if (!effectiveUserId) return null;
    const key = patientKey(STORAGE_KEYS.REMINDERS, effectiveUserId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id || toSupabaseUuid(r.id) === toSupabaseUuid(id));
    if (index !== -1) {
      const reminder = localReminders[index];
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);

      let h = snoozeTime.getHours();
      const m = snoozeTime.getMinutes();
      const meridian = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      const updatedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${meridian}`;

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
  async takeLaterReminder(id, userId) {
    const effectiveUserId = this.resolveEffectiveUserId(userId);
    if (!effectiveUserId) return null;
    const key = patientKey(STORAGE_KEYS.REMINDERS, effectiveUserId);
    const localReminders = getLocal(key, []);
    const index = localReminders.findIndex(r => r.id === id || toSupabaseUuid(r.id) === toSupabaseUuid(id));
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

  async deleteReminder(id, userId) {
    const effectiveUserId = this.resolveEffectiveUserId(userId);
    if (!effectiveUserId) return { success: false };
    const key = patientKey(STORAGE_KEYS.REMINDERS, effectiveUserId);
    const localReminders = getLocal(key, []);
    const filtered = localReminders.filter(r => r.id !== id && toSupabaseUuid(r.id) !== toSupabaseUuid(id));
    setLocal(key, filtered);

    if (supabase) {
      try {
        await supabase.from('reminders').delete().in('id', [id, toSupabaseUuid(id)]);
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
    const userId = resultData.user_id || 'guest';
    const gameResultsKey = patientKey(STORAGE_KEYS.GAME_RESULTS, userId);
    const localResults = getLocal(gameResultsKey, []);
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

    // Update stars on patient profile if user exists
    if (userId && userId !== 'guest') {
      const profileKey = patientKey(STORAGE_KEYS.PROFILE, userId);
      const profile = getLocal(profileKey, null);
      if (profile) {
        profile.total_stars = (profile.total_stars || 0) + (resultData.score >= 80 ? 5 : 3);
        setLocal(profileKey, profile);
      }

      // Also update in allPatients list
      const patients = getLocal(STORAGE_KEYS.PATIENTS, []);
      const pIdx = patients.findIndex(p => p.id === userId);
      if (pIdx !== -1) {
        patients[pIdx].total_stars = (patients[pIdx].total_stars || 0) + (resultData.score >= 80 ? 5 : 3);
        setLocal(STORAGE_KEYS.PATIENTS, patients);
      }
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
    if (supabase && userId && userId !== 'guest') {
      try {
        const targetUuid = toSupabaseUuid(userId);
        const validDiff = ['easy', 'medium', 'hard'].includes(resultData.difficulty) ? resultData.difficulty : 'easy';
        await supabase.from('game_results').insert({
          user_id: targetUuid,
          game_slug: resultData.game_type || 'memory_match',
          score: Math.round(resultData.score || 0),
          duration_seconds: Math.round(resultData.duration_seconds || resultData.time_taken_seconds || 0),
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
  async getSavedDifficulty(userId = 'guest', gameType) {
    return getSavedDifficulty(userId, gameType);
  },

  async getGameResults(userId) {
    if (!userId) return [];
    const uid = userId;
    const key = patientKey(STORAGE_KEYS.GAME_RESULTS, uid);
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

        if (!error && data) {
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

    return getLocal(key, []);
  },

  // Caregiver Summary & AI
  async getCaregiverDashboard(userId) {
    if (!userId) {
      return {
        patient_profile: null,
        today_activity_count: 0,
        adherence_percentage: 100,
        average_cognitive_score: 0,
        cognitive_trend: "No data",
        recent_game_scores: [],
        today_reminders: [],
        missed_reminders_count: 0,
        active_alerts: [],
        recent_activity_timeline: [],
        score_history_by_game: {}
      };
    }
    const uid = userId;
    try {
      const res = await fetch(`${API_BASE}/caregiver/dashboard/${uid}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const profile = await this.getUserProfile(uid);
    const reminders = await this.getReminders(uid);
    const games = await this.getGameResults(uid);
    const alerts = getLocal(STORAGE_KEYS.ALERTS, []);

    const completed = reminders.filter(r => r.is_completed).length;
    const adherence = reminders.length > 0 ? Math.round((completed / reminders.length) * 100) : 100;
    const avgScore = games.length > 0 ? Math.round(games.reduce((acc, g) => acc + g.score, 0) / games.length) : 0;

    return {
      patient_profile: profile,
      today_activity_count: reminders.length + games.length,
      adherence_percentage: adherence,
      average_cognitive_score: avgScore,
      cognitive_trend: games.length === 0 ? "No Sessions" : (avgScore >= 88 ? "Improving" : (avgScore >= 70 ? "Stable" : "Needs Attention")),
      recent_game_scores: games.slice(0, 5),
      today_reminders: reminders,
      missed_reminders_count: reminders.filter(r => !r.is_completed).length,
      active_alerts: alerts,
      recent_activity_timeline: games.length > 0 || reminders.length > 0 ? reminders.map(r => ({
        id: `log-${r.id}`,
        action: `${r.title} (${r.category})`,
        category: r.category,
        timestamp: r.time,
        status: r.is_completed ? "completed" : "pending"
      })) : [],
      score_history_by_game: {}
    };
  },

  // Caregiver Auth
  async caregiverLogin(contact, pin) {
    const cleanDigits = (str) => (str || '').toString().replace(/\D/g, '');
    const cleanStr = (str) => (str || '').toString().toLowerCase().trim();
    const enteredContact = cleanStr(contact);
    const enteredDigits = cleanDigits(contact);
    const enteredDigitsShort = enteredDigits.slice(-10);
    const enteredPin = (pin || '').toString().trim();

    // 1. Primary Source: Fetch live patient records from Supabase cloud so any device accesses real-time data
    const patientMap = new Map();

    if (supabase) {
      try {
        const { data: supaProfiles, error: supaErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!supaErr && supaProfiles && supaProfiles.length > 0) {
          supaProfiles.forEach(sp => {
            if (sp.role === 'caregiver') return; // Ignore pure caregiver accounts
            const uid = fromSupabaseUuid(sp.id);
            const { address: cleanAddress, pin: caregiverPin } = extractPinAndAddress(sp.emergency_contact_address, '1234');
            patientMap.set(uid, {
              id: uid,
              name: sp.name || 'Patient',
              email: sp.emergency_contact_email || '',
              role: 'elder',
              age: sp.age || null,
              gender: sp.gender || '',
              blood_group: sp.blood_group || '',
              location: sp.location || '',
              language_preference: sp.preferred_language || 'en',
              medical_stage: sp.medical_stage || '',
              allergies: sp.allergies || '',
              doctor_name: sp.doctor_name || '',
              doctor_phone: sp.doctor_phone || '',
              doctor_hospital: sp.doctor_hospital || '',
              emergency_contact_name: sp.emergency_contact_name || '',
              emergency_contact_relation: sp.emergency_contact_relation || '',
              emergency_contact_phone: sp.emergency_contact_phone || '',
              emergency_contact_email: sp.emergency_contact_email || '',
              emergency_contact_address: cleanAddress,
              current_streak: sp.streak_count ?? 0,
              total_stars: sp.total_stars ?? 0,
              caregiver_pin: caregiverPin,
              avatar_url: sp.avatar_url || null
            });
          });
        }
      } catch (sbErr) {
        console.warn('Supabase login cloud check notice:', sbErr);
      }
    }

    // 2. Also query local storage patients for offline fallback or newly registered local profiles
    const localPatients = getLocal(STORAGE_KEYS.PATIENTS, []);
    localPatients.forEach(p => {
      if (p && p.id && p.role !== 'caregiver' && !patientMap.has(p.id)) {
        patientMap.set(p.id, p);
      }
    });

    const allPatientsList = Array.from(patientMap.values());

    // 3. Find matching patients strictly by real phone number or email
    const candidates = allPatientsList.filter(p => {
      const pPhoneDigits = cleanDigits(p.emergency_contact_phone).slice(-10);
      const pEmail = cleanStr(p.emergency_contact_email);

      const phoneMatches = Boolean(enteredDigitsShort && pPhoneDigits && pPhoneDigits === enteredDigitsShort);
      const emailMatches = Boolean(pEmail && enteredContact && pEmail === enteredContact);

      return phoneMatches || emailMatches;
    });

    if (candidates.length === 0) {
      return {
        success: false,
        message: `No registered patient record found for "${contact}". Please check the phone number or register a new patient.`
      };
    }

    // 4. Verify 4-digit PIN against registered patient/caregiver PIN
    const validPinCandidates = candidates.filter(p => {
      const storedPin = String(p.caregiver_pin || '1234').trim();
      return storedPin === enteredPin;
    });

    if (validPinCandidates.length === 0) {
      return {
        success: false,
        message: 'Incorrect 4-digit PIN entered for this caregiver account.'
      };
    }

    // 6. Select the matched patient
    const matchedPatient = validPinCandidates[0];
    const activeId = matchedPatient.id;

    // Cache the authenticated patient and patient roster locally
    setLocal(patientKey(STORAGE_KEYS.PROFILE, activeId), matchedPatient);
    setLocal(STORAGE_KEYS.PROFILE, matchedPatient);
    localStorage.setItem('ns_profile', JSON.stringify(matchedPatient));
    localStorage.setItem('ns_active_patient_id', activeId);
    setLocal(STORAGE_KEYS.PATIENTS, allPatientsList);

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
      allPatients: validPinCandidates
    };
    localStorage.setItem('ns_caregiver_session', JSON.stringify(sessionData));

    return {
      success: true,
      message: 'Caregiver authenticated successfully.',
      caregiver: caregiverInfo,
      active_patient: matchedPatient,
      all_patients: validPinCandidates
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
            const { address: cleanAddress, pin: caregiverPin } = extractPinAndAddress(p.emergency_contact_address, '1234');
            return {
              id: uid,
              name: p.name || localP.name || 'Patient',
              email: p.emergency_contact_email || localP.email || '',
              role: p.role || 'elder',
              age: p.age || localP.age || null,
              gender: p.gender || localP.gender || '',
              blood_group: p.blood_group || localP.blood_group || '',
              location: p.location || localP.location || '',
              language_preference: p.preferred_language || localP.language_preference || 'en',
              medical_stage: p.medical_stage || localP.medical_stage || '',
              allergies: p.allergies || localP.allergies || '',
              doctor_name: p.doctor_name || localP.doctor_name || '',
              doctor_phone: p.doctor_phone || localP.doctor_phone || '',
              doctor_hospital: p.doctor_hospital || localP.doctor_hospital || '',
              emergency_contact_name: p.emergency_contact_name || localP.emergency_contact_name || '',
              emergency_contact_relation: p.emergency_contact_relation || localP.emergency_contact_relation || '',
              emergency_contact_phone: p.emergency_contact_phone || localP.emergency_contact_phone || '',
              emergency_contact_email: p.emergency_contact_email || localP.emergency_contact_email || '',
              emergency_contact_address: cleanAddress,
              current_streak: p.streak_count ?? localP.current_streak ?? 0,
              total_stars: p.total_stars ?? localP.total_stars ?? 0,
              caregiver_pin: caregiverPin,
              caregiver_notes: localP.caregiver_notes || '',
              avatar_url: p.avatar_url || localP.avatar_url || null
            };
          });
          setLocal(STORAGE_KEYS.PATIENTS, mapped);
          return mapped;
        }
      } catch (sbErr) {
        console.warn('Supabase getAllPatients notice:', sbErr);
      }
    }    return getLocal(STORAGE_KEYS.PATIENTS, []);
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
    const patients = getLocal(STORAGE_KEYS.PATIENTS, []);
    const existingIdx = patients.findIndex(p => p.id === newPatient.id);
    if (existingIdx !== -1) {
      patients[existingIdx] = newPatient;
    } else {
      patients.push(newPatient);
    }
    setLocal(STORAGE_KEYS.PATIENTS, patients);

    // 3. Initialize fresh empty reminders list for this newly registered patient
    const remKey = patientKey(STORAGE_KEYS.REMINDERS, newPatient.id);
    setLocal(remKey, []);

    // 4. Direct Supabase cloud insert / upsert (encoded PIN in address so it never fails due to missing column)
    if (supabase) {
      try {
        const targetUuid = toSupabaseUuid(newPatient.id);
        const encodedAddress = formatAddressWithPin(
          newPatient.emergency_contact_address || newPatient.location,
          newPatient.caregiver_pin
        );
        await supabase.from('profiles').upsert({
          id: targetUuid,
          name: newPatient.name,
          role: 'elder',
          age: newPatient.age,
          gender: newPatient.gender,
          blood_group: newPatient.blood_group,
          location: newPatient.location,
          preferred_language: newPatient.language_preference,
          medical_stage: newPatient.medical_stage,
          allergies: newPatient.allergies,
          doctor_name: newPatient.doctor_name,
          doctor_phone: newPatient.doctor_phone,
          doctor_hospital: newPatient.doctor_hospital,
          emergency_contact_name: newPatient.emergency_contact_name,
          emergency_contact_relation: newPatient.emergency_contact_relation,
          emergency_contact_phone: newPatient.emergency_contact_phone,
          emergency_contact_email: newPatient.emergency_contact_email,
          emergency_contact_address: encodedAddress,
          streak_count: 1,
          total_stars: 10,
          updated_at: new Date().toISOString()
        });
      } catch (sbErr) {
        console.warn('Supabase registerPatient upsert notice:', sbErr);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const backendPatient = await res.json();
        const merged = { ...newPatient, ...backendPatient };
        setLocal(patientKey(STORAGE_KEYS.PROFILE, merged.id), merged);
        const updatedPatients = getLocal(STORAGE_KEYS.PATIENTS, []).map(p =>
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
    if (!userId) return { success: false, message: 'No patient selected' };
    const profileKey = patientKey(STORAGE_KEYS.PROFILE, userId);
    const current = getLocal(profileKey, getLocal(STORAGE_KEYS.PROFILE, {})) || {};
    const updated = { ...current, ...updates, id: userId };

    // 1. Save patient-specific store
    setLocal(profileKey, updated);

    // 2. Update active profile so Elder view immediately reflects all new details
    setLocal(STORAGE_KEYS.PROFILE, updated);
    localStorage.setItem('ns_profile', JSON.stringify(updated));
    localStorage.setItem('ns_active_patient_id', userId);

    // 3. Update in allPatients list
    const patients = getLocal(STORAGE_KEYS.PATIENTS, []);
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
        if (updates.emergency_contact_address !== undefined || updates.caregiver_pin !== undefined) {
          const pinVal = updates.caregiver_pin || updated.caregiver_pin || '1234';
          const addrVal = updates.emergency_contact_address !== undefined ? updates.emergency_contact_address : (updated.emergency_contact_address || updated.location);
          sbUpdates.emergency_contact_address = formatAddressWithPin(addrVal, pinVal);
        }
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
  async getUserProfile(userId) {
    if (!userId) return null;
    const uid = userId;
    const key = patientKey(STORAGE_KEYS.PROFILE, uid);

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
          const { address: cleanAddress, pin: caregiverPin } = extractPinAndAddress(data.emergency_contact_address, '1234');
          const profile = {
            id: uid,
            name: data.name || localProf.name || 'Patient',
            email: data.emergency_contact_email || localProf.email || '',
            role: data.role || 'elder',
            age: data.age || localProf.age || null,
            gender: data.gender || localProf.gender || '',
            blood_group: data.blood_group || localProf.blood_group || '',
            location: data.location || localProf.location || '',
            language_preference: data.preferred_language || localProf.language_preference || 'en',
            medical_stage: data.medical_stage || localProf.medical_stage || '',
            allergies: data.allergies || localProf.allergies || '',
            doctor_name: data.doctor_name || localProf.doctor_name || '',
            doctor_phone: data.doctor_phone || localProf.doctor_phone || '',
            doctor_hospital: data.doctor_hospital || localProf.doctor_hospital || '',
            emergency_contact_name: data.emergency_contact_name || localProf.emergency_contact_name || '',
            emergency_contact_relation: data.emergency_contact_relation || localProf.emergency_contact_relation || '',
            emergency_contact_phone: data.emergency_contact_phone || localProf.emergency_contact_phone || '',
            emergency_contact_email: data.emergency_contact_email || localProf.emergency_contact_email || '',
            emergency_contact_address: cleanAddress,
            current_streak: data.streak_count ?? localProf.current_streak ?? 0,
            total_stars: data.total_stars ?? localProf.total_stars ?? 0,
            caregiver_pin: caregiverPin,
            caregiver_notes: localProf.caregiver_notes || '',
            avatar_url: data.avatar_url || localProf.avatar_url || null
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
    const allPatients = getLocal(STORAGE_KEYS.PATIENTS, []);
    const found = allPatients.find(p => p.id === uid);
    if (found) {
      setLocal(key, found);
      return found;
    }

    return null;
  },

  async getAIRecommendation(userId) {
    if (!userId) return null;
    const uid = userId;
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
