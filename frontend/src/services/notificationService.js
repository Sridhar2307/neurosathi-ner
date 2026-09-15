/**
 * System Notification & Service Worker Service
 * Handles requesting permissions, registering the service worker,
 * and displaying native OS / browser notification bar pop-ups.
 */

class NotificationService {
  constructor() {
    this.swRegistration = null;
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    this.init();
  }

  async init() {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        this.swRegistration = reg;
        console.log('[NotificationService] Service Worker registered with scope:', reg.scope);
      } catch (err) {
        console.warn('[NotificationService] Service Worker registration failed:', err);
      }
    }
  }

  getPermission() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission;
  }

  isPermissionGranted() {
    return this.isSupported && Notification.permission === 'granted';
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('[NotificationService] Notifications are not supported on this browser.');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[NotificationService] Permission request result:', permission);
      return permission;
    } catch (err) {
      console.error('[NotificationService] Error requesting notification permission:', err);
      return Notification.permission;
    }
  }

  /**
   * Display a native OS notification in the system notification bar
   * @param {Object} options - { title, body, tag, icon, data, actions }
   */
  async showSystemNotification({ title, body, tag, icon, data, actions } = {}) {
    if (!this.isSupported) return false;

    // Check permission
    if (Notification.permission !== 'granted') {
      const perm = await this.requestPermission();
      if (perm !== 'granted') return false;
    }

    const notifTitle = title || '⏰ NeuroSathi Reminder';
    const notifOptions = {
      body: body || 'You have a scheduled memory routine due right now.',
      icon: icon || '/brain-logo.svg',
      badge: '/favicon.svg',
      tag: tag || `neurosathi-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 300],
      data: data || { url: window.location.origin }
    };

    if (actions && Array.isArray(actions)) {
      notifOptions.actions = actions;
    }

    try {
      // 1. Prefer Service Worker registration (native system tray / lock screen support)
      if (this.swRegistration && 'showNotification' in this.swRegistration) {
        await this.swRegistration.showNotification(notifTitle, notifOptions);
        return true;
      }

      // Check if navigator.serviceWorker has ready registration
      if ('serviceWorker' in navigator) {
        const readyReg = await navigator.serviceWorker.ready;
        if (readyReg && 'showNotification' in readyReg) {
          await readyReg.showNotification(notifTitle, notifOptions);
          return true;
        }
      }

      // 2. Fallback to standard Window Notification API
      const notif = new Notification(notifTitle, notifOptions);
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (err) {
      console.warn('[NotificationService] showNotification error, trying fallback:', err);
      try {
        const fallback = new Notification(notifTitle, notifOptions);
        fallback.onclick = () => {
          window.focus();
          fallback.close();
        };
        return true;
      } catch (innerErr) {
        console.error('[NotificationService] System notification failed:', innerErr);
        return false;
      }
    }
  }

  /**
   * Schedule upcoming reminders into the Service Worker so alerts fire even if the tab is closed
   * @param {Array} reminders - Array of reminder objects
   */
  async syncScheduledReminders(reminders = []) {
    if (!this.isSupported || !Array.isArray(reminders)) return;

    try {
      const now = Date.now();
      const payload = [];

      for (const rem of reminders) {
        if (!rem || rem.is_completed || !rem.time) continue;

        // Parse date and time
        const todayStr = new Date().toISOString().slice(0, 10);
        const dateStr = String(rem.date || todayStr).slice(0, 10);
        
        // Parse time to hours and minutes
        const timeMatch = rem.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!timeMatch) continue;

        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const meridian = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        const [y, m, d] = dateStr.split('-').map(num => parseInt(num, 10));
        const targetDate = new Date(y, (m || 1) - 1, d || 1, hours, minutes, 0, 0);
        const targetTimeMs = targetDate.getTime();

        // Only schedule future items
        if (targetTimeMs > now) {
          payload.push({
            id: rem.id,
            title: rem.title,
            time: rem.time,
            date: dateStr,
            dosage_or_detail: rem.dosage_or_detail || '',
            targetTimeMs
          });
        }
      }

      if (payload.length === 0) return;

      // 1. Post to active Service Worker controller
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCHEDULE_REMINDERS',
          reminders: payload
        });
      } else if (navigator.serviceWorker) {
        const readyReg = await navigator.serviceWorker.ready;
        if (readyReg?.active) {
          readyReg.active.postMessage({
            type: 'SCHEDULE_REMINDERS',
            reminders: payload
          });
        }
      }
    } catch (err) {
      console.warn('[NotificationService] syncScheduledReminders warning:', err);
    }
  }

  /**
   * Send a test notification to verify system notification bar display
   */
  async testNotification() {
    return this.showSystemNotification({
      title: '🔔 NeuroSathi Notification Test',
      body: 'Success! Your reminder alerts will pop up directly in your notification bar.',
      tag: 'test-notification'
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
