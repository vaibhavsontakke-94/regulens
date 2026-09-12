import { getSession, setSession } from "./authSession";

const BASE = "/api";

const DEMO_GOV = { role: "government", email: "analyst@regulens.gov.ng", password: "DemoPass#123" };
const DEMO_BIZ = { role: "business", email: "ops@nortextextiles.demo", password: "DemoPass#123" };

let healing = false;

async function refreshDemoSession(path) {
  const creds = path.startsWith("/business") ? DEMO_BIZ : DEMO_GOV;
  let res;
  try {
    res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
      cache: "no-store",
    });
  } catch {
    return false;
  }
  if (!res.ok) return false;
  const json = await res.json().catch(() => null);
  if (json?.data?.session) {
    setSession(json.data.session);
    return true;
  }
  return false;
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function handleApiError(err) {
  if (err instanceof ApiError) return err.message;
  return err?.message || "Something went wrong. Please try again.";
}

async function doRequest(method, path, body, options, token) {
  let url = `${BASE}${path}`;
  if (options.query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== "") params.set(key, value);
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined || body === null ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0, "NETWORK");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new ApiError(
      json?.error?.message || `Request failed (${res.status})`,
      res.status,
      json?.error?.code || "REQUEST_FAILED"
    );
  }

  return json?.data ?? json;
}

export async function request(method, path, body, options = {}) {
  let token = options.token;
  if (!token && typeof window !== "undefined") {
    token = getSession()?.token || null;
  }

  try {
    return await doRequest(method, path, body, options, token);
  } catch (err) {
    const staleSession = err instanceof ApiError && err.status === 401 && !path.startsWith("/auth/");
    if (staleSession && typeof window !== "undefined" && !healing) {
      healing = true;
      try {
        const healed = await refreshDemoSession(path);
        const freshToken = getSession()?.token || null;
        if (healed && freshToken) return await doRequest(method, path, body, options, freshToken);
      } finally {
        healing = false;
      }
    }
    throw err;
  }
}

export const api = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
  del: (path, options) => request("DELETE", path, undefined, options),
};

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  verify: (payload) => api.post("/auth/verify", payload),
  resendCode: (payload) => api.post("/auth/resend-code", payload),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
  resetPassword: (payload) => api.post("/auth/reset-password", payload),
  logout: (options) => api.post("/auth/logout", {}, options),
  session: (options) => api.get("/auth/session", options),
  firebaseSession: (payload) => api.post("/auth/firebase-session", payload),
};

export const govApi = {
  dashboard: () => api.get("/government/dashboard"),
  resetData: () => api.post("/government/reset-data", {}),
  listProblems: (query) => api.get("/government/problems", { query }),
  problem: (id) => api.get(`/government/problems/${id}`),
  createProblem: (payload) => api.post("/government/problems", payload),
  updateProblem: (id, payload) => api.patch(`/government/problems/${id}`, payload),
  deleteProblem: (id) => api.del(`/government/problems/${id}`),
  problemBusinesses: (id) => api.get(`/government/problems/${id}/businesses`),
  problemRegulations: (id) => api.get(`/government/problems/${id}/regulations`),
  problemPolicies: (id) => api.get(`/government/problems/${id}/policies`),
  problemSolutions: (id) => api.get(`/government/problems/${id}/solutions`),
  problemEvidence: (id) => api.get(`/government/problems/${id}/evidence`),
  problemAudits: (id) => api.get(`/government/problems/${id}/audits`),
  buildIntelligence: (payload) => api.post("/government/problem-intelligence", payload),
  problemMatches: (payload) => api.post("/government/problem-matches", payload),
  testAndScale: (payload) => api.post("/government/test-and-scale", payload),
  listBusinesses: (query) => api.get("/government/businesses", { query }),
  business: (id) => api.get(`/government/businesses/${id}`),
  regulations: () => api.get("/government/regulations"),
  policies: () => api.get("/government/policies"),
  solutions: () => api.get("/government/solutions"),
  evidence: (query) => api.get("/government/evidence", { query }),
  createEvidence: (payload) => api.post("/government/evidence", payload),
  updateEvidence: (id, payload) => api.patch(`/government/evidence/${id}`, payload),
  deleteEvidence: (id) => api.del(`/government/evidence/${id}`),
  reports: () => api.get("/government/reports"),
  createReport: (payload) => api.post("/government/reports", payload),
  updateReport: (id, payload) => api.patch(`/government/reports/${id}`, payload),
  notifications: () => api.get("/government/notifications"),
  createNotification: (payload) => api.post("/government/notifications", payload),
  markNotification: (id, payload) => api.patch(`/government/notifications/${id}`, payload),
  markAllNotificationsRead: () => api.post("/government/notifications/read-all", {}),
  auditLogs: (query) => api.get("/government/audit-logs", { query }),
  copilot: (payload) => api.post("/government/copilot", payload),
  documentReview: (payload) => api.post("/government/document-review", payload),
};

export const bizApi = {
  dashboard: () => api.get("/business/dashboard"),
  resetData: () => api.post("/business/reset-data", {}),
  workspace: () => api.get("/business/workspace"),
  profile: () => api.get("/business/profile"),
  saveProfile: (payload) => api.post("/business/profile", payload),
  patchProfile: (payload) => api.patch("/business/profile", payload),
  sourceProfile: () => api.get("/business/source"),
  health: () => api.get("/business/health"),
  compliance: () => api.get("/business/compliance"),
  updateCompliance: (id, payload) => api.patch(`/business/compliance/${id}`, payload),
  risks: () => api.get("/business/risks"),
  regulatoryRisk: () => api.get("/business/regulatory-risk"),
  financialImpact: () => api.get("/business/financial-impact"),
  expansion: () => api.get("/business/expansion"),
  expansionReadiness: () => api.get("/business/expansion-readiness"),
  growth: () => api.get("/business/growth"),
  certifications: () => api.get("/business/certifications"),
  updateCertification: (id, payload) => api.patch(`/business/certifications/${id}`, payload),
  certificationIntel: () => api.get("/business/certification-intelligence"),
  regulatoryUpdates: () => api.get("/business/regulatory-updates"),
  schemes: () => api.get("/business/schemes"),
  problems: () => api.get("/business/problems"),
  createProblem: (payload) => api.post("/business/problems", payload),
  updateProblem: (id, payload) => api.patch(`/business/problems/${id}`, payload),
  evidence: (query) => api.get("/business/evidence", { query }),
  createEvidence: (payload) => api.post("/business/evidence", payload),
  updateEvidence: (id, payload) => api.patch(`/business/evidence/${id}`, payload),
  analyzeEvidence: (id) => api.post(`/business/evidence/${id}/analyze`, {}),
  deleteEvidence: (id) => api.del(`/business/evidence/${id}`),
  reports: () => api.get("/business/reports"),
  notifications: () => api.get("/business/notifications"),
  markNotification: (id, payload) => api.patch(`/business/notifications/${id}`, payload),
  markAllNotificationsRead: () => api.post("/business/notifications/read-all", {}),
  copilot: (payload) => api.post("/business/copilot", payload),
  documentReview: (payload) => api.post("/business/document-review", payload),
  ai: (payload) => api.post("/business/ai", payload),
};

export const metaApi = {
  options: () => api.get("/meta"),
};

export default request;