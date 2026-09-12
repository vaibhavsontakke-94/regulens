import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export const FIREBASE_HASH_CONFIG = {
  algorithm: "SCRYPT",
  base64_signer_key: "j9Ov7OHvBzvQ+gMlxf1YeXaGZE+8XQh/xZdn9l0CnLvymVUjE8AIzKJeN7nvdoBRYN1kFEgnAWpKOSXsSe0oaw==",
  base64_salt_separator: "Bw==",
  rounds: 8,
  mem_cost: 14,
};

let firebaseApp;
let firebaseAuth;

function getFirebaseApp() {
  if (typeof window === "undefined") return null;
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

function getFirebaseAuth() {
  if (typeof window === "undefined") return null;
  const app = getFirebaseApp();
  if (!app) return null;
  if (!firebaseAuth) firebaseAuth = getAuth(app);
  return firebaseAuth;
}

function mapFirebaseError(err) {
  const code = err?.code || "";
  const MESSAGES = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-not-found": "No account found with that email address.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Use 8+ characters with upper & lower case and a number.",
    "auth/operation-not-allowed": "Email & password sign-in is not enabled.",
    "auth/missing-password": "Password is required.",
    "auth/network-request-failed": "Unable to reach Firebase. Check your connection and try again.",
  };
  return MESSAGES[code] || err?.message || "Something went wrong. Please try again.";
}

export async function firebaseSignIn(email, password) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not available.");
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function firebaseSignUp({ email, password, name }) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not available.");
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    try {
      await updateProfile(credential.user, { displayName: name });
    } catch {
      /* non-fatal */
    }
  }
  return credential.user;
}

export async function firebaseSendPasswordReset(email, actionCodeSettings) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not available.");
  await sendPasswordResetEmail(auth, email, actionCodeSettings);
}

export async function firebaseConfirmReset(code, newPassword) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not available.");
  await confirmPasswordReset(auth, code, newPassword);
}

export async function firebaseSignOutUser() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function firebaseUserToSession(user, role, fallbackName) {
  const email = user?.email || "";
  const name =
    user?.displayName ||
    fallbackName ||
    String(email).split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
  return {
    uid: user?.uid,
    email,
    role,
    name,
    provider: user?.providerId || "firebase",
  };
}

export async function trackFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    const { getAnalytics } = await import("firebase/analytics");
    return getAnalytics(app);
  } catch {
    return null;
  }
}

export { mapFirebaseError };