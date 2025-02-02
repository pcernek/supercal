# <img src="assets/icons/icon48.png" width="24" alt="Supercal icon" style="vertical-align: middle"> supercal 🦸📆🌈

A Google Chrome extension that augments Google Calendar.

<img 
  src="/assets/screenshots/screenshot-1.1-640x400.jpg" 
  width="300" 
  alt="Screenshot of the extension.">

## Features
- Calculates total time for all events in current view
- Breaks down time by event color
- Draggable and collapsible interface
- Remembers position and state between refreshes

## Development

### One-time build
./build/package.sh

### Watch mode
Rebuilds on file changes:
./build/package.sh -w

### Testing locally
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist/unpacked` directory
4. Open Google Calendar to test the extension

To apply code changes:
1. Make your changes
2. Run the build script (or use watch mode)
3. Click the refresh icon (🔄) on the extension card in `chrome://extensions`
4. Refresh your Google Calendar tab

### Files
- `manifest.json` - Extension configuration
- `src/content.js` - Main extension code
- `assets/icons/*` - Extension icons
