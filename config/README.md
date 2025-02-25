# Supercal Configuration

This file explains how to set up the OAuth client IDs for Supercal.

## Prerequisites

- `jq` - Command-line JSON processor (required for the build scripts)
  - The build scripts use jq to parse these configuration files

## Development Configuration

The `config/config.dev.json` file contains the OAuth client ID for local development:

```json
{
  "client_id": "YOUR_DEVELOPMENT_CLIENT_ID_HERE"
}
```

To set up your development client ID:

1. Load your unpacked extension in Chrome with Developer Mode enabled
2. Note your extension ID from chrome://extensions
3. Go to the [Google Cloud Console](https://console.cloud.google.com/)
4. Navigate to "APIs & Services" > "Credentials"
5. Create an OAuth client ID for a Chrome Extension
6. Enter your local extension ID as the Application ID
7. Copy the generated client ID and replace "YOUR_DEVELOPMENT_CLIENT_ID_HERE" in config/config.dev.json

## Production Configuration

The `config/config.prod.json` file contains the OAuth client ID for the published extension:

```json
{
  "client_id": "315994515832-hb2p398idke4b3pcm7tddnkpl8m541ej.apps.googleusercontent.com"
}
```

This client ID is already set up for the published Chrome Web Store extension.

## JSON Format

The configuration files must be valid JSON. The build scripts will validate the JSON format using jq and will fail if the files are not properly formatted.

## Building the Extension

After configuring the client IDs, use the build scripts to generate the appropriate manifest.json:

```bash
# For development
./build/build.sh -e dev

# For production
./build/build.sh -e prod
```

See `build/README.md` for more detailed build instructions. 