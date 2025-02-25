# Supercal Build Process

This directory contains the build script to build the Supercal extension for different environments.

## Prerequisites

- `jq` - Command-line JSON processor (required for parsing config files)
  - Install on macOS: `brew install jq`
  - Install on Ubuntu/Debian: `apt-get install jq`
  - Install on Windows: Download from [stedolan.github.io/jq](https://stedolan.github.io/jq/)

## Setup

1. Create a development OAuth client ID in Google Cloud Console
2. Update `config/config.dev.json` with your development client ID
3. Make sure the production client ID is correct in `config/config.prod.json`

## Build Commands

### Development Build

```bash
# Basic development build
./build/build.sh

# Or explicitly specify development environment
./build/build.sh -e dev

# Development build with watch mode (auto-rebuild on changes)
./build/build.sh -w
```

The watch mode automatically detects changes to source files and rebuilds the extension. It uses a simple file hashing approach and doesn't require any external tools.

### Production Build

```bash
# Production build for Chrome Web Store submission
./build/build.sh -e prod
```

## Output

- Development build: `dist/unpacked/`
- Production build: `dist/production/` and `dist/supercal.zip`

## Loading the Extension

### Development

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist/unpacked` directory
4. After making changes and rebuilding, click the refresh icon on the extension card

### Production

Upload `dist/supercal.zip` to the Chrome Web Store Developer Dashboard.

## How It Works

1. The build script uses `jq` to read the client ID from the appropriate config file
2. It generates a manifest.json file by replacing the client ID in manifest.template.json
3. All necessary files are copied to the dist directory
4. For production, a ZIP file is created for Chrome Web Store submission 