#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Get version from root manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Create zip file with correct name in dist directory
zip -j -f "dist/supercal-v${VERSION}.zip" \
    manifest.json \
    src/content.js \
    assets/icons/icon16.png \
    assets/icons/icon48.png \
    assets/icons/icon128.png

echo "Created dist/supercal-v${VERSION}.zip"
