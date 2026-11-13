import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/adaptive.css'

// Reapply mode on initial load before React mounts
// Ensures no visual leak on public pages (Landing, Login, Register)
try {
  const currentPath = window.location.pathname;
  const isPublicPage = currentPath === '/' || currentPath.startsWith('/auth') || currentPath === '/login' || currentPath === '/register';
  const root = document.documentElement;

  if (isPublicPage) {
    // 🛡️ ISOLATE PUBLIC PAGES: Remove all accessibility mode classes and reset font size
    root.setAttribute('data-disability', 'none');
    root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
    root.style.fontSize = '100%';
  } else {
    const persistedData = localStorage.getItem('bintangai-accessibility');
    if (persistedData) {
      const { state } = JSON.parse(persistedData);
      const savedMode = state?.mode;

      if (savedMode) {
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
