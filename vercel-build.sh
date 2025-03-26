#!/bin/bash
set -e

# Build the client
echo "Building client..."
cd client
npm run build
cd ..

# Build the server
echo "Building server..."
npm run build

# Create function directories
mkdir -p .vercel/output/functions/api
mkdir -p .vercel/output/static

# Move client build to static directory
cp -r client/dist/* .vercel/output/static/

# Create serverless function
cat > .vercel/output/functions/api.func/index.js << 'EOL'
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config({ path: path.join(__dirname, '.env') });

import('./dist/index.js');
EOL

# Copy server build to function
cp -r dist .vercel/output/functions/api.func/

# Create function config
cat > .vercel/output/functions/api.func/.vc-config.json << 'EOL'
{
  "runtime": "nodejs18.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "environment": {
    "NODE_OPTIONS": "--experimental-specifier-resolution=node"
  }
}
EOL

# Create package.json for the function to ensure ESM support
cat > .vercel/output/functions/api.func/package.json << 'EOL'
{
  "name": "api-function",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "dotenv": "^16.0.0"
  }
}
EOL

# Copy environment variables
cp .env .vercel/output/functions/api.func/.env 2>/dev/null || echo "No .env file to copy"

echo "Vercel build completed successfully"