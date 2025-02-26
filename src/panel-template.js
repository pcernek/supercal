import { formatDuration } from './utils.js';

/**
 * Generates the HTML for the Supercal panel
 * @param {Object} options - Configuration options for the panel
 * @param {boolean} options.isCollapsed - Whether the panel is collapsed
 * @param {number} options.grandTotal - Total minutes across all events
 * @param {Array} options.sortedColors - Array of [colorKey, minutes] pairs sorted by duration
 * @param {Map} options.colorMap - Map of colorId to color information
 * @param {Map} options.colorIdToRgb - Map of colorId to RGB color string
 * @returns {string} HTML content for the panel
 */
function generatePanelHTML(options) {
  const {
    isCollapsed,
    grandTotal,
    sortedColors,
    colorMap,
    colorIdToRgb
  } = options;

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
      position: sticky;
      top: 0;
      z-index: 1;
    ">
      <div style="display: flex; align-items: center;">
        <img src="${chrome.runtime.getURL('icon48.png')}" 
             width="16" 
             height="16" 
             style="margin-right: 8px;"
        >
        <div style="font-weight: bold;">Supercal</div>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="font-size: 12px; color: #1a73e8; margin-right: 8px;">API Data</span>
        <div class="refresh-button" style="
          cursor: pointer;
          padding: 4px;
          margin-right: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          font-size: 14px;
        " title="Refresh data">
          ↻
        </div>
        <div class="collapse-toggle" style="
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        ">
          ${isCollapsed ? '▼' : '▲'}
        </div>
      </div>
    </div>
    <div class="card-body" style="
      padding: 12px;
      display: ${isCollapsed ? 'none' : 'block'};
      user-select: text;
    ">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="font-weight: 500; margin-right: 8px;">Total:</div>
        <div style="font-weight: bold;">${formatDuration(grandTotal)}</div>
      </div>
  `;

  // Add each color category
  sortedColors.forEach(([colorKey, minutes]) => {
    // Determine color display properties
    let displayColor, colorName;

    if (colorMap && colorIdToRgb && colorIdToRgb.has(colorKey)) {
      // Using API colors - colorKey is the colorId
      displayColor = colorIdToRgb.get(colorKey);
      colorName = `Color ${colorKey}`;
    } else {
      // Fallback for any case where we don't have color info
      displayColor = 'rgb(3, 155, 229)'; // Default Peacock color
      colorName = 'Unknown color';
    }

    const percentage = Math.round((minutes / grandTotal) * 100);

    content += `
      <div class="color-category" style="
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f1f3f4;
      ">
        <div style="
          display: flex; 
          align-items: center; 
          margin: 4px 0;
          position: relative;
          justify-content: space-between;
        " 
        title="${colorName}"
        >
          <div style="display: flex; align-items: center;">
            <div style="
              width: 12px; 
              height: 12px; 
              background: ${displayColor}; 
              margin-right: 8px; 
              border-radius: 2px;
            "></div>
            <div>${colorName}</div>
          </div>
          <div style="font-weight: 500;">
            ${formatDuration(minutes)} (${percentage}%)
          </div>
        </div>
      </div>
    `;
  });

  content += '</div>';
  return content;
}

// Export the function
export { generatePanelHTML }; 