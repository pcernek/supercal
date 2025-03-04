#!/bin/bash

set -e

# Main build script for Supercal extension

# Set directories
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
MANIFEST_TEMPLATE="$ROOT_DIR/manifest.template.json"

# Check for required tools
command -v jq >/dev/null 2>&1 || { echo "jq is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }

# Install dependencies if node_modules doesn't exist
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Installing dependencies..."
  cd "$ROOT_DIR"
  npm install
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
ICON_FILES=(
  "$ROOT_DIR/assets/icons/icon16.png"
  "$ROOT_DIR/assets/icons/icon48.png"
  "$ROOT_DIR/assets/icons/icon128.png"
)
HTML_FILES=(
  "$ROOT_DIR/src/popup.html"
  "$ROOT_DIR/src/options.html"
)

# Files to watch for changes
WATCH_FILES=(
  "${SOURCE_FILES[@]}"
  "$MANIFEST_TEMPLATE"
  "$CONFIG_FILE"
  "${ICON_FILES[@]}"
  "${HTML_FILES[@]}"
  "$ROOT_DIR/package.json"
  "$ROOT_DIR/tsconfig.json"
  "$ROOT_DIR/webpack.config.js"
)

# Function to copy files to the destination directory
copy_extension_files() {
  local DEST_DIR=$1
  local CLIENT_ID=$2
  
  # Generate manifest.json in the destination directory
  cat "$MANIFEST_TEMPLATE" | \
    sed "s/{{CLIENT_ID}}/$CLIENT_ID/g" > "$DEST_DIR/manifest.json"
  
  # Copy icons
  cp "${ICON_FILES[@]}" "$DEST_DIR/"
  
  # Copy HTML files
  cp "${HTML_FILES[@]}" "$DEST_DIR/"
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
    
    # Get development client ID
    CLIENT_ID=$(jq -r '.client_id' "$ROOT_DIR/config/config.dev.json")
    
    # Clean previous build
    echo "Cleaning previous build..."
    cd "$ROOT_DIR" && npm run clean
    
    # Build using Webpack
    echo "Building with Webpack..."
    cd "$ROOT_DIR" && npm run build
    
    # Ensure the unpacked directory exists
    mkdir -p "$DIST_DIR"
    
    # Copy all built files from webpack output to the final directory
    echo "Copying built files..."
    cp -r "$ROOT_DIR/dist/js/"* "$DIST_DIR/"
    
    # Copy extension files (manifest, icons, HTML)
    echo "Copying extension files..."
    copy_extension_files "$DIST_DIR" "$CLIENT_ID"
    
    echo "Build completed for development environment"
    echo "Load the unpacked extension from: $DIST_DIR"
  else
    DIST_DIR="$ROOT_DIR/dist/production"
    ZIP_FILE="$ROOT_DIR/dist/supercal.zip"
    mkdir -p "$DIST_DIR"
    
    # Get production client ID
    CLIENT_ID=$(jq -r '.client_id' "$ROOT_DIR/config/config.prod.json")
    
    # Clean previous build
    echo "Cleaning previous build..."
    cd "$ROOT_DIR" && npm run clean
    
    # Build using Webpack
    echo "Building with Webpack..."
    cd "$ROOT_DIR" && npm run build
    
    # Ensure the production directory exists
    mkdir -p "$DIST_DIR"
    
    # Copy all built files from webpack output to the final directory
    echo "Copying built files..."
    cp -r "$ROOT_DIR/dist/js/"* "$DIST_DIR/"
    
    # Copy extension files (manifest, icons, HTML)
    echo "Copying extension files..."
    copy_extension_files "$DIST_DIR" "$CLIENT_ID"
    
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
  cd "$ROOT_DIR" && npm run dev
fi 