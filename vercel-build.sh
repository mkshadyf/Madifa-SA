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
mkdir -p .vercel/output/functions/api.func
mkdir -p .vercel/output/static

# Move client build to static directory
cp -r dist/public/* .vercel/output/static/

# Create serverless function entry point
cat > .vercel/output/functions/api.func/index.js << 'EOL'
// ESM Entry point for Vercel serverless function
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Setup environment
dotenv.config({ path: path.join(__dirname, '.env') });

// Important: Define NODE_ENV for production
process.env.NODE_ENV = 'production';

// Import the server
import('./server/index.js').catch(err => {
  console.error('Failed to load server:', err);
  process.exit(1);
});
EOL

# Copy server build files
mkdir -p .vercel/output/functions/api.func/server
cp -r dist/server/* .vercel/output/functions/api.func/server/

# Copy shared files if needed
mkdir -p .vercel/output/functions/api.func/shared
cp -r dist/shared/* .vercel/output/functions/api.func/shared/ 2>/dev/null || echo "No shared directory to copy"

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