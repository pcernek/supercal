import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const containerId = 'supercal-content';

function renderReactApp() {
  // Create or get the container
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Initialize when the page loads
window.addEventListener('load', renderReactApp);
