#!/bin/bash
# This script helps verify the build structure for Vercel deployment

echo "Verifying build structure..."

# Build the project
npm run build

# Check if the build was successful
if [ ! -d "dist" ]; then
  echo "ERROR: Build failed - dist directory not found"
  exit 1
fi

# Display directory structure to help debug deployment issues
echo "---------------------------------------"
echo "Build Directory Structure:"
find dist -type f | sort

echo "---------------------------------------"
echo "Checking for key files:"

# Check for important files
if [ -f "dist/index.html" ]; then
  echo "✓ Client entry point (index.html) found"
else
  echo "✗ Client entry point (index.html) NOT found"
fi

if [ -f "dist/server/index.js" ]; then
  echo "✓ Server entry point (server/index.js) found"
else 
  if [ -f "dist/index.js" ]; then
    echo "✓ Server entry point (index.js) found at root"
  else
    echo "✗ Server entry point NOT found"
  fi
fi

if [ -f "dist/shared/schema.js" ]; then
  echo "✓ Schema definitions (shared/schema.js) found"
else
  echo "✗ Schema definitions NOT found"
fi

echo "---------------------------------------"
echo "Build verification complete."