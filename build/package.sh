#!/bin/bash

# Create dist directory and unpacked subdirectory
mkdir -p dist/unpacked

# Get version from root manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Copy files to unpacked directory (all at root level)
cp manifest.json dist/unpacked/
cp src/content.js dist/unpacked/
cp assets/icons/icon16.png dist/unpacked/
cp assets/icons/icon48.png dist/unpacked/
cp assets/icons/icon128.png dist/unpacked/

# Create zip file with all files at root level
zip -j "dist/supercal-v${VERSION}.zip" dist/unpacked/*

echo ""
echo "Created dist/supercal-v${VERSION}.zip"
echo "Created dist/unpacked/"
