import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Safety Patch for Leaflet: prevent _leaflet_pos error on unmounted elements or async animation frames
if (typeof window !== 'undefined' && L && L.DomUtil) {
  try {
    const origGetPosition = L.DomUtil.getPosition;
    L.DomUtil.getPosition = function (el: any) {
      if (!el) {
        return new L.Point(0, 0);
      }
      if (origGetPosition) {
        return origGetPosition.call(L.DomUtil, el);
      }
      return el._leaflet_pos || new L.Point(0, 0);
    };
  } catch {
    // ignore
  }
}

// Register Service Worker for offline resilience and product image caching
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

