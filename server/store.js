import fs from "node:fs";
import path from "node:path";
import {
  PROBLEMS,
  BUSINESSES,
  REGULATIONS,
  POLICIES,
  SOLUTIONS,
  EVIDENCE,
  REPORTS,
  NOTIFICATIONS,
  AUDIT_LOGS,
} from "../lib/mockData.js";
import { buildWorkspace } from "./workspace.js";
import { readFromSupabase, supabaseConfigured } from "./supabase.js";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

function maxNumeric(ids, prefix) {
  let max = 0;
  for (const id of ids) {
    const match = String(id).match(new RegExp(`${prefix}(\\d+)`));
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max;
}

function seedBusinessState() {
  return {
    profile: null,
    problems: [],
    evidence: [],
    reports: [],
    notifications: [],
    notificationsRead: {},
    complianceStatus: {},
    certificationStatus: {},
  };
}

export function seedState() {
  return {
    problems: clone(PROBLEMS),
    businesses: clone(BUSINESSES),
    regulations: clone(REGULATIONS),
    policies: clone(POLICIES),
    solutions: clone(SOLUTIONS),
    evidence: clone(EVIDENCE),
    reports: clone(REPORTS),
    notifications: clone(NOTIFICATIONS),
    auditLogs: clone(AUDIT_LOGS),
    testAndScale: [],
    business: seedBusinessState(),
    businessWorkspaces: {},
  };
}

function seedCounters() {
  const base = seedState();
  return {
    problem: maxNumeric(base.problems.map((p) => p.id), "PRB-2026-"),
    evidence: maxNumeric(base.evidence.map((e) => e.id), "EVD-"),
    report: maxNumeric(base.reports.map((r) => r.id), "RPT-"),
    businessProblem: maxNumeric(base.business.problems.map((p) => p.id), "BP-"),
    businessEvidence: maxNumeric(base.business.evidence.map((e) => e.id), "BEV-"),
    notification: maxNumeric(base.notifications.map((n) => n.id), "NTF-"),
    testScale: maxNumeric([], "TS-"),
  };
}

function loadState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.problems)) {
      return {
        ...seedState(),
        ...parsed,
        business: { ...seedState().business, ...(parsed.business || {}) },
        businessWorkspaces: { ...(parsed.businessWorkspaces || {}) },
        users: parsed.users || [],
        idCounters: { ...seedCounters(), ...(parsed.idCounters || {}) },
      };
    }
  } catch {
    /* no persisted store yet */
  }
  const fresh = seedState();
  fresh.users = [];
  fresh.idCounters = seedCounters();
  return fresh;
}

function saveState(value) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(value, null, 2));
  } catch {
    /* data dir not writable in this environment */
  }
}

const state = loadState();

function persist() {
  saveState(state);
  import("./supabase.js")
    .then((m) => m.syncToSupabase(state))
    .catch(() => {});
}

let hydratedFromSupabase = false;

function computeCounters() {
  const wsList = Object.values(state.businessWorkspaces || {});
  return {
    problem: maxNumeric(state.problems.map((p) => p.id), "PRB-2026-"),
    evidence: maxNumeric(state.evidence.map((e) => e.id), "EVD-"),
    report: maxNumeric(state.reports.map((r) => r.id), "RPT-"),
    businessProblem: maxNumeric(wsList.flatMap((ws) => ws.problems || []).map((p) => p.id), "BP-"),
    businessEvidence: maxNumeric(wsList.flatMap((ws) => ws.evidence || []).map((e) => e.id), "BEV-"),
    notification: maxNumeric(
      state.notifications.concat(wsList.flatMap((ws) => ws.notifications || [])).map((n) => n.id),
      "NTF-"
    ),
    testScale: maxNumeric(state.testAndScale || [], "TS-"),
  };
}

