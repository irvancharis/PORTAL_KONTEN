import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";

let db = null;
let auth = null;
let firebaseApp = null;

// User's default Firebase configuration
const defaultConfig = {
  apiKey: "AIzaSyDf5ceEacu2-mv2FK8Qbeza2QyfsksXSE8",
  authDomain: "jamkosong.firebaseapp.com",
  projectId: "jamkosong",
  storageBucket: "jamkosong.firebasestorage.app",
  messagingSenderId: "134227107647",
  appId: "1:134227107647:web:344ac45f6e6c9b8f41bd8a",
  measurementId: "G-BDFQN9VRYV"
};

// Get config from localStorage or fallback to default
const savedConfig = localStorage.getItem('portal-firebase-config');
const configToUse = savedConfig ? JSON.parse(savedConfig) : defaultConfig;

if (configToUse) {
  try {
    if (configToUse.apiKey && configToUse.projectId) {
      if (getApps().length === 0) {
        firebaseApp = initializeApp(configToUse);
      } else {
        firebaseApp = getApp();
      }
      // Initialize Firestore with persistent local cache & multi-tab support
      db = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
      auth = getAuth(firebaseApp);
      console.log("Firebase Cloud Firestore successfully initialized with Offline Cache!");
    }
  } catch (error) {
    console.error("Failed to parse Firebase configuration:", error);
  }
}

// Check if Firestore is configured and connected
export const isFirebaseConfigured = () => {
  return db !== null;
};

// --- Firestore Helpers ---

// Movies CRUD
export const getFirestoreMovies = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "movies"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching movies from Firestore:", e);
    return null;
  }
};

export const saveFirestoreMovie = async (movie) => {
  if (!db) return false;
  try {
    const { id, ...data } = movie;
    await setDoc(doc(db, "movies", id), data);
    return true;
  } catch (e) {
    console.error("Error saving movie to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreMovie = async (movieId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "movies", movieId));
    return true;
  } catch (e) {
    console.error("Error deleting movie from Firestore:", e);
    return false;
  }
};

// Users CRUD
export const getFirestoreUsers = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching users from Firestore:", e);
    return null;
  }
};

export const saveFirestoreUser = async (user) => {
  if (!db) return false;
  try {
    const { id, ...data } = user;
    await setDoc(doc(db, "users", id), data);
    return true;
  } catch (e) {
    console.error("Error saving user to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreUser = async (userId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (e) {
    console.error("Error deleting user from Firestore:", e);
    return false;
  }
};

// Settings (API Key & Affiliate Links)
export const getFirestoreSettings = async () => {
  if (!db) return null;
  try {
    const docRef = doc(db, "settings", "general");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (e) {
    console.error("Error fetching settings from Firestore:", e);
    return null;
  }
};

export const saveFirestoreSettings = async (settings) => {
  if (!db) return false;
  try {
    await setDoc(doc(db, "settings", "general"), settings);
    return true;
  } catch (e) {
    console.error("Error saving settings to Firestore:", e);
    return false;
  }
};

// Payment Confirmations CRUD
export const getFirestoreConfirmations = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "confirmations"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching confirmations from Firestore:", e);
    return null;
  }
};

export const saveFirestoreConfirmation = async (confirmation) => {
  if (!db) return false;
  try {
    const { id, ...data } = confirmation;
    await setDoc(doc(db, "confirmations", id), data);
    return true;
  } catch (e) {
    console.error("Error saving confirmation to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreConfirmation = async (confirmationId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "confirmations", confirmationId));
    return true;
  } catch (e) {
    console.error("Error deleting confirmation from Firestore:", e);
    return false;
  }
};

// Events CRUD
export const getFirestoreEvents = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "events"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching events from Firestore:", e);
    return null;
  }
};

export const saveFirestoreEvent = async (event) => {
  if (!db) return false;
  try {
    const { id, ...data } = event;
    await setDoc(doc(db, "events", id), data);
    return true;
  } catch (e) {
    console.error("Error saving event to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreEvent = async (eventId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "events", eventId));
    return true;
  } catch (e) {
    console.error("Error deleting event from Firestore:", e);
    return false;
  }
};

// Event Participants CRUD
export const getFirestoreEventParticipants = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "eventParticipants"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching event participants from Firestore:", e);
    return null;
  }
};

export const saveFirestoreEventParticipant = async (participant) => {
  if (!db) return false;
  try {
    const { id, ...data } = participant;
    await setDoc(doc(db, "eventParticipants", id), data);
    return true;
  } catch (e) {
    console.error("Error saving event participant to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreEventParticipant = async (participantId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "eventParticipants", participantId));
    return true;
  } catch (e) {
    console.error("Error deleting event participant from Firestore:", e);
    return false;
  }
};

// Event Submissions CRUD
export const getFirestoreEventSubmissions = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "eventSubmissions"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching event submissions from Firestore:", e);
    return null;
  }
};

export const saveFirestoreEventSubmission = async (submission) => {
  if (!db) return false;
  try {
    const { id, ...data } = submission;
    await setDoc(doc(db, "eventSubmissions", id), data);
    return true;
  } catch (e) {
    console.error("Error saving event submission to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreEventSubmission = async (submissionId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "eventSubmissions", submissionId));
    return true;
  } catch (e) {
    console.error("Error deleting event submission from Firestore:", e);
    return false;
  }
};

// Withdrawals CRUD
export const getFirestoreWithdrawals = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "withdrawals"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching withdrawals from Firestore:", e);
    return null;
  }
};

export const saveFirestoreWithdrawal = async (withdrawal) => {
  if (!db) return false;
  try {
    const { id, ...data } = withdrawal;
    await setDoc(doc(db, "withdrawals", id), data);
    return true;
  } catch (e) {
    console.error("Error saving withdrawal to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreWithdrawal = async (withdrawalId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "withdrawals", withdrawalId));
    return true;
  } catch (e) {
    console.error("Error deleting withdrawal from Firestore:", e);
    return false;
  }
};

export { 
  db, 
  auth, 
  firebaseApp, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
};
