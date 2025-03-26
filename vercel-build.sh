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
if [ -d "dist/public" ]; then
  cp -r dist/public/* .vercel/output/static/
else
  # Vite puts its build output directly in the dist directory
  cp -r dist/* .vercel/output/static/
fi

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
import { dirname, join, resolve } from 'path';
import * as fs from 'fs';
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

// Find server entry point file
async function findServerEntry() {
  const possiblePaths = [
    join(__dirname, 'server', 'index.js'),
    join(__dirname, 'index.js')
  ];
  
  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      console.log(`Found server entry at ${path}`);
      return path;
    }
  }
  
  throw new Error('Could not find server entry point');
}

// Write 404 page to static directory in case client routing is needed
function ensureClientRouting() {
  try {
    const staticDir = resolve(__dirname, '..', '..', 'static');
    if (fs.existsSync(join(staticDir, 'index.html'))) {
      fs.copyFileSync(
        join(staticDir, 'index.html'), 
        join(staticDir, '404.html')
      );
      console.log('Created 404.html from index.html for client-side routing');
    }
  } catch (err) {
    console.warn('Could not create 404.html page:', err);
  }
}

// Ensure client-side routing works
ensureClientRouting();

// Handle possible import errors with more detailed logging
try {
  // List available files
  console.log('Server directory contents:');
  if (fs.existsSync(join(__dirname, 'server'))) {
    console.log(fs.readdirSync(join(__dirname, 'server')));
  } else {
    console.log('Server directory not found, listing root:');
    console.log(fs.readdirSync(__dirname));
  }
  
  // Try to find and import server
  const serverEntryPath = await findServerEntry();
  const serverEntryUrl = new URL(`file://${serverEntryPath}`).href;
  const server = await import(serverEntryUrl);
  console.log('Server loaded successfully');
} catch (err) {
  console.error('Failed to load server:', err);
  process.exit(1);
}
EOL

# Copy server build files
echo "Copying server files..."
mkdir -p .vercel/output/functions/api.func/server
if [ -d "dist/server" ]; then
  cp -r dist/server/* .vercel/output/functions/api.func/server/
else
  # Handle case where server files might be in the root dist directory
  echo "Server directory not found, looking for server files in dist..."
  for file in dist/*.js; do
    if [[ $file == *"/index.js" ]]; then
      cp $file .vercel/output/functions/api.func/server/
      echo "Copied $file to server directory"
    fi
  done
fi

# Copy shared files 
echo "Copying shared files..."
mkdir -p .vercel/output/functions/api.func/shared
if [ -d "dist/shared" ]; then
  cp -r dist/shared/* .vercel/output/functions/api.func/shared/
else
  # Handle case where shared files might be in the root dist directory
  echo "Shared directory not found, looking for schema file in dist..."
  for file in dist/*.js; do
    if [[ $file == *"/schema.js" ]]; then
      cp $file .vercel/output/functions/api.func/shared/
      echo "Copied $file to shared directory"
    fi
  done
fi

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