#!/bin/bash
set -e

# Build the web app
echo "Building web app..."
npm run build

# Initialize Capacitor if it hasn't been done yet
if [ ! -d "android" ]; then
  echo "Initializing Capacitor..."
  npx cap init Madifa com.madifa.app --web-dir=dist
fi

# Sync web content to Android project
echo "Syncing content to Android..."
npx cap sync android

# Prepare icons and splash screen
echo "Preparing app icons and splash screen..."
./prepare-icons.sh

# Update Android manifest with necessary permissions
echo "Updating Android manifest..."
./update-android-manifest.sh

# Open Android Studio (optional, for manual signing and deployment)
# npx cap open android

# Build release APK (requires JDK and Android SDK)
echo "Building release bundle..."
cd android
./gradlew bundleRelease

echo ""
echo "===================================================="
echo "Build completed!"
echo "The AAB file is located at: android/app/build/outputs/bundle/release/app-release.aab"
echo "To deploy to Play Store, upload this file to Google Play Console."
echo "===================================================="