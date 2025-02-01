#!/bin/bash

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Create zip file with correct name
cd src && zip -j "supercal-v${VERSION}.zip" \
    manifest.json \
    content.js \
    icon16.png \
    icon48.png \
    icon128.png

echo "Created supercal-v${VERSION}.zip"