export async function hydrateFromSupabase() {
  if (hydratedFromSupabase || !supabaseConfigured()) return false;
  hydratedFromSupabase = true;
  try {
    const remote = await readFromSupabase();
    if (!remote) return false;

    const gov = remote.government["government-demo"];
    if (gov) {
      for (const key of ["problems", "businesses", "regulations", "policies", "solutions", "evidence", "reports", "notifications", "auditLogs", "testAndScale", "users"]) {
        if (Array.isArray(gov[key])) state[key] = gov[key];
      }
    }

    for (const [workspaceId, ws] of Object.entries(remote.business || {})) {
      if (!workspaceId.startsWith("biz-") || !ws || typeof ws !== "object") continue;
      const userId = workspaceId.slice(4);
      state.businessWorkspaces[userId] = { ...seedBusinessState(), ...clone(ws) };
    }

    const merged = { ...seedCounters(), ...(gov?.idCounters || {}) };
    for (const [key, value] of Object.entries(computeCounters())) {
      merged[key] = Math.max(merged[key] || 0, value);
    }
    state.idCounters = merged;
    return true;
  } catch (err) {
    console.warn("[supabase] hydration failed, using local store:", err?.message || err);
    return false;
  }
}

function nextId(prefix, counterKey, pad = 3) {
  state.idCounters[counterKey] = (state.idCounters[counterKey] || 0) + 1;
  const n = state.idCounters[counterKey];
  return `${prefix}${String(n).padStart(pad, "0")}`;
}

function audit(action, { actor = "System", target = "", outcome = "Success" } = {}) {
  state.auditLogs.unshift({ time: now(), actor, action, outcome, target });
  persist();
}

function getProblem(id) {
  return state.problems.find((p) => p.id === id) || null;
}

function getBusiness(id) {
  return state.businesses.find((b) => b.id === id) || null;
}

function problemsByStatus() {
  const counts = { "Under Review": 0, Implemented: 0, "Pending Verification": 0, Resolved: 0 };
  state.problems.forEach((p) => {
    if (counts[p.status] !== undefined) counts[p.status] += 1;
  });
  return counts;
}

function problemsByCategory() {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const p of state.problems) {
    const level = p.scores ? priorityLevel(p.scores) : "Low";
    counts[level] += 1;
  }
  return counts;
}

const SAMPLE_SCORES = {
  Critical: { severity: 9, businesses: 8, population: 8, economic: 8, regulatoryRisk: 8, urgency: 9, geographic: 6 },
  High: { severity: 7, businesses: 7, population: 7, economic: 7, regulatoryRisk: 7, urgency: 7, geographic: 6 },
  Medium: { severity: 5, businesses: 5, population: 5, economic: 5, regulatoryRisk: 5, urgency: 5, geographic: 5 },
  Low: { severity: 3, businesses: 3, population: 3, economic: 3, regulatoryRisk: 3, urgency: 3, geographic: 4 },
};

function priorityLevel(scores) {
  const total =
    (scores.severity || 0) * 20 +
    (scores.businesses || 0) * 15 +
    (scores.population || 0) * 15 +
    (scores.economic || 0) * 15 +
    (scores.regulatoryRisk || 0) * 15 +
    (scores.urgency || 0) * 10 +
    (scores.geographic || 0) * 10;
  const score = total / 10;
  if (score >= 7.5) return "Critical";
  if (score >= 6.0) return "High";
  if (score >= 4.5) return "Medium";
  return "Low";
}

