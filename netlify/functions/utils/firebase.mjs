import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Lazily initialize the Firebase Admin SDK from a base64-encoded service
// account (stored as the Netlify env var FIREBASE_SERVICE_ACCOUNT_B64).
// Base64 avoids newline/escaping problems when pasting the JSON into Netlify.
let cached = null;

export function getDb() {
  if (cached) return cached;

  if (!getApps().length) {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 is not set.");
    const svc = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    initializeApp({ credential: cert(svc), projectId: svc.project_id });
  }

  // The web app uses a NAMED Firestore database ("default").
  cached = getFirestore("default");
  return cached;
}
