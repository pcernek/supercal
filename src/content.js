function calculateTotalTime() {
  const events = document.querySelectorAll('[data-eventchip]');
  let totalMinutes = 0;

  events.forEach(event => {
    // Look for the time div with class gVNoLb
    const timeElement = event.querySelector('.gVNoLb');
    if (!timeElement) return;

    const timeText = timeElement.textContent;
    console.log('Found event time:', timeText); // Debug log

    // Handle time formats like "09:00 – 10:00"
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);

    if (timeMatch) {
      const [_, startHour, startMin, endHour, endMin] = timeMatch;

      const start = convertToMinutes(startHour, startMin);
      const end = convertToMinutes(endHour, endMin);

      if (end > start) {
        totalMinutes += end - start;
      }
      console.log(`Event duration: ${end - start} minutes`); // Debug log
    }
  });

  displayTotal(totalMinutes);
}

function convertToMinutes(hour, minutes) {
  return parseInt(hour) * 60 + parseInt(minutes);
}

function displayTotal(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let totalDisplay = document.getElementById('calendar-time-total');
  if (!totalDisplay) {
    totalDisplay = document.createElement('div');
    totalDisplay.id = 'calendar-time-total';
    totalDisplay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1a73e8;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      z-index: 9999;
      font-family: 'Google Sans',Roboto,Arial,sans-serif;
    `;
    document.body.appendChild(totalDisplay);
  }

  totalDisplay.textContent = `Total Time: ${hours}h ${minutes}m`;
}

// Wait for the calendar to fully load
function init() {
  // Initial calculation
  calculateTotalTime();

  // Recalculate when view changes
  const observer = new MutationObserver((mutations) => {
    calculateTotalTime();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Make sure the page is loaded before running
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 