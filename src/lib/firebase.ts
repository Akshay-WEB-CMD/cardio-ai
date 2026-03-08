import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjs3KSOyeOPHl0hW_oznf1xp4Zm3R4ZBI",
  authDomain: "cardio-ai-5b554.firebaseapp.com",
  projectId: "cardio-ai-5b554",
  storageBucket: "cardio-ai-5b554.firebasestorage.app",
  messagingSenderId: "495348448730",
  appId: "1:495348448730:web:2293b60c910a2cb4ecd4e3",
  measurementId: "G-J0V77G662K"
};

// Initialize Firebase only if API key is present
const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

const app = isFirebaseConfigured 
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : null;
export { isFirebaseConfigured };
