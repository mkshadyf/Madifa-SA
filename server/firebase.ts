import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin with service account
try {
  const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    
    console.log('[firebase] Admin SDK initialized successfully');
  } else {
    console.warn('[firebase] Service account file not found, Firebase Admin SDK not initialized');
  }
} catch (error) {
  console.error('[firebase] Failed to initialize Firebase Admin SDK:', error);
}

export { admin };