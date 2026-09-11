import { db } from "../store.js";
import {
  hashPassword,
  verifyPassword,
  makeCode,
  createSession,
  revokeSession,
  findUserByEmail,
  userFromToken,
  CODE_TTL_MS,
} from "../auth.js";
import { ok, created, badRequest, unauthorized, notFound, conflict, methodNotAllowed } from "../http.js";
import { isEmail, isEmpty, passwordMeetsAll } from "../../lib/validators.js";
import { ROLES } from "../../components/auth/roles.js";

function sessionPayload(user, token) {
  return {
    session: {
      token,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    redirect: ROLES[user.role].home,
  };
}

function randomId() {
  return `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateRegistration(body) {
  const role = body.role;
  if (!ROLES[role]) return "Invalid role.";
  if (isEmpty(body.fullName)) return "Full name is required.";
  if (!isEmail(body.email)) return "Enter a valid email address.";
  if (!passwordMeetsAll(body.password)) return "Use 8+ characters with upper & lower case and a number.";

  if (role === "government") {
    if (isEmpty(body.department)) return "Department is required.";
    if (isEmpty(body.designation)) return "Designation is required.";
    if (isEmpty(body.organization)) return "Organization is required.";
    if (isEmpty(body.govId)) return "Government ID is required.";
  } else {
    if (isEmpty(body.businessName)) return "Business name is required.";
    if (isEmpty(body.industry)) return "Select an industry.";
    if (isEmpty(body.location)) return "Business location is required.";
  }
  return null;
}

export default function authRoutes(req, res, sub) {
  const [target = "", id] = sub;

  if (target === "register") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const error = validateRegistration(req.body || {});
    if (error) return badRequest(res, error);
    const email = String(req.body.email).trim();
    if (findUserByEmail(email)) return conflict(res, "An account with this email already exists.");

    const profile =
      req.body.role === "government"
        ? { department: req.body.department, designation: req.body.designation, organization: req.body.organization, govId: req.body.govId }
        : { businessName: req.body.businessName, industry: req.body.industry, location: req.body.location };

    const user = {
      id: randomId(),
      role: req.body.role,
      email,
      name: String(req.body.fullName).trim(),
      passwordHash: hashPassword(req.body.password),
      verified: false,
      createdAt: db.now(),
      accountType: "registered",
      profile,
      verification: { code: makeCode(), purpose: "register", expiresAt: Date.now() + CODE_TTL_MS },
      reset: null,
      businessProfile: null,
    };
    db.state.users.push(user);
    db.persist();
    db.audit(`Account registered: ${email}`, { target: user.id });
    return created(res, { role: user.role, email: user.email, name: user.name, verificationCode: user.verification.code });
  }

  if (target === "login") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const { role, email, password } = req.body || {};
    if (!ROLES[role]) return badRequest(res, "Invalid role.");
    const user = findUserByEmail(email);
    const okPass = user && verifyPassword(password, user.passwordHash);
    if (!user || !okPass) return unauthorized(res, "Incorrect email or password.");
    if (user.role !== role) return unauthorized(res, "This email belongs to another workspace.");

    if (!user.verified) {
      user.verified = true;
      db.persist();
    }

    const token = createSession(user.id);
    db.audit(`Signed in: ${user.email}`, { actor: user.name, target: user.id });
    return ok(res, sessionPayload(user, token));
  }

  if (target === "verify") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const { email, code, purpose } = req.body || {};
    const user = findUserByEmail(email);
    if (!user) return notFound(res, "No account found for this email.");

    const entry = purpose === "reset" ? user.reset : user.verification;
    if (!entry || !entry.code || entry.code !== String(code || "").trim()) {
      return badRequest(res, "That verification code is invalid or has expired.");
    }
    if (entry.expiresAt < Date.now()) {
      return badRequest(res, "That verification code has expired. Request a new one.");
    }

    if (purpose === "reset") {
      user.reset = null;
      db.persist();
      db.audit(`Password reset verified: ${user.email}`, { target: user.id });
      return ok(res, { purpose: "reset", email: user.email });
    }

    user.verification = null;
    user.verified = true;
    db.persist();
    db.audit(`Account verified: ${user.email}`, { target: user.id });
    const token = createSession(user.id);
    return ok(res, sessionPayload(user, token));
  }

  if (target === "resend-code") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const { email, purpose } = req.body || {};
    const user = findUserByEmail(email);
    if (!user) return notFound(res, "No account found for this email.");
    const code = makeCode();
    if (purpose === "reset") user.reset = { code, purpose: "reset", expiresAt: Date.now() + CODE_TTL_MS };
    else user.verification = { code, purpose: user.verification?.purpose || "register", expiresAt: Date.now() + CODE_TTL_MS };
    db.persist();
    return ok(res, { verificationCode: code });
  }

  if (target === "forgot-password") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const { role, email } = req.body || {};
    if (!ROLES[role]) return badRequest(res, "Invalid role.");
    if (!isEmail(email)) return badRequest(res, "Enter a valid email address.");
    const user = findUserByEmail(email);
    if (!user) return notFound(res, "No account found with that email address.");
    const code = makeCode();
    user.reset = { code, purpose: "reset", expiresAt: Date.now() + CODE_TTL_MS };
    db.persist();
    db.audit(`Password reset requested: ${user.email}`, { target: user.id });
    return ok(res, { email: user.email, purpose: "reset", verificationCode: code });
  }

  if (target === "reset-password") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const { email, code, password } = req.body || {};
    const user = findUserByEmail(email);
    if (!user) return notFound(res, "No account found for this email.");
    if (!passwordMeetsAll(password)) return badRequest(res, "Use 8+ characters with upper & lower case and a number.");
    if (!user.reset || user.reset.code !== String(code || "").trim()) {
      return badRequest(res, "That verification code is invalid or has expired.");
    }
    user.passwordHash = hashPassword(password);
    user.reset = null;
    db.persist();
    db.audit(`Password reset completed: ${user.email}`, { target: user.id });
    return ok(res, { done: true });
  }

  if (target === "logout") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const header = req.headers?.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) revokeSession(token);
    return ok(res, { done: true });
  }

  if (target === "session") {
    if (req.method !== "GET") return methodNotAllowed(res);
    const header = req.headers?.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const user = token ? userFromToken(token) : null;
    if (!user) return unauthorized(res, "No active session.");
    return ok(res, { user: db.publicUser(user) });
  }

  return notFound(res, `Unknown auth endpoint: ${target || "/api/auth"}`);
}