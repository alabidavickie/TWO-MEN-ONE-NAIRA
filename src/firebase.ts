import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firestore — used by the admin ledger to read registrations. Buyer records are
// written server-side by the Netlify webhook (Firebase Admin SDK), never here.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

// Auth — gates the admin sales ledger (email/password).
export const auth = getAuth(app);
