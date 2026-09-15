/**
 * Reminder Scheduling & Time/Date Utilities
 * Handles parsing, 12h/24h conversion, date formatting, and due-time checking for elderly reminders.
 */

/**
 * Get current local date formatted as "YYYY-MM-DD"
 * @param {number} dayOffset - Days to add/subtract (0 for today, 1 for tomorrow)
 * @returns {string} e.g. "2026-09-15"
 */
export function getTodayDateStr(dayOffset = 0) {
  const d = new Date();
  if (dayOffset !== 0) {
    d.setDate(d.getDate() + dayOffset);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a YYYY-MM-DD date string into a friendly label with Date and Day (e.g. "Today (Tue, Sep 15)", "Tomorrow (Wed, Sep 16)")
 * @param {string} dateStr - e.g. "2026-09-15"
 * @returns {string} Friendly display date with weekday
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) dateStr = getTodayDateStr(0);
  const today = getTodayDateStr(0);
  const tomorrow = getTodayDateStr(1);
  const yesterday = getTodayDateStr(-1);

  try {
    const cleanStr = String(dateStr).slice(0, 10);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Tue"
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Sep 15"

      if (cleanStr === today) return `Today (${weekday}, ${monthDay})`;
      if (cleanStr === tomorrow) return `Tomorrow (${weekday}, ${monthDay})`;
      if (cleanStr === yesterday) return `Yesterday (${weekday}, ${monthDay})`;
      return `${weekday}, ${monthDay}, ${year}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

export const formatDateAndDay = formatDateDisplay;

/**
 * Parse any valid time string (12-hour AM/PM or 24-hour) into minutes from midnight (0 - 1439)
 * @param {string} timeStr - e.g. "08:30 AM", "8:30 am", "14:45", "02:15 PM"
 * @returns {number|null} Minutes from midnight or null if invalid
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim();

  // Match 12-hour format with AM/PM (e.g. "08:30 AM", "8:05 PM", "12:00 am")
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3] ? match12[3].toUpperCase() : null;

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return hours * 60 + minutes;
    }
  }

  // Fallback match standard 24-hour format (e.g. "14:30", "09:05")
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return hours * 60 + minutes;
    }
  }

  return null;
}

/**
 * Convert 24-hour time "HH:MM" (e.g. from <input type="time">) to standard 12-hour string "hh:mm AM/PM"
 * @param {string} time24 - e.g. "14:30", "09:05"
 * @returns {string} e.g. "02:30 PM", "09:05 AM"
 */
export function convert24To12Hour(time24) {
  if (!time24) return "10:00 AM";
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  const meridian = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${meridian}`;
}

/**
 * Convert 12-hour string "hh:mm AM/PM" to 24-hour "HH:MM" for <input type="time">
 * @param {string} time12 - e.g. "02:30 PM", "9:05 AM"
 * @returns {string} e.g. "14:30", "09:05"
 */
export function convert12To24Hour(time12) {
  const totalMins = parseTimeToMinutes(time12);
  if (totalMins === null) return "10:00";
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Get current local time formatted as "hh:mm AM/PM", optionally adding minutes offset
 * @param {number} offsetMinutes - Minutes to add (e.g. 1 for testing 1 min from now)
 * @returns {string} e.g. "11:35 AM"
 */
export function getCurrentTime12Hour(offsetMinutes = 0) {
  const date = new Date(Date.now() + offsetMinutes * 60000);
  let h = date.getHours();
  const m = date.getMinutes();
  const meridian = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${meridian}`;
}

/**
 * Convert reminder date & time into a JavaScript Date object for sorting & comparisons
 * @param {Object} rem - Reminder object with { date, time }
 * @returns {Date}
 */
export function getReminderDateObject(rem) {
  const today = getTodayDateStr(0);
  const dateStr = rem.date || today;
  const mins = parseTimeToMinutes(rem.time) || 0;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  const [y, m, d] = dateStr.split('-').map(num => parseInt(num, 10));
  return new Date(y, (m || 1) - 1, d || 1, hours, minutes, 0, 0);
}

/**
 * Determine if a reminder is "Upcoming"
 * Criteria:
 * - NOT completed
 * - Scheduled for today or a future date
 * @param {Object} rem
 * @returns {boolean}
 */
export function isReminderUpcoming(rem) {
  if (!rem) return false;
  // Completed reminders always go to Previous
  if (rem.is_completed) return false;

  // All uncompleted/pending reminders remain in Upcoming so elders and caregivers never lose track of scheduled tasks
  return true;
}

/**
 * Determine if a reminder is "Previous"
 * Criteria:
 * - Completed (marked done by elder or caregiver)
 * @param {Object} rem
 * @returns {boolean}
 */
export function isReminderPast(rem) {
  if (!rem) return false;
  return Boolean(rem.is_completed);
}

/**
 * Check if a reminder is due right now
 * @param {string} reminderTimeStr - e.g. "11:32 AM"
 * @param {string} reminderDateStr - optional "YYYY-MM-DD"
 * @param {number} toleranceMinutes - allow trigger if within X minutes
 * @returns {boolean} True if due now
 */
export function isReminderDueNow(reminderTimeStr, reminderDateStr = null, toleranceMinutes = 1) {
  // If reminder specifies a date, ensure it matches today's date
  if (reminderDateStr) {
    const today = getTodayDateStr(0);
    const cleanDate = String(reminderDateStr).slice(0, 10);
    if (cleanDate !== today) return false;
  }

  const reminderMins = parseTimeToMinutes(reminderTimeStr);
  if (reminderMins === null) return false;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // Due if current minute matches or within tolerance
  const diff = currentMins - reminderMins;
  return diff >= 0 && diff <= toleranceMinutes;
}
