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
// Ensures no visual leak on public pages (Landing, Login, Register) unless manually selected
try {
  const currentPath = window.location.pathname;
  const isPublicPage = currentPath === '/' || currentPath.startsWith('/auth') || currentPath === '/login' || currentPath === '/register';
  const root = document.documentElement;

  const persistedData = localStorage.getItem('bintangai-accessibility');
  let savedMode = null;
  let isManualSelection = false;

  if (persistedData) {
    try {
      const parsed = JSON.parse(persistedData);
      savedMode = parsed?.state?.mode;
      isManualSelection = parsed?.state?.isManualSelection || false;
    } catch (e) {}
  }

  if (isPublicPage && !isManualSelection) {
    // 🛡️ ISOLATE PUBLIC PAGES BY DEFAULT: Remove all accessibility mode classes and reset font size
    root.setAttribute('data-disability', 'none');
    root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
    root.style.fontSize = '100%';
  } else if (savedMode) {
    root.classList.add(`${savedMode}-mode`);
    root.setAttribute('data-disability', savedMode);

    if (savedMode === 'tunanetra') {
      root.style.fontSize = '125%';
    } else if (savedMode === 'tunarungu') {
      root.style.fontSize = '115%';
    } else {
      root.style.fontSize = '100%';
    }
  }
} catch (e) {
  console.error("Failed to reapply accessibility mode on boot", e);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
