import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AccessibilityProvider } from './context/AccessibilityContext.jsx';
import { AppProvider } from './context/AppContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AccessibilityProvider>
  </React.StrictMode>,
);

// Register PWA Service Worker for offline capabilities & installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);

      // Force cache warm-up for all loaded scripts and link stylesheets
      if ('caches' in window) {
        const cache = await caches.open('neurosathi-pwa-v2');
        const scriptUrls = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
        const styleUrls = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
        const coreUrls = ['/', '/index.html', '/manifest.json', ...scriptUrls, ...styleUrls];
        cache.addAll(coreUrls).catch(() => {});
      }
    } catch (error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    }
  });
}