function createProblemFromFields(fields) {
  const severity = fields.severity || "Medium";
  const problem = {
    id: nextId("PRB-2026-", "problem"),
    title: fields.title,
    location: fields.location,
    category: fields.category,
    severity,
    businessesAffected: fields.businessesAffected || 0,
    populationImpact: fields.populationImpact || 0,
    status: "Under Review",
    updated: today(),
    summary: fields.summary,
    reporterEmail: fields.reporterEmail,
    rootCauses: fields.rootCauses || [],
    scores: clone(SAMPLE_SCORES[severity] || SAMPLE_SCORES.Medium),
    affectedBusinessIds: fields.affectedBusinessIds || [],
    regulationIds: fields.regulationIds || [],
    policyIds: fields.policyIds || [],
    solutionIds: fields.solutionIds || [],
    implementation:
      fields.implementation || { stage: "Unassessed", progress: 0, owner: "Triage Desk", nextMilestone: "Assessment scheduled" },
    geographic: { areas: [fields.location], businessConcentration: "Unassessed", severityByArea: { [fields.location]: severity } },
    audits: [{ time: now(), actor: "System", action: `Problem created${fields.reporterEmail ? ` by ${fields.reporterEmail}` : ""}` }],
    createdAt: now(),
  };
  state.problems.unshift(problem);
  persist();
  audit(`Problem created: ${problem.id}`, { target: problem.id });
  return problem;
}

function updateProblem(id, patch, actor = "System") {
  const problem = getProblem(id);
  if (!problem) return null;
  Object.assign(problem, patch, { updated: today() });
  if (!Array.isArray(problem.audits)) problem.audits = [];
  problem.audits.unshift({ time: now(), actor, action: "Problem details updated" });
  persist();
  audit(`Problem updated: ${id}`, { actor, target: id });
  return problem;
}

function addEvidence({ problemId, type, title, date, before, after }) {
  const item = {
    id: nextId("EVD-", "evidence"),
    problemId: problemId || "",
    type: type || "Document",
    title,
    status: "Pending",
    date: date || today(),
    before: before || "",
    after: after || "",
  };
  state.evidence.unshift(item);
  persist();
  audit(`Evidence added: ${item.id}`, { target: item.id });
  return item;
}

function updateEvidence(id, patch) {
  const item = state.evidence.find((e) => e.id === id);
  if (!item) return null;
  Object.assign(item, patch);
  persist();
  audit(`Evidence updated: ${id}`, { target: id });
  return item;
}

function addReport(fields) {
  const report = {
    id: nextId("RPT-", "report"),
    title: fields.title,
    type: fields.type || "Report",
    date: fields.date || today(),
    status: fields.status || "Draft",
    summary: fields.summary || "",
  };
  state.reports.unshift(report);
  persist();
  audit(`Report created: ${report.id}`, { target: report.id });
  return report;
}

function updateReport(id, patch) {
  const report = state.reports.find((r) => r.id === id);
  if (!report) return null;
  Object.assign(report, patch);
  persist();
  audit(`Report updated: ${id}`, { target: id });
  return report;
}

function addBusinessProblem(userId, fields) {
  const item = {
    id: nextId("BP-", "businessProblem"),
    title: fields.title,
    status: "REPORTED",
    updated: today(),
    severity: fields.severity || "Medium",
    category: fields.category || "General",
    description: fields.description || "",
    evidence: fields.evidence || [],
  };
  businessWorkspace(userId).problems.unshift(item);
  persist();
  return item;
}

function updateBusinessProblem(userId, id, patch) {
  const item = businessWorkspace(userId).problems.find((p) => p.id === id);
  if (!item) return null;
  Object.assign(item, patch, { updated: today() });
  persist();
  return item;
}

function addBusinessEvidence(userId, fields) {
  const item = {
    id: nextId("BEV-", "businessEvidence"),
    type: fields.type || "Document",
    title: fields.title,
    problemId: fields.problemId || "",
    status: fields.status || "Pending",
    date: fields.date || today(),
    size: fields.size ?? null,
    note: fields.note || "",
    progress: fields.progress ?? null,
    analysis: fields.analysis || null,
  };
  businessWorkspace(userId).evidence.unshift(item);
  persist();
  return item;
}

function updateBusinessEvidence(userId, id, patch) {
  const item = businessWorkspace(userId).evidence.find((e) => e.id === id);
  if (!item) return null;
  Object.assign(item, patch);
  persist();
  return item;
}

