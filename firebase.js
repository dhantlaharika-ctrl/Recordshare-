// src/firebase.js
// ─────────────────────────────────────────────────────────────
//  SETUP INSTRUCTIONS
//  1. Go to https://console.firebase.google.com
//  2. Create a project → Add Web App → copy the config below
//  3. Enable: Authentication > Email/Password
//  4. Enable: Firestore Database (start in test mode, then secure with rules below)
//  5. Enable: Storage (for profile photos)
//  6. Replace every value in firebaseConfig with your own
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const storage = getStorage(app);
export default app;
