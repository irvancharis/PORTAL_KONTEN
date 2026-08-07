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
  getDoc,
  writeBatch 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
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
export const getFirestoreUser = async (userId) => {
  if (!db) return null;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (e) {
    console.error("Error fetching single user from Firestore:", e);
    return null;
  }
};

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

// Gifts CRUD
export const getFirestoreGifts = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "gifts"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching gifts from Firestore:", e);
    return null;
  }
};

export const saveFirestoreGift = async (gift) => {
  if (!db) return false;
  try {
    const { id, ...data } = gift;
    await setDoc(doc(db, "gifts", id), data);
    return true;
  } catch (e) {
    console.error("Error saving gift to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreGift = async (giftId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "gifts", giftId));
    return true;
  } catch (e) {
    console.error("Error deleting gift from Firestore:", e);
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

// Offers CRUD
export const getFirestoreOffers = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "offers"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching offers from Firestore:", e);
    return null;
  }
};

export const saveFirestoreOffer = async (offer) => {
  if (!db) return false;
  try {
    const { id, ...data } = offer;
    await setDoc(doc(db, "offers", id), data);
    return true;
  } catch (e) {
    console.error("Error saving offer to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreOffer = async (offerId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "offers", offerId));
    return true;
  } catch (e) {
    console.error("Error deleting offer from Firestore:", e);
    return false;
  }
};

// Financial Journals CRUD
export const getFirestoreFinancialJournals = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "financialJournals"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching financialJournals from Firestore:", e);
    return null;
  }
};

export const saveFirestoreFinancialJournal = async (journal) => {
  if (!db) return false;
  try {
    const { id, ...data } = journal;
    await setDoc(doc(db, "financialJournals", id), data);
    return true;
  } catch (e) {
    console.error("Error saving financialJournal to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreFinancialJournal = async (journalId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "financialJournals", journalId));
    return true;
  } catch (e) {
    console.error("Error deleting financialJournal from Firestore:", e);
    return false;
  }
};

export const getFirestoreCommunities = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "communities"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching communities from Firestore:", e);
    return null;
  }
};

export const saveFirestoreCommunity = async (community) => {
  if (!db) return false;
  try {
    const { id, ...data } = community;
    await setDoc(doc(db, "communities", id), data);
    return true;
  } catch (e) {
    console.error("Error saving community to Firestore:", e);
    return false;
  }
};

export const deleteFirestoreCommunity = async (communityId) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "communities", communityId));
    return true;
  } catch (e) {
    console.error("Error deleting community from Firestore:", e);
    return false;
  }
};

// Regions CRUD & Seeding
export const getFirestoreRegions = async () => {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "regions"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.error("Error fetching regions from Firestore:", e);
    return null;
  }
};

export const seedFirestoreRegions = async (regionsList) => {
  if (!db) return false;
  try {
    const chunkSize = 400;
    for (let i = 0; i < regionsList.length; i += chunkSize) {
      const chunk = regionsList.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((name) => {
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        batch.set(doc(db, "regions", id), { name });
      });
      await batch.commit();
      console.log(`Seeded batch of ${chunk.length} regions to Firestore.`);
    }
    return true;
  } catch (e) {
    console.error("Error seeding regions to Firestore:", e);
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
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
};
