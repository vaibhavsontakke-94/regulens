const SESSION_KEY = "regulens-session";
const PENDING_KEY = "regulens-verify";

function read(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function getSession() {
  if (typeof window === "undefined") return null;
  return read(window.localStorage, SESSION_KEY);
}

export function setSession(session) {
  if (typeof window === "undefined") return;
  write(window.localStorage, SESSION_KEY, session);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getRememberedEmail() {
  if (typeof window === "undefined") return "";
  const session = getSession();
  if (session && session.rememberEmail && session.email) return session.email;
  try {
    return window.localStorage.getItem("regulens-remembered-email") || "";
  } catch {
    return "";
  }
}

export function rememberEmail(email) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("regulens-remembered-email", email || "");
  } catch {
    /* ignore */
  }
}

export function getPendingVerification() {
  if (typeof window === "undefined") return null;
  return read(window.sessionStorage, PENDING_KEY);
}

export function setPendingVerification(pending) {
  if (typeof window === "undefined") return;
  write(window.sessionStorage, PENDING_KEY, pending);
}

export function clearPendingVerification() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}