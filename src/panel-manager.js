import { generatePanelHTML } from './panel-template.js';

/**
 * Creates or updates the panel with calendar data
 * @param {Map} colorTotals - Map of color IDs to total minutes
 * @param {Map} colorMap - Map of color IDs to color information
 * @param {Map} colorIdToRgb - Map of color IDs to RGB color strings
 */
function displayTotal(colorTotals, colorMap = null, colorIdToRgb = null) {
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
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
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

  // Sort colors by duration (descending)
  const sortedColors = Array.from(colorTotals.entries())
    .sort((a, b) => b[1] - a[1]);

  // Generate the HTML content
  const isCollapsed = totalDisplay.dataset.collapsed === 'true';
  totalDisplay.innerHTML = generatePanelHTML({
    isCollapsed,
    grandTotal,
    sortedColors,
    colorMap,
    colorIdToRgb
  });

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

  // Add refresh button handler
  const refreshButton = totalDisplay.querySelector('.refresh-button');
  refreshButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent drag from starting
    console.log('Manual refresh requested');
    // We'll need to pass the fetchCalendarData function or use a custom event
    document.dispatchEvent(new CustomEvent('supercal:refresh'));
  });

  // Clear the updating flag
  setTimeout(() => {
    totalDisplay.dataset.updating = 'false';
  }, 0);
}

/**
 * Makes an element draggable
 * @param {HTMLElement} element - The element to make draggable
 */
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

/**
 * Ensures the panel is visible if we have data
 * @param {Function} calculateFromApiData - Function to recalculate data if needed
 */
function ensurePanelVisible(calculateFromApiData) {
  const totalDisplay = document.getElementById('calendar-time-total');
  if (!totalDisplay && window.apiCalendarData) {
    // If we have data but no panel, recreate it
    calculateFromApiData();
  }
}

/**
 * Saves the panel state before page unload
 */
function savePanelState() {
  const totalDisplay = document.getElementById('calendar-time-total');
  if (totalDisplay) {
    const rect = totalDisplay.getBoundingClientRect();
    const state = {
      top: rect.top,
      left: rect.left,
      collapsed: totalDisplay.dataset.collapsed === 'true'
    };
    localStorage.setItem('supercal_state', JSON.stringify(state));
  }
}

// Export the functions
export {
  displayTotal,
  makeDraggable,
  ensurePanelVisible,
  savePanelState
}; 