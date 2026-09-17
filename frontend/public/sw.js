// Service Worker for NeuroSathi NER
// Provides 100% Offline PWA Capabilities & Background Notifications / Reminders

const CACHE_NAME = 'neurosathi-pwa-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/brain-logo.svg',
  '/favicon.svg',
  '/pwa-icon.svg',
  /* INJECT_PROD_ASSETS */
];

// In-memory list of scheduled reminder alarms
let scheduledAlarms = [];

// Install Event: Pre-cache app shell assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching PWA core & production assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache non-blocking warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Delete old caches and take immediate control of clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Offline-first architecture
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Allow external fonts (Google Fonts) to pass through or serve cached
  if (!url.origin.includes(self.location.origin)) {
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      );
    }
    return;
  }

  // 1. Navigation requests (HTML SPA Routing) -> Instant Offline Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // If device is strictly offline, immediately return cached shell without waiting for network failure
        if (!navigator.onLine) {
          const cached = await caches.match(request) || await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
        }

        try {
          // Attempt network fetch with a 1.8s timeout so slow mobile connections don't hang
          const networkPromise = fetch(request);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 1800)
          );

          const response = await Promise.race([networkPromise, timeoutPromise]);
          if (response && response.status === 200) {
            const clone = response.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, clone);
            cache.put('/index.html', clone);
            cache.put('/', clone);
          }
          return response;
        } catch (err) {
          // Offline, timeout, or network down -> serve cached single-page app shell
          const cached = await caches.match(request) || await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;

          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
              <title>NeuroSathi Offline</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px 20px; background: #042f2e; color: #f0fdfa; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                .card { max-width: 420px; background: rgba(13, 148, 136, 0.2); border: 1px solid rgba(45, 212, 191, 0.3); padding: 32px 24px; border-radius: 20px; backdrop-filter: blur(8px); }
                h1 { color: #2dd4bf; margin: 0 0 12px; font-size: 24px; }
                p { color: #ccfbf1; font-size: 16px; line-height: 1.5; margin: 0 0 24px; }
                button { background: #14b8a6; color: #042f2e; border: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 12px; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>🧠 NeuroSathi NER</h1>
                <p>You are in offline mode. Please reopen the app from your home screen icon.</p>
                <button onclick="window.location.reload()">Reload App</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })()
    );
    return;
  }

  // 2. Static Assets (/assets/*, .js, .css, .svg, .png) -> Cache-First Strategy
  event.respondWith(
    (async () => {
      // Step A: Immediate cache hit
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      // Step B: Not in cache, fetch from network and cache
      try {
        const response = await fetch(request);
        if (response && response.status === 200) {
          const clone = response.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, clone);
        }
        return response;
      } catch (err) {
        // Fallback for image requests if completely offline
        if (request.destination === 'image') {
          return caches.match('/favicon.svg') || caches.match('/pwa-icon.svg');
        }
        return cached;
      }
    })()
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
      icon: '/icon-192.png',
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
        icon: '/icon-192.png',
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
            icon: '/icon-192.png',
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
            icon: '/icon-192.png',
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
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      vibrate: [300, 150, 300],
      requireInteraction: true,
      tag: data.tag || 'neurosathi-reminder-push',
      renotify: true,
      data: data.data || {}
    })
  );
});
