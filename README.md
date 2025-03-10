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
- Google Calendar API integration (optional)

## Development

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Chrome browser

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Building

To build the extension:

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the compiled extension files.

### Development Mode

To run in development mode with hot reloading:

```bash
npm run dev
# or
yarn dev
```

### Loading the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` directory
4. The extension should now be loaded and ready to use

### Environment Setup

1. **Configure OAuth Client IDs**
   - For development: Create an OAuth client ID for your local extension ID
   - For production: Create an OAuth client ID for your Chrome Web Store extension ID
   - Update the respective config files (`config/config.dev.json` and `config/config.prod.json`)

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Google Calendar API Setup (Optional)

For more reliable data access, you can set up Google Calendar API integration:

1. Go to the [Google Cloud Console](https://console.developers.google.com/) and create a new project
2. Enable the Google Calendar API for your project:
   - In the sidebar, click on "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on the API and then click "Enable"
3. Create OAuth credentials:
   - In the sidebar, click on "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Chrome Extension" as the application type
   - Enter a name for your OAuth client (e.g., "Supercal Extension")
   - For "Application ID", enter your extension ID (found in chrome://extensions)
4. Copy your Client ID and update the appropriate config file:
   - For development: Update `config/config.dev.json`
   - For production: Update `config/config.prod.json`
5. Run the appropriate build script and reload the extension

## Usage

1. Click the Supercal icon in your Chrome toolbar
2. Sign in with your Google account
3. Navigate to Google Calendar
4. The Supercal panel will appear showing your calendar time breakdown
5. Drag the panel to reposition it
6. Click the arrow to collapse/expand the panel
7. Click the refresh button to update the data

## How It Works

The extension works in two modes:

1. **DOM Scraping Mode (Default)**: Analyzes the calendar events displayed on the page
2. **API Mode**: Fetches data directly from the Google Calendar API when authorized

The API mode provides more accurate data and works even with collapsed calendar sections.

## Privacy

Supercal only accesses your Google Calendar data with your permission. Your data is processed locally in your browser and is not sent to any external servers.

## License

ISC
