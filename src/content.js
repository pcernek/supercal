// Define color constants
const CALENDAR_COLORS = {
  'rgb(213, 0, 0)': 'Tomato',
  'rgb(230, 124, 115)': 'Flamingo',
  'rgb(244, 81, 30)': 'Tangerine',
  'rgb(246, 191, 38)': 'Banana',
  'rgb(51, 182, 121)': 'Sage',
  'rgb(11, 128, 67)': 'Basil',
  'rgb(3, 155, 229)': 'Peacock',
  'rgb(63, 81, 181)': 'Blueberry',
  'rgb(121, 134, 203)': 'Lavender',
  'rgb(142, 36, 170)': 'Grape',
  'rgb(97, 97, 97)': 'Graphite',
  'rgb(96, 255, 215)': 'Calendar color'
};

function calculateTotalTime() {
  const events = document.querySelectorAll('[data-eventchip]');
  const colorTotals = new Map();
  const processedEvents = new Map();

  // Use Object.keys to get preset colors
  const presetColors = Object.keys(CALENDAR_COLORS);

  // First pass: collect the most current time for each event ID
  events.forEach(event => {
    const eventId = event.getAttribute('data-eventid');
    const timeElement = event.querySelector('.gVNoLb');
    if (!timeElement) return;

    // Always update the processed event, this ensures we get the most current time
    processedEvents.set(eventId, event);
  });

  // Second pass: process only the final version of each event
  processedEvents.forEach(event => {
    const timeElement = event.querySelector('.gVNoLb');
    const timeText = timeElement.textContent;
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);

    if (timeMatch) {
      const [_, startHour, startMin, endHour, endMin] = timeMatch;
      const start = convertToMinutes(startHour, startMin);
      const end = convertToMinutes(endHour, endMin);

      if (end > start) {
        const duration = end - start;
        const backgroundColor = event.style.backgroundColor || 'rgb(3, 155, 229)';

        // Find closest preset color
        const closestColor = findClosestColor(backgroundColor, presetColors);

        // Add to color total
        const current = colorTotals.get(closestColor) || 0;
        colorTotals.set(closestColor, current + duration);
      }
    }
  });

  displayTotal(colorTotals);
}

function convertToMinutes(hour, minutes) {
  return parseInt(hour) * 60 + parseInt(minutes);
}

function formatDuration(minutes) {
  const hours = minutes / 60;
  return `${hours.toFixed(2)} h`;
}

function displayTotal(colorTotals) {
  let totalDisplay = document.getElementById('calendar-time-total');
  const displayId = 'calendar-time-total';

  // Skip if we're already updating this element to avoid infinite loops
  if (document.getElementById(displayId)?.dataset.updating === 'true') {
    return;
  }

  if (!totalDisplay) {
    totalDisplay = document.createElement('div');
    totalDisplay.id = displayId;

    // Get saved position or use default
    const savedState = JSON.parse(localStorage.getItem('supercal_state') || '{}');
    const defaultTop = window.innerHeight - 200;
    const defaultLeft = window.innerWidth - 220;

    totalDisplay.style.cssText = `
      position: fixed;
      top: ${savedState.top || defaultTop}px;
      left: ${savedState.left || defaultLeft}px;
      background: white;
      color: #333;
      padding: 0;
      border-radius: 8px;
      z-index: 9999;
      font-family: 'Google Sans',Roboto,Arial,sans-serif;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      cursor: default;
      min-width: 200px;
      width: max-content;
    `;

    // Restore collapsed state
    if (savedState.collapsed) {
      totalDisplay.dataset.collapsed = 'true';
    }

    document.body.appendChild(totalDisplay);

    // Add drag functionality
    makeDraggable(totalDisplay);
  }

  // Mark that we're updating
  totalDisplay.dataset.updating = 'true';

  // Calculate grand total
  const grandTotal = Array.from(colorTotals.values()).reduce((sum, curr) => sum + curr, 0);

  // Create the HTML content with a handle and collapse toggle
  let content = `
    <div class="drag-handle" style="
      padding: 8px 12px;
      background: #f1f3f4;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      cursor: grab;
      border-bottom: 1px solid #dadce0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    ">
      <div style="display: flex; align-items: center;">
        <img src="${chrome.runtime.getURL('icon48.png')}" 
             width="16" 
             height="16" 
             style="margin-right: 8px;"
        >
        <div style="font-weight: bold;">Supercal</div>
      </div>
      <div class="collapse-toggle" style="
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
      ">
        ${totalDisplay?.dataset.collapsed === 'true' ? '▼' : '▲'}
      </div>
    </div>
    <div class="card-body" style="
      padding: 12px;
      display: ${totalDisplay?.dataset.collapsed === 'true' ? 'none' : 'block'};
      user-select: text;
    ">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="font-weight: 500; margin-right: 8px;">Total:</div>
        <div style="font-weight: bold;">${formatDuration(grandTotal)}</div>
      </div>
  `;

  colorTotals.forEach((minutes, color) => {
    content += `
      <div style="
        display: flex; 
        align-items: center; 
        margin: 4px 0;
        position: relative;
      " 
      title="${CALENDAR_COLORS[color] || 'Custom color'}"
      >
        <div style="
          width: 12px; 
          height: 12px; 
          background: ${color}; 
          margin-right: 8px; 
          border-radius: 2px;
        "></div>
        <div>${formatDuration(minutes)}</div>
      </div>
    `;
  });

  content += '</div>';
  totalDisplay.innerHTML = content;

  // Add collapse toggle handler
  const toggle = totalDisplay.querySelector('.collapse-toggle');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent drag from starting
    const isCollapsed = totalDisplay.dataset.collapsed === 'true';
    totalDisplay.dataset.collapsed = !isCollapsed;
    const body = totalDisplay.querySelector('.card-body');
    body.style.display = !isCollapsed ? 'none' : 'block';
    toggle.textContent = !isCollapsed ? '▼' : '▲';

    // Save collapsed state
    const state = JSON.parse(localStorage.getItem('supercal_state') || '{}');
    state.collapsed = !isCollapsed;
    localStorage.setItem('supercal_state', JSON.stringify(state));
  });

  // Clear the updating flag
  setTimeout(() => {
    totalDisplay.dataset.updating = 'false';
  }, 0);
}

