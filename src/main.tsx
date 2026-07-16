try {
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get: () => originalFetch,
    set: () => {
      console.warn('Ignored attempt to override window.fetch');
    },
    configurable: true
  });
} catch (e) {
  console.warn("Could not patch window.fetch", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
