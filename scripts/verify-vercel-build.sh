#!/bin/bash

# This script verifies that the Vercel build output is correctly structured
# Run it after executing vercel-build.sh locally

echo "Verifying Vercel build output..."

# Check if the .vercel/output directory exists
if [ ! -d ".vercel/output" ]; then
  echo "❌ ERROR: .vercel/output directory not found"
  exit 1
fi

# Check static files
if [ ! -d ".vercel/output/static" ]; then
  echo "❌ ERROR: .vercel/output/static directory not found"
  exit 1
fi

if [ ! -f ".vercel/output/static/index.html" ]; then
  echo "❌ ERROR: index.html not found in static directory"
  exit 1
fi

# Check serverless function
if [ ! -d ".vercel/output/functions/api.func" ]; then
  echo "❌ ERROR: api.func directory not found"
  exit 1
fi

if [ ! -f ".vercel/output/functions/api.func/index.js" ]; then
  echo "❌ ERROR: index.js not found in api.func directory"
  exit 1
fi

if [ ! -f ".vercel/output/functions/api.func/.vc-config.json" ]; then
  echo "❌ ERROR: .vc-config.json not found in api.func directory"
  exit 1
fi

# Check server and shared directories
if [ ! -d ".vercel/output/functions/api.func/server" ]; then
  echo "⚠️ WARNING: server directory not found in api.func"
fi

if [ ! -d ".vercel/output/functions/api.func/shared" ]; then
  echo "⚠️ WARNING: shared directory not found in api.func"
fi

# Check config.json
if [ ! -f ".vercel/output/config.json" ]; then
  echo "❌ ERROR: config.json not found in output directory"
  exit 1
fi

# Validation succeeded
echo "✅ Vercel build output validation successful!"
echo "All required files and directories are present."
echo ""
echo "Next step: Deploy to Vercel using one of these methods:"
echo "1. Run 'vercel --prebuilt' to deploy the prebuilt output"
echo "2. Push to your GitHub repository to trigger automated deployment"