import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, 
         signInWithEmailAndPassword, createUserWithEmailAndPassword, 
         signOut, updateProfile, updateEmail, updatePassword, User } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

const logInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error logging in with email and password:", error);
    throw error;
  }
};

const registerWithEmailAndPassword = async (
  email: string, 
  password: string, 
  displayName: string
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return result.user;
  } catch (error) {
    console.error("Error registering with email and password:", error);
    throw error;
  }
};

const updateUserProfile = async (
  user: User,
  profile: { displayName?: string; photoURL?: string }
) => {
  try {
    await updateProfile(user, profile);
    return user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

const updateUserEmail = async (user: User, newEmail: string) => {
  try {
    await updateEmail(user, newEmail);
    return user;
  } catch (error) {
    console.error("Error updating user email:", error);
    throw error;
  }
};

const updateUserPassword = async (user: User, newPassword: string) => {
  try {
    await updatePassword(user, newPassword);
    return user;
  } catch (error) {
    console.error("Error updating user password:", error);
    throw error;
  }
};

const logout = () => {
  return signOut(auth);
};

// Export Firebase services and auth functions
export {
  auth,
  db,
  storage,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  logout
};