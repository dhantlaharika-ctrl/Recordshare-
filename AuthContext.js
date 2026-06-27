// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile]  = useState(null);
  const [loading, setLoading]          = useState(true);

  // Register new user → write Firestore profile
  async function register(email, password, name, role) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = {
      uid: cred.user.uid,
      name,
      email,
      role,           // "requester" | "writer"
      bio: "",
      rating: 0,
      ratingCount: 0,
      photoURL: "",
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), profile);
    setUserProfile(profile);
    return cred;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  // Reload profile (e.g. after rating update)
  async function refreshProfile(uid) {
    const snap = await getDoc(doc(db, "users", uid || currentUser.uid));
    if (snap.exists()) setUserProfile({ id: snap.id, ...snap.data() });
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserProfile({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, register, login, logout, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
