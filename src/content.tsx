import React from 'react';
import { createRoot } from 'react-dom/client';
import { Panel } from './components/Panel';
import { isValidCalendarView } from './utils';

function initializePanel() {
  if (!isValidCalendarView()) {
    return;
  }

  // Create or get the container
  let container = document.getElementById('calendar-time-total');
  if (!container) {
    container = document.createElement('div');
    container.id = 'calendar-time-total';
    container.style.position = 'fixed';
    container.style.top = '100px';
    container.style.left = '100px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  // Render the panel with minimal props
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Panel
        isCollapsed={false}
        grandTotal={0}
        sortedColors={[]}
        colorMap={new Map()}
        colorIdToRgb={new Map()}
        onRefresh={() => { }}
        onToggleCollapse={() => { }}
      />
    </React.StrictMode>
  );
}

// Initialize when the page loads
window.addEventListener('load', initializePanel); 