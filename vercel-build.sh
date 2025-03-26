#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Ensure NODE_ENV is set to production for the build
export NODE_ENV=production

# Build the client
echo "Building client..."
cd client
npm run build
cd ..

# Build the server with explicit ESM support
echo "Building server..."
NODE_OPTIONS="--experimental-specifier-resolution=node" npm run build

# Debug - check the build output directory structure
echo "Checking build output:"
ls -la dist/
ls -la dist/public/ || echo "No public directory found"
ls -la dist/server/ || echo "No server directory found"

# Create function directories
mkdir -p .vercel/output/functions/api.func
mkdir -p .vercel/output/static

# Move client build to static directory
echo "Copying static files..."
cp -r dist/public/* .vercel/output/static/

# Create a tsconfig for the server function
cat > .vercel/output/functions/api.func/tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true
  }
}
EOL

# Create serverless function entry point
cat > .vercel/output/functions/api.func/index.js << 'EOL'
// ESM Entry point for Vercel serverless function
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Setup environment
dotenv.config({ path: join(__dirname, '.env') });

// Important: Define NODE_ENV for production
process.env.NODE_ENV = 'production';

// Configure module aliases
process.env.MODULE_ALIAS_SHARED = join(__dirname, 'shared');

// Handle possible import errors with more detailed logging
try {
  const server = await import('./server/index.js');
  console.log('Server loaded successfully');
} catch (err) {
  console.error('Failed to load server:', err);
  if (err.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('Module not found. Available files in server directory:');
    const fs = require('fs');
    try {
      console.log(fs.readdirSync(join(__dirname, 'server')));
    } catch (e) {
      console.error('Could not read server directory:', e);
    }
  }
  process.exit(1);
}
EOL

# Copy server build files
echo "Copying server files..."
mkdir -p .vercel/output/functions/api.func/server
cp -r dist/server/* .vercel/output/functions/api.func/server/

# Copy shared files
echo "Copying shared files..."
mkdir -p .vercel/output/functions/api.func/shared
cp -r dist/shared/* .vercel/output/functions/api.func/shared/ 2>/dev/null || echo "No shared directory to copy"

# Create a module resolver helper
cat > .vercel/output/functions/api.func/resolver.js << 'EOL'
// Module resolver for proper imports
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export function resolveModule(importMeta, path) {
  const __filename = fileURLToPath(importMeta.url);
  const __dirname = dirname(__filename);
  return join(__dirname, path);
}
EOL

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
    "dotenv": "^16.0.0",
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.39.1",
    "express": "^4.21.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8"
  }
}
EOL

# Copy environment variables
cp .env .vercel/output/functions/api.func/.env 2>/dev/null || echo "No .env file to copy"

# Create config.json for routing
cat > .vercel/output/config.json << 'EOL'
{
  "version": 3,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOL

echo "Vercel build completed successfully"