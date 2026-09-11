import crypto from "node:crypto";
import { db } from "./store.js";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const CODE_TTL_MS = 15 * 60 * 1000;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function makeCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  if (!db.state.sessions) db.state.sessions = { active: {} };
  db.state.sessions.active[token] = { userId, expiresAt: Date.now() + SESSION_TTL_MS };
  db.persist();
  return token;
}

function revokeSession(token) {
  if (db.state.sessions?.active && token) {
    delete db.state.sessions.active[token];
    db.persist();
  }
}

function userFromToken(token) {
  if (!token) return null;
  const session = db.state.sessions?.active?.[token];
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    revokeSession(token);
    return null;
  }
  return db.state.users.find((u) => u.id === session.userId) || null;
}

function authed(req) {
  const header = req.headers?.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return token ? userFromToken(token) : null;
}

function requireUser(req, res) {
  const user = authed(req);
  if (!user) {
    res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required. Sign in to continue." } });
    return null;
  }
  return user;
}

function findUserByEmail(email) {
  const key = String(email || "").trim().toLowerCase();
  return db.state.users.find((u) => u.email.toLowerCase() === key) || null;
}

export {
  hashPassword,
  verifyPassword,
  makeCode,
  createSession,
  revokeSession,
  findUserByEmail,
  authed,
  requireUser,
  userFromToken,
  CODE_TTL_MS,
};