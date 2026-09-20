import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Nettoyage préventif d'anciens dev-sw.js pouvant bloquer l'affichage sur mobile
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        if (reg.active?.scriptURL.includes('dev-sw.js')) {
          console.log('Désenregistrement de l\'ancien dev-sw:', reg.active.scriptURL);
          reg.unregister();
        }
      }
    }).catch(() => {});
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

