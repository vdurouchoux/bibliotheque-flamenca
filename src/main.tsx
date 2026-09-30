import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Gestion du Service Worker : désactivé en développement pour garantir un chargement ultra-rapide sans interception
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    if (import.meta.env.DEV) {
      // En mode développement / preview AI Studio : désinscrire tout Service Worker résiduel
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const reg of registrations) {
          reg.unregister();
        }
      }).catch(() => {});
      if ('caches' in window) {
        caches.keys().then(keys => {
          keys.forEach(key => {
            if (key.startsWith('flamenco-')) {
              caches.delete(key);
            }
          });
        }).catch(() => {});
      }
    } else {
      // En production uniquement : enregistrement pour le mode PWA autonome
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  } catch {
    // ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

