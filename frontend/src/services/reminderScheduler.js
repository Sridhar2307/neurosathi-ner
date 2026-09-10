/**
 * Reminder Scheduling & Time Utilities
 * Handles parsing, 12h/24h conversion, and due-time checking for elderly reminders.
 */

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
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Check if a reminder is due right now
 * @param {string} reminderTimeStr - e.g. "11:32 AM"
 * @param {number} toleranceMinutes - allow trigger if within X minutes
 * @returns {boolean} True if due now
 */
export function isReminderDueNow(reminderTimeStr, toleranceMinutes = 1) {
  const reminderMins = parseTimeToMinutes(reminderTimeStr);
  if (reminderMins === null) return false;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // Due if current minute matches or within tolerance
  const diff = currentMins - reminderMins;
  return diff >= 0 && diff <= toleranceMinutes;
}
