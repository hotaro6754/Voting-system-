const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db;

const initializeFirebase = () => {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountVar) {
      console.log('Attempting to initialize Firebase with Service Account...');
      let serviceAccount;
      try {
        serviceAccount = typeof serviceAccountVar === 'string'
          ? JSON.parse(serviceAccountVar)
          : serviceAccountVar;
      } catch (parseError) {
        console.error('CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT. Ensure it is a valid JSON string.');
        throw new Error('Invalid Firebase Service Account JSON format.');
      }

      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      db = admin.firestore();
      console.log('Firebase Admin SDK initialized successfully via Environment Variable');
    } else {
      console.warn('WARNING: FIREBASE_SERVICE_ACCOUNT environment variable is missing.');

      if (process.env.NODE_ENV === 'production') {
        throw new Error('FIREBASE_SERVICE_ACCOUNT is required in production environments (Render/Vercel).');
      }

      // Local fallback using application default credentials
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      }
      db = admin.firestore();
      console.log('Firebase initialized via Application Default Credentials (Local Fallback)');
    }
  } catch (error) {
    console.error('FIREBASE_INITIALIZATION_ERROR:', error.message);
    // In production, we might want to exit if Firebase is critical,
    // but here we keep it running for health checks to report the failure.
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Server starting without Firebase in production.');
    }
  }
};

initializeFirebase();

module.exports = { admin, db };
