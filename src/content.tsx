import React from 'react';
import { createRoot } from 'react-dom/client';
import { Panel } from './components/Panel';
import { ICalendarEvent, IColorInfo, IPanelState } from './types';
import { detectVisibleDateRange, isValidCalendarView } from './utils';

// Store API data
let apiCalendarData: ICalendarEvent[] | null = null;
let apiColorDefinitions: Map<string, IColorInfo> | null = null;

// Track the last fetch time and current date range to prevent unnecessary fetches
let isFetching = false;
let lastUrl = window.location.href;

// Function to fetch calendar data automatically
function fetchCalendarData() {
  // Prevent fetching if already in progress
  if (isFetching) {
    console.log('Fetch already in progress, skipping');
    return;
  }

  const newDateRange = detectVisibleDateRange();
  console.log('Fetching calendar data for range:', newDateRange.startDate, 'to', newDateRange.endDate);

  // Set fetching flag to prevent multiple simultaneous requests
  isFetching = true;

  chrome.runtime.sendMessage({
    action: 'getCalendarEvents',
    timeMin: newDateRange.startDate.toISOString(),
    timeMax: newDateRange.endDate.toISOString()
  }, (response) => {
    isFetching = false;

    if (response && response.success) {
      console.log('Successfully fetched calendar data');
      apiCalendarData = response.data;
      apiColorDefinitions = response.colors;

      // Update the panel with new data
      updatePanel();
    } else {
      console.error('Failed to fetch calendar data:', response?.error);
    }
  });
}

// Function to update the panel with current data
function updatePanel() {
  if (!apiCalendarData || !apiColorDefinitions) {
    return;
  }

  // Calculate color totals
  const colorTotals = new Map<string, number>();
  let grandTotal = 0;

  apiCalendarData.forEach(event => {
    const colorId = event.colorId || 'default';
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes

    colorTotals.set(colorId, (colorTotals.get(colorId) || 0) + duration);
    grandTotal += duration;
  });

  // Sort colors by duration
  const sortedColors = Array.from(colorTotals.entries())
    .sort((a, b) => b[1] - a[1]);

  // Create color ID to RGB mapping
  const colorIdToRgb = new Map<string, string>();
  apiColorDefinitions.forEach((color, id) => {
    colorIdToRgb.set(id, color.background);
  });

  // Get saved panel state
  const savedState = JSON.parse(localStorage.getItem('supercal_state') || '{}') as IPanelState;

  // Create or update the panel container
  let container = document.getElementById('calendar-time-total');
  if (!container) {
    container = document.createElement('div');
    container.id = 'calendar-time-total';
    document.body.appendChild(container);
  }

  // Render the panel
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Panel
        isCollapsed={savedState.collapsed || false}
        grandTotal={grandTotal}
        sortedColors={sortedColors}
        colorMap={apiColorDefinitions}
        colorIdToRgb={colorIdToRgb}
        onRefresh={fetchCalendarData}
        onToggleCollapse={() => {
          const newState = {
            ...savedState,
            collapsed: !savedState.collapsed
          };
          localStorage.setItem('supercal_state', JSON.stringify(newState));
          updatePanel();
        }}
      />
    </React.StrictMode>
  );
}

// Function to ensure the panel is visible
function ensurePanelVisible() {
  const container = document.getElementById('calendar-time-total');
  if (container) {
    container.style.display = 'block';
  }
}

// Initialize the panel
function initializePanel() {
  if (isValidCalendarView()) {
    fetchCalendarData();
    ensurePanelVisible();
  }
}

// Listen for URL changes
function handleUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    if (isValidCalendarView()) {
      fetchCalendarData();
      ensurePanelVisible();
    }
  }
}

// Set up event listeners
window.addEventListener('load', initializePanel);
window.addEventListener('popstate', handleUrlChange);
window.addEventListener('hashchange', handleUrlChange);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === 'authStatusChanged' && message.status === 'authenticated') {
    fetchCalendarData();
  }
}); 