// JavaScript compatibility and polyfills (core-js 3.39.0)
import 'core-js/stable';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import './index.css';

// Progressive Web App (PWA) registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        if (confirm('New version available. Reload to update?')) {
          window.location.reload();
        }
      },
      onOfflineReady() {
        console.log('Figtion is ready for offline use.');
      }
    });
  }).catch(() => {
    // development or unsupported environment fallback
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
