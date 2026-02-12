const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db;

try {
  // Check if we have the service account JSON as a string in environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Fallback for local development if the file exists
    // In production, always use the environment variable
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }

  db = admin.firestore();
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

module.exports = { admin, db };
