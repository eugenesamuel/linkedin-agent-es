import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK using modern V12 modular syntax
try {
  if (getApps().length === 0) {
    // When hosted on Firebase, this automatically uses the default service account
    // For local development, set GOOGLE_APPLICATION_CREDENTIALS in your terminal
    initializeApp();
  }
} catch (error) {
  console.error('Firebase Admin initialization error', error);
}

const app = getApp();
export const db = getFirestore(app);
