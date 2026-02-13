const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Attempting to initialize Firebase with Service Account...');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('Firebase Admin SDK initialized successfully via Environment Variable');
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    // In production (Render/Vercel), we MUST have the service account
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is required in production.');
    }

    // Local fallback
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    db = admin.firestore();
    console.log('Firebase initialized via Application Default Credentials (Local Fallback)');
  }
} catch (error) {
  console.error('FIREBASE_INITIALIZATION_CRITICAL_ERROR:', error.message);
  // We don't exit the process here to allow the health check to still run and report issues
}

module.exports = { admin, db };
