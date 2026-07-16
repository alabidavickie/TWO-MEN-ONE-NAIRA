import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);
