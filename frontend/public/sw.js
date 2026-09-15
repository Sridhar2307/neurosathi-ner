// Service Worker for NeuroSathi NER
// Handles system notification bar pop-ups even when browser tabs are in background or closed

const CACHE_NAME = 'neurosathi-sw-v3';

// In-memory list of scheduled reminder alarms
let scheduledAlarms = [];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Periodic check function for any due alarms
function checkDueAlarms() {
  const now = Date.now();
  const due = scheduledAlarms.filter(a => a.targetTimeMs && Math.abs(now - a.targetTimeMs) <= 60000 && !a.fired);

  due.forEach(alarm => {
    alarm.fired = true;
    self.registration.showNotification(`🚨 ${alarm.title || 'Reminder Alert'}`, {
      body: `${alarm.time || ''} - ${alarm.detail || 'Scheduled routine due now.'}`,
      icon: '/brain-logo.svg',
      badge: '/favicon.svg',
      vibrate: [300, 150, 300, 150, 300],
      requireInteraction: true,
      tag: `rem-${alarm.id}-${alarm.targetTimeMs}`,
      renotify: true,
      data: { url: '/', reminderId: alarm.id },
      actions: [
        { action: 'open', title: 'Open NeuroSathi' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  });

  // Keep future alarms
  scheduledAlarms = scheduledAlarms.filter(a => !a.fired && a.targetTimeMs > (now - 60000));
}

// Background heartbeat every 15 seconds to check alarms
setInterval(checkDueAlarms, 15000);

// Handle incoming messages from the frontend application
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Immediate notification trigger
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        icon: '/brain-logo.svg',
        badge: '/favicon.svg',
        vibrate: [300, 150, 300, 150, 300],
        requireInteraction: true,
        tag: options?.tag || `neurosathi-${Date.now()}`,
        renotify: true,
        data: options?.data || {},
        actions: [
          { action: 'open', title: 'Open NeuroSathi' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        ...options
      })
    );
  }

  // Schedule upcoming reminders for background alerting
  if (event.data.type === 'SCHEDULE_REMINDERS') {
    const list = event.data.reminders || [];
    const now = Date.now();

    list.forEach(item => {
      if (!item.targetTimeMs) return;

      const delay = item.targetTimeMs - now;
      // Add to alarms list
      scheduledAlarms.push({
        id: item.id,
        title: item.title,
        time: item.time,
        detail: item.dosage_or_detail || item.detail,
        targetTimeMs: item.targetTimeMs,
        fired: false
      });

      // If due within 24 hours, set native setTimeout in service worker
      if (delay > 0 && delay < 86400000) {
        setTimeout(() => {
          self.registration.showNotification(`🚨 ${item.title || 'Reminder Alert'}`, {
            body: `${item.time || ''} - ${item.dosage_or_detail || 'Scheduled routine due now.'}`,
            icon: '/brain-logo.svg',
            badge: '/favicon.svg',
            vibrate: [300, 150, 300, 150, 300],
            requireInteraction: true,
            tag: `rem-${item.id}`,
            renotify: true,
            data: { url: '/', reminderId: item.id },
            actions: [
              { action: 'open', title: 'Open NeuroSathi' },
              { action: 'dismiss', title: 'Dismiss' }
            ]
          });
        }, delay);
      }

      // Try Notification Triggers API if available in browser
      try {
        if (typeof TimestampTrigger !== 'undefined') {
          self.registration.showNotification(`🚨 ${item.title || 'Reminder Alert'}`, {
            body: `${item.time || ''} - ${item.dosage_or_detail || 'Scheduled routine due now.'}`,
            icon: '/brain-logo.svg',
            badge: '/favicon.svg',
            showTrigger: new TimestampTrigger(item.targetTimeMs),
            requireInteraction: true,
            tag: `rem-${item.id}`
          });
        }
      } catch (e) {
        // TimestampTrigger not available or failed
      }
    });
  }
});

// Handle notification click from the system notification bar
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the application window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle Web Push event (if backend web-push trigger is delivered)
self.addEventListener('push', (event) => {
  let data = {
    title: '⏰ NeuroSathi Reminder Alert',
    body: 'You have a scheduled reminder due now.'
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || '⏰ NeuroSathi Reminder', {
      body: data.body,
      icon: '/brain-logo.svg',
      badge: '/favicon.svg',
      vibrate: [300, 150, 300],
      requireInteraction: true,
      tag: data.tag || 'neurosathi-reminder-push',
      renotify: true,
      data: data.data || {}
    })
  );
});
