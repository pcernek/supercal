import React from 'react';
import { createRoot } from 'react-dom/client';
import { Panel } from './components/Panel';
import { isValidCalendarView } from './utils';
import { IColorInfo } from './types';

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

  // Dummy data for demonstration
  const dummyColors = [
    ['1', 120], // 2 hours
    ['2', 90],  // 1.5 hours
    ['3', 60],  // 1 hour
    ['4', 30],  // 30 minutes
  ] as [string, number][];

  const dummyColorMap = new Map<string, IColorInfo>([
    ['1', { id: 'Work Meetings', background: 'rgb(66, 133, 244)', foreground: '#ffffff' }],
    ['2', { id: 'Personal Time', background: 'rgb(52, 168, 83)', foreground: '#ffffff' }],
    ['3', { id: 'Project Planning', background: 'rgb(251, 188, 5)', foreground: '#000000' }],
    ['4', { id: 'Quick Syncs', background: 'rgb(234, 67, 53)', foreground: '#ffffff' }],
  ]);

  const dummyColorIdToRgb = new Map([
    ['1', 'rgb(66, 133, 244)'],  // Blue
    ['2', 'rgb(52, 168, 83)'],   // Green
    ['3', 'rgb(251, 188, 5)'],   // Yellow
    ['4', 'rgb(234, 67, 53)'],   // Red
  ]);

  const dummyGrandTotal = dummyColors.reduce((sum, [_, minutes]) => sum + minutes, 0);

  // Render the panel with dummy data
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Panel
        isCollapsed={false}
        grandTotal={dummyGrandTotal}
        sortedColors={dummyColors}
        colorMap={dummyColorMap}
        colorIdToRgb={dummyColorIdToRgb}
      />
    </React.StrictMode>
  );
}

// Initialize when the page loads
window.addEventListener('load', initializePanel); 