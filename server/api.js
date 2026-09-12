import { requireUser } from "./auth.js";
import { ensureDemoUsers } from "./seed-users.js";
import { db, hydrateFromSupabase } from "./store.js";
import authRoutes from "./routes/auth.js";
import governmentRoutes from "./routes/government.js";
import businessRoutes from "./routes/business.js";
import metaRoutes from "./routes/meta.js";
import { ok, notFound } from "./http.js";

const MANIFEST = {
  auth: ["register", "login", "verify", "resend-code", "forgot-password", "reset-password", "logout", "session", "firebase-session"],
  government: [
    "dashboard",
    "problems",
    "problems/:id",
    "problems/:id/businesses",
    "problems/:id/regulations",
    "problems/:id/policies",
    "problems/:id/solutions",
    "problems/:id/evidence",
    "problems/:id/audits",
    "problem-intelligence",
    "businesses",
    "businesses/:id",
    "regulations",
    "policies",
    "solutions",
    "evidence",
    "evidence/:id",
    "reports",
    "reports/:id",
    "notifications",
    "notifications/read-all",
    "audit-logs",
    "copilot",
  ],
  business: [
    "dashboard",
    "profile",
    "source",
    "health",
    "compliance",
    "compliance/:id",
    "risks",
    "regulatory-risk",
    "financial-impact",
    "expansion",
    "expansion-readiness",
    "growth",
    "certifications",
    "certifications/:id",
    "certification-intelligence",
    "regulatory-updates",
    "schemes",
    "problems",
    "problems/:id",
    "evidence",
    "evidence/:id",
    "evidence/:id/analyze",
    "reports",
    "notifications",
    "notifications/read-all",
    "copilot",
    "ai",
  ],
  meta: ["options"],
};

export default async function handleApi(req, res, segments) {
  await hydrateFromSupabase().catch(() => {});
  ensureDemoUsers();
  const parts = (segments || []).map((s) => decodeURIComponent(String(s)));
  const [head = "", ...rest] = parts;

  try {
    if (!head || head === "") {
      return ok(res, { service: "REGULENS API", version: "1", endpoints: MANIFEST });
    }

    if (head === "health") {
      if (req.method !== "GET") {
        return res.status(405).json({ ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } });
      }
      return ok(res, {
        ok: true,
        service: "regulens",
        time: db.now(),
        counts: {
          users: db.state.users.length,
          problems: db.state.problems.length,
          businesses: db.state.businesses.length,
          evidence: db.state.evidence.length,
          auditLogs: db.state.auditLogs.length,
        },
      });
    }

    if (head === "meta") {
      return metaRoutes(req, res, rest);
    }

    if (head === "auth") {
      return authRoutes(req, res, rest);
    }

    if (head === "government" || head === "gov") {
      const user = requireUser(req, res);
      if (!user) return undefined;
      return governmentRoutes(req, res, rest, user);
    }

    if (head === "business" || head === "biz") {
      const user = requireUser(req, res);
      if (!user) return undefined;
      return businessRoutes(req, res, rest, user);
    }

    return notFound(res, `No route for /api/${parts.join("/")}`);
  } catch (err) {
    console.error("[api] internal error", err);
    return res.status(500).json({ ok: false, error: { code: "INTERNAL", message: "Something went wrong." } });
  }
}