function addBusinessNotification(userId, title, body, type) {
  const item = { id: nextId("NTF-", "notification"), title, body, time: now(), type: type || "info", unread: true };
  businessWorkspace(userId).notifications.unshift(item);
  persist();
  return item;
}

function addGovNotification(title, body, type) {
  const item = { id: nextId("NTF-", "notification"), title, body, time: now(), type: type || "info", unread: true };
  state.notifications.unshift(item);
  persist();
  return item;
}

function addTestAndScale(fields) {
  const record = {
    id: nextId("TS-", "testScale"),
    problemId: fields.problemId,
    problemTitle: fields.problemTitle,
    solutionId: fields.solutionId,
    solutionTitle: fields.solutionTitle,
    pilotArea: fields.pilotArea,
    analysis: fields.analysis,
    createdAt: now(),
  };
  state.testAndScale.unshift(record);
  persist();
  audit(`Test & Scale analysis created: ${record.id}`, { actor: fields.actor || "System", target: record.problemId });
  return record;
}

function resetGovernmentData() {
  const seed = seedState();
  state.problems = seed.problems;
  state.businesses = seed.businesses;
  state.regulations = seed.regulations;
  state.policies = seed.policies;
  state.solutions = seed.solutions;
  state.evidence = seed.evidence;
  state.reports = seed.reports;
  state.notifications = seed.notifications;
  state.auditLogs = [];
  state.testAndScale = [];
  persist();
  audit("Workspace data cleared (reset to demo baseline)", { actor: "System" });
  return {
    problems: state.problems.length,
    businesses: state.businesses.length,
    regulations: state.regulations.length,
    policies: state.policies.length,
    solutions: state.solutions.length,
    evidence: state.evidence.length,
    reports: state.reports.length,
  };
}

function resetBusinessWorkspace(userId) {
  state.businessWorkspaces[userId] = seedBusinessState();
  persist();
  return true;
}

function dashboardStats() {
  return {
    total: state.problems.length,
    statusCounts: problemsByStatus(),
    priorityCounts: problemsByCategory(),
    categories: state.problems.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}),
    totalBusinesses: state.businesses.length,
    totalRegulations: state.regulations.length,
    totalPolicies: state.policies.length,
    totalSolutions: state.solutions.length,
    evidenceCount: state.evidence.length,
    reportsCount: state.reports.length,
    auditCount: state.auditLogs.length,
    recentAudits: clone(state.auditLogs.slice(0, 8)),
  };
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, reset, verification, ...safe } = { ...user };
  return safe;
}

function businessWorkspace(userId) {
  if (!state.businessWorkspaces) state.businessWorkspaces = {};
  if (!state.businessWorkspaces[userId]) state.businessWorkspaces[userId] = seedBusinessState();
  return state.businessWorkspaces[userId];
}

function businessDataFor(userId) {
  const ws = businessWorkspace(userId);
  const derived = buildWorkspace(ws.profile, {
    problems: ws.problems,
    evidence: ws.evidence,
    reports: ws.reports,
    notifications: ws.notifications,
    notificationsRead: ws.notificationsRead,
    complianceStatus: ws.complianceStatus,
    certificationStatus: ws.certificationStatus,
  });
  return {
    ...derived,
    profile: ws.profile ? clone(ws.profile) : null,
  };
}

function businessData() {
  return businessDataFor("demo");
}

export const db = {
  get state() {
    return state;
  },
  persist,
  now,
  today,
  audit,
  getProblem,
  getBusiness,
  problemsByStatus,
  problemsByCategory,
  priorityLevel,
  createProblemFromFields,
  updateProblem,
  addEvidence,
  updateEvidence,
  addReport,
  updateReport,
  addBusinessProblem,
  updateBusinessProblem,
  addBusinessEvidence,
  updateBusinessEvidence,
  addBusinessNotification,
  addGovNotification,
  addTestAndScale,
  resetGovernmentData,
  resetBusinessWorkspace,
  dashboardStats,
  publicUser,
  businessWorkspace,
  businessDataFor,
  businessData,
};