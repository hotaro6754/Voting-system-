const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db;

const initializeFirebase = () => {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountVar) {
      const errorMsg = 'CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing.';
      console.error(errorMsg);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errorMsg);
      }
      return;
    }

    console.log('Attempting to initialize Firebase with Service Account...');
    let serviceAccount;
    try {
      serviceAccount = typeof serviceAccountVar === 'string'
        ? JSON.parse(serviceAccountVar)
        : serviceAccountVar;

      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
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
  } catch (error) {
    console.error('FIREBASE_INITIALIZATION_ERROR:', error.message);
    if (process.env.NODE_ENV === 'production') {
      // In production, we throw to prevent the server from starting in a broken state
      throw error;
    }
  }
};

initializeFirebase();

module.exports = { admin, db };
