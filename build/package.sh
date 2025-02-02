#!/bin/bash

# Define source files
SOURCE_FILES=(
    "manifest.json"
    "src/content.js"
    "assets/icons/icon16.png"
    "assets/icons/icon48.png"
    "assets/icons/icon128.png"
)

function get_files_hash() {
    cat "${SOURCE_FILES[@]}" | shasum
}

function build() {
    # Create dist directory and unpacked subdirectory
    mkdir -p dist/unpacked

    # Get version from root manifest.json
    VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

    # Copy files to unpacked directory (all at root level)
    for file in "${SOURCE_FILES[@]}"; do
        cp "$file" dist/unpacked/$(basename "$file")
    done

    # Create zip file with all files at root level
    zip -j "dist/supercal-v${VERSION}.zip" dist/unpacked/*

    echo ""
    echo "Created dist/supercal-v${VERSION}.zip"
    echo "Created dist/unpacked/"
}

# Always do initial build
build

if [ "$1" = "--watch" ] || [ "$1" = "-w" ]; then
    echo ""
    echo "Watching for changes (Ctrl+C to stop)..."
    LAST_HASH=$(get_files_hash)
    while true; do
        CURRENT_HASH=$(get_files_hash)
        if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
            echo "Changes detected, rebuilding..."
            build
            LAST_HASH=$CURRENT_HASH
        fi
        sleep 2
    done
fi
