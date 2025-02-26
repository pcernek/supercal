/**
 * Converts a hex color string to RGB format
 * @param {string} hex - Hex color code (with or without #)
 * @returns {string} RGB color in format "rgb(r, g, b)"
 */
function hexToRgb(hex) {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Formats a duration in minutes to a readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string (e.g., "2.50 h")
 */
function formatDuration(minutes) {
  const hours = minutes / 60;
  return `${hours.toFixed(2)} h`;
}

/**
 * Formats a date to a time string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Checks if two date ranges are the same
 * @param {Object} range1 - First date range with startDate and endDate
 * @param {Object} range2 - Second date range with startDate and endDate
 * @returns {boolean} True if ranges are the same
 */
function areDateRangesSame(range1, range2) {
  if (!range1 || !range2 || !range1.startDate || !range2.startDate || !range1.endDate || !range2.endDate) {
    return false;
  }

  return range1.startDate.getTime() === range2.startDate.getTime() &&
    range1.endDate.getTime() === range2.endDate.getTime();
}

/**
 * Checks if the current URL is a valid calendar view
 * @returns {boolean} True if the current page is a valid calendar view
 */
function isValidCalendarView() {
  return window.location.pathname.match(/\/(week|day|month)$/);
}

/**
 * Detects the visible date range in Google Calendar
 * @returns {Object} Object with startDate and endDate properties
 */
function detectVisibleDateRange() {
  // Try to find the date range from the UI
  let startDate, endDate;

  // Check if we're in week view
  const weekViewHeader = document.querySelector('h2[data-daterange]');
  if (weekViewHeader) {
    const dateRange = weekViewHeader.getAttribute('data-daterange');
    if (dateRange) {
      const dates = dateRange.split('–').map(d => d.trim());
      if (dates.length === 2) {
        // Parse the dates - format might be like "Feb 25 – Mar 2, 2024"
        const year = new Date().getFullYear();
        const fullDateRange = dates[1].includes(',') ?
          dates[1].split(',')[1].trim() : year.toString();

        startDate = new Date(`${dates[0]} ${fullDateRange}`);
        endDate = new Date(`${dates[1]}`);

        // Add one day to end date to include the full day
        endDate.setDate(endDate.getDate() + 1);
      }
    }
  }

  // If we couldn't detect from the UI, use current week as fallback
  if (!startDate || !endDate) {
    const today = new Date();
    startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay()); // Sunday
    endDate = new Date(today);
    endDate.setDate(startDate.getDate() + 7); // Next Sunday
  }

  return { startDate, endDate };
}

// Export the functions
export {
  hexToRgb,
  formatDuration,
  formatTime,
  areDateRangesSame,
  isValidCalendarView,
  detectVisibleDateRange
}; 