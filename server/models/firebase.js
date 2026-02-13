const admin = require('firebase-admin');

let db = null;

const initializeFirebase = () => {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountVar) {
      console.error('❌ FIREBASE_INITIALIZATION_ERROR: FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
      return null;
    }

    console.log('Attempting to initialize Firebase Admin SDK...');

    let serviceAccount;
    try {
      // Parse the JSON string
      serviceAccount = typeof serviceAccountVar === 'string'
        ? JSON.parse(serviceAccountVar)
        : serviceAccountVar;

      // Ensure the private key handles newlines correctly
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
    } catch (parseError) {
      console.error('❌ FIREBASE_INITIALIZATION_ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON string.');
      console.error('Debugging Tip: Ensure the environment variable is a valid JSON string.');
      return null;
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const firestore = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized successfully.');
    return firestore;
  } catch (error) {
    console.error('❌ FIREBASE_INITIALIZATION_ERROR:', error.message);
    return null;
  }
};

db = initializeFirebase();

module.exports = { admin, db };
