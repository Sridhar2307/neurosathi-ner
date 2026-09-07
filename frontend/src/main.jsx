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
