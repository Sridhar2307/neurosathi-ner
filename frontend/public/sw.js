// Service Worker for NeuroSathi NER
// Handles system notification bar pop-ups even when browser tabs are in background or closed

const CACHE_NAME = 'neurosathi-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming messages from the frontend application
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        icon: '/brain-logo.svg',
        badge: '/favicon.svg',
        vibrate: [300, 150, 300, 150, 300],
        requireInteraction: true,
        tag: options?.tag || 'neurosathi-reminder',
        renotify: true,
        data: options?.data || {},
        actions: [
          { action: 'open', title: 'Open Reminder' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        ...options
      })
    );
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
