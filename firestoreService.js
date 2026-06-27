// src/utils/firestoreService.js
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, arrayUnion, arrayRemove, increment, limit
} from "firebase/firestore";
import { db } from "../firebase";

/* ═══════════════════════════════════════════
   USERS
═══════════════════════════════════════════ */
export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), data);
};

export const getWriters = async () => {
  const q = query(collection(db, "users"), where("role", "==", "writer"), orderBy("rating", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/* ═══════════════════════════════════════════
   RECORDS
═══════════════════════════════════════════ */
export const createRecord = async (data) => {
  const ref = await addDoc(collection(db, "records"), {
    ...data,
    status: "open",
    applicants: [],
    assignedTo: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getRecord = async (id) => {
  const snap = await getDoc(doc(db, "records", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Real-time listener for all open records
export const subscribeOpenRecords = (callback) => {
  const q = query(
    collection(db, "records"),
    where("status", "==", "open"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// Real-time listener for records posted by a specific user
export const subscribeMyRecords = (uid, callback) => {
  const q = query(
    collection(db, "records"),
    where("postedBy", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// Real-time listener for records a writer has applied to
export const subscribeWriterApplications = (uid, callback) => {
  const q = query(
    collection(db, "records"),
    where("applicants", "array-contains", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const applyToRecord = async (recordId, writerId) => {
  await updateDoc(doc(db, "records", recordId), {
    applicants: arrayUnion(writerId),
    updatedAt: serverTimestamp(),
  });
};

export const withdrawApplication = async (recordId, writerId) => {
  await updateDoc(doc(db, "records", recordId), {
    applicants: arrayRemove(writerId),
    updatedAt: serverTimestamp(),
  });
};

export const assignWriter = async (recordId, writerId) => {
  await updateDoc(doc(db, "records", recordId), {
    assignedTo: writerId,
    status: "assigned",
    updatedAt: serverTimestamp(),
  });
};

export const markRecordComplete = async (recordId) => {
  await updateDoc(doc(db, "records", recordId), {
    status: "completed",
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteRecord = async (recordId) => {
  await deleteDoc(doc(db, "records", recordId));
};

/* ═══════════════════════════════════════════
   CHAT
═══════════════════════════════════════════ */
// Chat ID is always sorted alphabetical to be deterministic
export const chatId = (uid1, uid2) => [uid1, uid2].sort().join("_");

export const ensureChat = async (uid1, uid2) => {
  const cid = chatId(uid1, uid2);
  const ref = doc(db, "chats", cid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(ref, {
      participants: [uid1, uid2],
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
    });
  }
  return cid;
};

export const sendMessage = async (cid, senderId, text) => {
  const msgRef = await addDoc(collection(db, "chats", cid, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
    read: false,
  });
  await updateDoc(doc(db, "chats", cid), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
  return msgRef.id;
};

export const subscribeMessages = (cid, callback) => {
  const q = query(
    collection(db, "chats", cid, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const subscribeChats = (uid, callback) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

/* ═══════════════════════════════════════════
   REVIEWS
═══════════════════════════════════════════ */
export const createReview = async ({ recordId, fromId, toId, rating, comment }) => {
  // Save review document
  await addDoc(collection(db, "reviews"), {
    recordId, fromId, toId, rating, comment,
    createdAt: serverTimestamp(),
  });
  // Recalculate writer's average rating
  const q = query(collection(db, "reviews"), where("toId", "==", toId));
  const snap = await getDocs(q);
  const reviews = snap.docs.map(d => d.data());
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await updateDoc(doc(db, "users", toId), {
    rating: Math.round(avg * 10) / 10,
    ratingCount: reviews.length,
  });
};

export const getReviewsForUser = async (uid) => {
  const q = query(
    collection(db, "reviews"),
    where("toId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const hasReviewed = async (fromId, recordId) => {
  const q = query(
    collection(db, "reviews"),
    where("fromId", "==", fromId),
    where("recordId", "==", recordId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
};

/* ═══════════════════════════════════════════
   PAYMENTS
═══════════════════════════════════════════ */
export const createPaymentRecord = async ({ requesterId, writerId, recordId, amount, stripePaymentIntentId }) => {
  const ref = await addDoc(collection(db, "payments"), {
    requesterId, writerId, recordId, amount,
    stripePaymentIntentId,
    status: "held",     // held → released | refunded
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getPaymentForRecord = async (recordId) => {
  const q = query(collection(db, "payments"), where("recordId", "==", recordId), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};
