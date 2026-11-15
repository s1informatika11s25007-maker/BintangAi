import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/adaptive.css'

// Automatically clear outdated Workbox / PWA asset caches on reload
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      if (name.includes('workbox') || name.includes('vite') || name.includes('bintangai')) {
        caches.delete(name);
      }
    });
  }).catch(() => {});
}

// Reapply mode on initial load before React mounts
// Preserves the selected accessibility mode across page refreshes and reloads
try {
  const root = document.documentElement;

  const persistedData = localStorage.getItem('bintangai-accessibility');
  let savedMode = null;
  let savedModes = [];

  if (persistedData) {
    try {
      const parsed = JSON.parse(persistedData);
      savedMode = parsed?.state?.mode;
      savedModes = parsed?.state?.modes || (savedMode ? [savedMode] : []);
    } catch (e) {}
  }

  const activeMode = savedModes[0] || (savedMode && savedMode !== 'tidak_ada' ? savedMode : null);

  if (activeMode && ['tunanetra', 'tunarungu', 'tunawicara'].includes(activeMode)) {
    root.setAttribute('data-disability', activeMode);
    root.setAttribute('data-disabilities', savedModes.join(','));
    root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
    root.classList.add(`${activeMode}-mode`);

    if (activeMode === 'tunanetra') {
      root.style.fontSize = '125%';
    } else if (activeMode === 'tunarungu') {
      root.style.fontSize = '115%';
    } else {
      root.style.fontSize = '100%';
    }
  } else {
    root.setAttribute('data-disability', 'none');
    root.setAttribute('data-disabilities', 'none');
    root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
    root.style.fontSize = '100%';
  }
} catch (e) {
  console.error("Failed to reapply accessibility mode on boot", e);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
