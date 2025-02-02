function calculateTotalTime() {
  const events = document.querySelectorAll('[data-eventchip]');
  const colorTotals = new Map();

  events.forEach(event => {
    const timeElement = event.querySelector('.gVNoLb');
    if (!timeElement) return;

    const timeText = timeElement.textContent;
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);

    if (timeMatch) {
      const [_, startHour, startMin, endHour, endMin] = timeMatch;
      const start = convertToMinutes(startHour, startMin);
      const end = convertToMinutes(endHour, endMin);

      if (end > start) {
        const duration = end - start;
        // Get the background color from the event div
        const backgroundColor = event.style.backgroundColor || 'rgb(3, 155, 229)'; // Default blue

        // Add to color total
        const current = colorTotals.get(backgroundColor) || 0;
        colorTotals.set(backgroundColor, current + duration);
      }
    }
  });

  displayTotal(colorTotals);
}

function convertToMinutes(hour, minutes) {
  return parseInt(hour) * 60 + parseInt(minutes);
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
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

    // Calculate initial position at bottom right
    const initialTop = window.innerHeight - 200; // Approximate initial height
    const initialLeft = window.innerWidth - 220; // Account for width + margin

    totalDisplay.style.cssText = `
      position: fixed;
      top: ${initialTop}px;
      left: ${initialLeft}px;
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
      <div style="font-weight: bold;">Supercal</div>
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
        <div style="font-weight: 500; margin-right: 8px;">Total Time:</div>
        <div style="font-weight: bold;">${formatDuration(grandTotal)}</div>
      </div>
  `;

  colorTotals.forEach((minutes, color) => {
    content += `
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 12px; height: 12px; background: ${color}; margin-right: 8px; border-radius: 2px;"></div>
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
    }
  }
}

function init() {
  // Initial calculation
  calculateTotalTime();

  // Recalculate when view changes, but ignore mutations to our display
  const observer = new MutationObserver((mutations) => {
    const relevantChange = mutations.some(mutation => {
      return !mutation.target.id?.includes('calendar-time-total');
    });

    if (relevantChange) {
      calculateTotalTime();
    }
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