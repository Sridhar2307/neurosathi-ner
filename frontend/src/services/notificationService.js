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
