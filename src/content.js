import {
  hexToRgb,
  isValidCalendarView,
  detectVisibleDateRange
} from './utils.js';

// Import panel management functions
import {
  displayTotal,
  ensurePanelVisible,
  savePanelState
} from './panel-manager.js';

// Store API data
let apiCalendarData = null;
let apiColorDefinitions = null;

// Track the last fetch time and current date range to prevent unnecessary fetches
let lastFetchTime = 0;
let currentDateRange = { startDate: null, endDate: null };
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

      // Update tracking variables
      lastFetchTime = Date.now();
      currentDateRange = newDateRange;

      calculateFromApiData();
    } else {
      console.error('Failed to fetch calendar data:', response?.error || 'Unknown error');
    }
  });
}

// Function to check if URL has changed (for navigation detection)
function checkUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    console.log('URL changed from', lastUrl, 'to', currentUrl);
    lastUrl = currentUrl;
    return true;
  }
  return false;
}

// Listen for messages from the popup (only for authentication notifications)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'authStatusChanged' && request.status === 'authenticated') {
    // User just authenticated, fetch data
    fetchCalendarData();
    sendResponse({ success: true });
  }
  return true;
});

// Listen for the custom refresh event
document.addEventListener('supercal:refresh', () => {
  fetchCalendarData();
});

function calculateFromApiData() {
  if (!apiCalendarData || !apiCalendarData.items || !Array.isArray(apiCalendarData.items)) {
    console.error('Invalid API data format:', apiCalendarData);
    return;
  }

  console.log('Processing API data:', apiCalendarData);

  // Create a map of colorId to background color from API color definitions
  const colorMap = new Map();
  const colorNames = new Map();

  if (apiColorDefinitions && apiColorDefinitions.event) {
    Object.entries(apiColorDefinitions.event).forEach(([id, colorInfo]) => {
      colorMap.set(id, colorInfo.background);
      colorNames.set(id, `Color ${id}`); // Default name
    });

    console.log('Color definitions from API:', apiColorDefinitions);
  }

  const colorTotals = new Map();
  const colorIdToRgb = new Map(); // Map to store colorId to RGB mapping for display

  // Process each event from the API data
  apiCalendarData.items.forEach(event => {
    // Skip events without start or end times (all-day events)
    if (!event.start || !event.end || !event.start.dateTime || !event.end.dateTime) {
      return;
    }

    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);

    // Calculate duration in minutes
    const durationMinutes = (endTime - startTime) / (1000 * 60);

    // Skip events with zero or negative duration
    if (durationMinutes <= 0) {
      return;
    }

    // Get the color from the event
    let eventColor = 'rgb(3, 155, 229)'; // Default Peacock color
    let colorId = event.colorId || '7'; // Default to Peacock (7)

    // Use the color from the API color definitions if available
    if (colorId && colorMap.has(colorId)) {
      const hexColor = colorMap.get(colorId);
      eventColor = hexToRgb(hexColor);
      colorIdToRgb.set(colorId, eventColor);
    }

    // Add to color total using colorId as the key
    const colorKey = colorId;
    const current = colorTotals.get(colorKey) || 0;
    colorTotals.set(colorKey, current + durationMinutes);
  });

  displayTotal(colorTotals, colorMap, colorIdToRgb);
}

function checkAuthAndFetchData() {
  // Skip if we're already fetching
  if (isFetching) return;

  chrome.runtime.sendMessage({ action: 'getAuthToken', interactive: false }, (response) => {
    if (response && response.success) {
      // User is authenticated, fetch data
      fetchCalendarData();
    } else {
      console.log('User not authenticated. Calendar data will not be fetched.');
    }
  });
}

function init() {
  // Check authentication status first
  checkAuthAndFetchData();

  // Set up URL change detection using history API
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function () {
    originalPushState.apply(this, arguments);
    setTimeout(() => {
      if (checkUrlChange() && isValidCalendarView()) {
        console.log('History pushState detected');
        fetchCalendarData();
      }
    }, 300);
  };

  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    setTimeout(() => {
      if (checkUrlChange() && isValidCalendarView()) {
        console.log('History replaceState detected');
        fetchCalendarData();
      }
    }, 300);
  };

  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      if (checkUrlChange() && isValidCalendarView()) {
        console.log('Popstate event detected');
        fetchCalendarData();
      }
    }, 300);
  });

  // Add direct click listeners for navigation buttons
  document.addEventListener('click', (e) => {
    // Check if user clicked on navigation buttons (prev/next/today)
    const isNavButton = e.target.closest('[aria-label="Previous period"]') ||
      e.target.closest('[aria-label="Next period"]') ||
      e.target.closest('[aria-label="Today"]');

    if (isNavButton && isValidCalendarView()) {
      console.log('Navigation button clicked');
      // Force a refresh after a delay to ensure UI is updated
      setTimeout(() => {
        fetchCalendarData();
      }, 500);
    }
  });

  // Set up a MutationObserver to detect changes in the date range header
  const observer = new MutationObserver((mutations) => {
    if (!isValidCalendarView()) return;

    // Check if the date range header has changed
    const dateRangeChanged = mutations.some(mutation => {
      // Check for attribute changes on the date range header
      if (mutation.type === 'attributes' &&
        mutation.target.tagName === 'H2' &&
        mutation.target.hasAttribute('data-daterange')) {
        return true;
      }

      // Check for added nodes that contain or are the date range header
      return Array.from(mutation.addedNodes).some(node => {
        return node.nodeType === 1 && (
          node.querySelector('h2[data-daterange]') ||
          node.matches('h2[data-daterange]')
        );
      });
    });

    if (dateRangeChanged) {
      console.log('Date range header changed, fetching data');
      setTimeout(() => {
        fetchCalendarData();
      }, 300);
    }

    // Also check if our panel was removed and needs to be restored
    const panelRemoved = mutations.some(mutation => {
      return Array.from(mutation.removedNodes).some(node => {
        return node.id === 'calendar-time-total' ||
          (node.nodeType === 1 && node.querySelector('#calendar-time-total'));
      });
    });

    if (panelRemoved) {
      console.log('Panel was removed, restoring it');
      setTimeout(() => {
        ensurePanelVisible(calculateFromApiData);
      }, 300);
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-daterange'],
    characterData: false
  });

  // Also check periodically for changes in the visible date range
  let lastCheckedDateRange = null;
  setInterval(() => {
    if (!isValidCalendarView()) return;

    const currentDateRangeElement = document.querySelector('h2[data-daterange]');
    if (currentDateRangeElement) {
      const currentDateRangeText = currentDateRangeElement.getAttribute('data-daterange');
      if (currentDateRangeText && currentDateRangeText !== lastCheckedDateRange) {
        console.log('Date range changed from polling:', lastCheckedDateRange, 'to', currentDateRangeText);
        lastCheckedDateRange = currentDateRangeText;
        fetchCalendarData();
      }
    }

    // Periodically ensure our panel is visible
    ensurePanelVisible(calculateFromApiData);
  }, 2000); // Check every 2 seconds

  // Add a listener for when the page is about to unload
  window.addEventListener('beforeunload', () => {
    // Save the current state of the panel
    savePanelState();
  });

  // Check for URL changes more aggressively
  setInterval(() => {
    if (checkUrlChange() && isValidCalendarView()) {
      console.log('URL change detected by interval check');
      fetchCalendarData();
    }
  }, 1000);
}

// Make sure the page is loaded before running
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 