function calculateTotalTime() {
  const events = document.querySelectorAll('[role="gridcell"] [role="button"]');
  let totalMinutes = 0;

  events.forEach(event => {
    const timeElement = event.querySelector('[data-text-as-pseudo-element]');
    if (!timeElement) return;

    const timeText = timeElement.getAttribute('data-text-as-pseudo-element');
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i);

    if (timeMatch) {
      const [_, startHour, startMin, startMeridiem, endHour, endMin, endMeridiem] = timeMatch;

      const start = convertToMinutes(startHour, startMin, startMeridiem);
      const end = convertToMinutes(endHour, endMin, endMeridiem);

      totalMinutes += end - start;
    }
  });

  displayTotal(totalMinutes);
}

function convertToMinutes(hour, minutes, meridiem) {
  hour = parseInt(hour);
  minutes = parseInt(minutes);

  if (meridiem) {
    if (meridiem.toLowerCase() === 'pm' && hour !== 12) hour += 12;
    if (meridiem.toLowerCase() === 'am' && hour === 12) hour = 0;
  }

  return hour * 60 + minutes;
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
      top: 20px;
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

// Initial calculation
calculateTotalTime();

// Recalculate when view changes
const observer = new MutationObserver(() => {
  calculateTotalTime();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 