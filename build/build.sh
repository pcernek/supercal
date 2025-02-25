#!/bin/bash

# Main build script for Supercal extension

# Set directories
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not found in PATH"
  echo "Please install jq to continue"
  exit 1
fi

# Parse command line arguments
ENVIRONMENT="dev"
WATCH_MODE=false

print_usage() {
  echo "Usage: $0 [-e <environment>] [-w]"
  echo "  -e  Environment (dev or prod, default: dev)"
  echo "  -w  Watch mode (continuously rebuild on file changes)"
  echo "Example: $0 -e prod"
}

while getopts "e:wh" opt; do
  case $opt in
    e)
      ENVIRONMENT=$OPTARG
      if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
        echo "Invalid environment: $ENVIRONMENT. Must be 'dev' or 'prod'."
        print_usage
        exit 1
      fi
      ;;
    w)
      WATCH_MODE=true
      ;;
    h)
      print_usage
      exit 0
      ;;
    \?)
      echo "Invalid option: -$OPTARG"
      print_usage
      exit 1
      ;;
  esac
done

# Check if config file exists
CONFIG_FILE="$ROOT_DIR/config/config.${ENVIRONMENT}.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: Config file not found: $CONFIG_FILE"
  echo "Please create the config file with your client ID"
  exit 1
fi

# Validate config file format
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
  echo "Error: Invalid JSON in config file: $CONFIG_FILE"
  exit 1
fi

# Define file paths - centralized in one place
SOURCE_FILES=("$ROOT_DIR/src/"*)
MANIFEST_TEMPLATE="$ROOT_DIR/manifest.template.json"
CONFIG_FILE="$ROOT_DIR/config/config.${ENVIRONMENT}.json"
ICON_FILES=(
  "$ROOT_DIR/assets/icons/icon16.png"
  "$ROOT_DIR/assets/icons/icon48.png"
  "$ROOT_DIR/assets/icons/icon128.png"
)
MANIFEST_FILE="$ROOT_DIR/manifest.json"

# Files to watch for changes
WATCH_FILES=(
  "${SOURCE_FILES[@]}"
  "$MANIFEST_TEMPLATE"
  "$CONFIG_FILE"
  "${ICON_FILES[@]}"
)

# Function to copy files to the destination directory
copy_extension_files() {
  local DEST_DIR=$1
  
  # Copy source files
  cp -r "${SOURCE_FILES[@]}" "$DEST_DIR/"
  
  # Copy manifest and icons
  cp "$MANIFEST_FILE" "$DEST_DIR/"
  cp "${ICON_FILES[@]}" "$DEST_DIR/"
}

# Function to generate manifest.json from template
generate_manifest() {
  local ENV=$1
  local ENV_CONFIG_FILE="$ROOT_DIR/config/config.${ENV}.json"
  local CLIENT_ID=$(jq -r '.client_id' "$ENV_CONFIG_FILE")
  
  # Check if client ID was successfully extracted
  if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" == "null" ]; then
    echo "Error: Failed to extract client_id from config file"
    exit 1
  fi
  
  echo "Using ${ENV} client ID: $CLIENT_ID"
  
  # Generate manifest.json from template
  cat "$MANIFEST_TEMPLATE" | \
    sed "s/{{CLIENT_ID}}/$CLIENT_ID/g" > "$MANIFEST_FILE"
  
  echo "Generated manifest.json with ${ENV} client ID"
}

# Function to get hash of source files
function get_files_hash() {
  cat "${WATCH_FILES[@]}" 2>/dev/null | shasum
}

# Function to build the extension
build_extension() {
  # Set output directories based on environment
  if [[ "$ENVIRONMENT" == "dev" ]]; then
    DIST_DIR="$ROOT_DIR/dist/unpacked"
    mkdir -p "$DIST_DIR"
    
    # Generate manifest with development client ID
    generate_manifest "dev"
    
    # Copy files to dist directory
    copy_extension_files "$DIST_DIR"
    
    echo "Build completed for development environment"
    echo "Load the unpacked extension from: $DIST_DIR"
  else
    DIST_DIR="$ROOT_DIR/dist/production"
    ZIP_FILE="$ROOT_DIR/dist/supercal.zip"
    mkdir -p "$DIST_DIR"
    
    # Generate manifest with production client ID
    generate_manifest "prod"
    
    # Copy files to dist directory
    copy_extension_files "$DIST_DIR"
    
    # Create ZIP file for Chrome Web Store submission
    rm -f "$ZIP_FILE"
    cd "$DIST_DIR" && zip -r "$ZIP_FILE" ./*
    
    echo "Build completed for production environment"
    echo "Production files are in: $DIST_DIR"
    echo "ZIP file for Chrome Web Store submission: $ZIP_FILE"
  fi
}

# Build once
build_extension

# Watch mode
if [[ "$WATCH_MODE" == true ]]; then
  echo ""
  echo "Watching for changes (Ctrl+C to stop)..."
  LAST_HASH=$(get_files_hash)
  while true; do
    CURRENT_HASH=$(get_files_hash)
    if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
      echo "Changes detected, rebuilding..."
      build_extension
      LAST_HASH=$CURRENT_HASH
    fi
    sleep 2
  done
fi 