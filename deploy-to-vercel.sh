#!/bin/bash

# Manual utility script to deploy the Madifa application to Vercel
# Note: This script is intended for manual deployment only when needed.
# Normally, deployment should happen automatically via GitHub-Vercel integration.

# Display help message
function show_help {
  echo "Usage: ./deploy-to-vercel.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help       Display this help message"
  echo "  --no-build       Skip the build step"
  echo "  --preview        Deploy to preview instead of production"
  echo ""
  echo "Environment variables:"
  echo "  VERCEL_TOKEN         Required: Your Vercel API token"
  echo "  VERCEL_ORG_ID        Optional: Your Vercel organization ID"
  echo "  VERCEL_PROJECT_ID    Optional: Your Vercel project ID"
  echo ""
  echo "Example:"
  echo "  VERCEL_TOKEN=your_token ./deploy-to-vercel.sh"
  exit 0
}

# Default options
skip_build=false
deploy_prod=true

# Process command line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -h|--help) show_help ;;
    --no-build) skip_build=true; shift ;;
    --preview) deploy_prod=false; shift ;;
    *) echo "Unknown parameter: $1"; show_help ;;
  esac
done

# Check if VERCEL_TOKEN environment variable exists
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN environment variable not set. Please set it using:"
  echo "export VERCEL_TOKEN=your_vercel_token"
  echo ""
  echo "You can generate a token at https://vercel.com/account/tokens"
  exit 1
fi

# Vercel project configuration
VERCEL_ORG_ID=${VERCEL_ORG_ID:-""}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID:-""}

# If project ID or org ID not provided, try to get them interactively
if [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
  echo "ℹ️ Attempting to link to Vercel project..."
  npx vercel link
else
  # Create .vercel directory if it doesn't exist
  mkdir -p .vercel

  # Create project.json in .vercel directory
  cat > .vercel/project.json << EOL
{
  "projectId": "$VERCEL_PROJECT_ID",
  "orgId": "$VERCEL_ORG_ID"
}
EOL
  echo "ℹ️ Using Vercel configuration:"
  echo "  Organization ID: $VERCEL_ORG_ID"
  echo "  Project ID: $VERCEL_PROJECT_ID"
fi

# Build the app if not skipped
if [ "$skip_build" = false ]; then
  echo "🔨 Building the app..."
  npm run build
  if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
  fi
  echo "✅ Build completed successfully."
else
  echo "ℹ️ Skipping build step as requested."
fi

# Prepare deployment command
deploy_command="npx vercel deploy --token $VERCEL_TOKEN"

# Add production flag if needed
if [ "$deploy_prod" = true ]; then
  deploy_command="$deploy_command --prod"
  echo "🚀 Deploying to production..."
else
  echo "🚀 Deploying to preview environment..."
fi

# Add common flags and environment variables
deploy_command="$deploy_command --yes \
  --env DATABASE_URL=$(printenv DATABASE_URL) \
  --env VIMEO_API_KEY=$(printenv VIMEO_API_KEY) \
  --env VIMEO_API_SECRET=$(printenv VIMEO_API_SECRET) \
  --env VIMEO_ACCESS_TOKEN=$(printenv VIMEO_ACCESS_TOKEN) \
  --env PAYFAST_MERCHANT_ID=$(printenv PAYFAST_MERCHANT_ID) \
  --env PAYFAST_MERCHANT_KEY=$(printenv PAYFAST_MERCHANT_KEY) \
  --env PAYFAST_PASSPHRASE=$(printenv PAYFAST_PASSPHRASE)"

# Execute deployment
eval $deploy_command
deploy_status=$?

# Check deployment status
if [ $deploy_status -eq 0 ]; then
  echo "✅ Deployment complete! Your app should now be available on the Vercel URL provided above."
  
  if [ "$deploy_prod" = true ]; then
    echo ""
    echo "ℹ️ If you see a 'Not Found' error, please check the following:"
    echo "  1. Verify that your vercel.json file has the correct route configurations"
    echo "  2. Ensure all environment variables are properly set in Vercel"
    echo "  3. Check the build logs for any errors"
    echo ""
    echo "For more detailed deployment troubleshooting, see WEB_DEPLOYMENT.md"
  fi
else
  echo "❌ Deployment failed. Please check the error messages above."
  echo "For more detailed deployment troubleshooting, see WEB_DEPLOYMENT.md"
fi