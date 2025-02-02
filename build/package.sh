#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' src/manifest.json | cut -d'"' -f4)

# Create zip file with correct name in dist directory
zip -j -f "dist/supercal-v${VERSION}.zip" \
    src/manifest.json \
    src/content.js \
    src/icon16.png \
    src/icon48.png \
    src/icon128.png

echo "Created dist/supercal-v${VERSION}.zip"
