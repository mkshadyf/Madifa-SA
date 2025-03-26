import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Set environment variables
process.env.NODE_ENV = 'production';

// Import the server
let serverModule;
try {
  // Try direct import
  serverModule = await import('../server/index.js');
} catch (err) {
  console.error('Could not import server/index.js directly:', err);
  
  // Try fallback path
  try {
    if (fs.existsSync(join(__dirname, '../dist/index.js'))) {
      serverModule = await import('../dist/index.js');
      console.log('Loaded server from dist/index.js');
    } else if (fs.existsSync(join(__dirname, '../server/index.js'))) {
      serverModule = await import('../server/index.js');
      console.log('Loaded server from server/index.js');
    } else {
      console.error('Could not find server entry point.');
      process.exit(1);
    }
  } catch (fallbackErr) {
    console.error('All import attempts failed:', fallbackErr);
    process.exit(1);
  }
}

// Export handler for Vercel
export default async function handler(req, res) {
  // Handle the request using Express app
  if (serverModule && serverModule.default) {
    return serverModule.default(req, res);
  } else {
    res.status(500).json({ error: 'Server module could not be loaded properly' });
  }
}