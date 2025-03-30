#!/bin/bash
set -e

MANIFEST_FILE="android/app/src/main/AndroidManifest.xml"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "Android manifest file not found. Please run cap sync android first."
  exit 1
fi

# Create a temporary file
TMP_FILE=$(mktemp)

# Add necessary permissions to the manifest
cat "$MANIFEST_FILE" | sed '/<\/manifest>/i \
    <uses-permission android:name="android.permission.INTERNET" />\
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\
    <uses-permission android:name="android.permission.WAKE_LOCK" />' > "$TMP_FILE"

# Replace the original file
mv "$TMP_FILE" "$MANIFEST_FILE"

echo "Android manifest updated with necessary permissions!"