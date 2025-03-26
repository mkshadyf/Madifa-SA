#!/bin/bash

# Madifa Firebase Deployment Script

echo "🔥 Starting Madifa Firebase Deployment"
echo "--------------------------------------"

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Firebase CLI not found locally, using npx..."
    FIREBASE_CMD="npx firebase"
else
    FIREBASE_CMD="firebase"
fi

# Build the application
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

echo "✅ Build completed successfully."

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
$FIREBASE_CMD deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now live at https://madifa-7d087.web.app"
echo "--------------------------------------"