function makeDraggable(element) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  element.addEventListener('mousedown', dragStart, false);
  document.addEventListener('mousemove', drag, false);
  document.addEventListener('mouseup', dragEnd, false);

  function dragStart(e) {
    // Only allow dragging from the handle, but not from the collapse toggle
    if (!e.target.closest('.drag-handle') || e.target.closest('.collapse-toggle')) return;

    const rect = element.getBoundingClientRect();
    xOffset = rect.left;
    yOffset = rect.top;

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target.closest('.drag-handle')) {
      isDragging = true;
      e.target.style.cursor = 'grabbing';
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      // Keep the element within the viewport
      const rect = element.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      currentX = Math.min(Math.max(0, currentX), maxX);
      currentY = Math.min(Math.max(0, currentY), maxY);

      element.style.left = currentX + 'px';
      element.style.top = currentY + 'px';
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    }
  }

  function dragEnd(e) {
    if (isDragging) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;

      const handle = element.querySelector('.drag-handle');
      if (handle) {
        handle.style.cursor = 'grab';
      }

      // Save position
      const state = JSON.parse(localStorage.getItem('supercal_state') || '{}');
      state.top = currentY;
      state.left = currentX;
      localStorage.setItem('supercal_state', JSON.stringify(state));
    }
  }
}

function findClosestColor(color, presetColors) {
  // Parse RGB values from color string
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch) return presetColors[0];

  const [_, r1, g1, b1] = rgbMatch.map(Number);

  // Convert input color to HSL
  const [h1, s1, l1] = rgbToHsl(r1, g1, b1);

  let minDistance = Infinity;
  let closestColor = presetColors[0];

  for (const presetColor of presetColors) {
    const [r2, g2, b2] = presetColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/).slice(1).map(Number);
    const [h2, s2, l2] = rgbToHsl(r2, g2, b2);

    // Calculate distance with more weight on hue
    const distance = Math.abs(h1 - h2) * 2 + Math.abs(s1 - s2) + Math.abs(l1 - l2) * 0.5;

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = presetColor;
    }
  }

  return closestColor;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [h, s, l];
}

function init() {
  function isValidCalendarView() {
    return window.location.pathname.match(/\/(week|day)$/);
  }

  const observer = new MutationObserver(() => {
    const totalDisplay = document.getElementById('calendar-time-total');

    if (isValidCalendarView()) {
      calculateTotalTime();
    } else if (totalDisplay) {
      totalDisplay.remove();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial check
  if (isValidCalendarView()) {
    calculateTotalTime();
  }
}

// Make sure the page is loaded before running
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 