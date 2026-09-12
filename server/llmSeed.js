import fs from "node:fs";
import path from "node:path";
import { groqAvailable, groqChat } from "./groq.js";

const SEED_FILE = path.join(process.cwd(), ".data", "llm-seed.json");

function tryJson(reply) {
  if (!reply) return null;
  const start = reply.indexOf("{");
  if (start === -1) return null;
  let end = reply.lastIndexOf("}");
  let attempts = 0;
  while (end > start && attempts < 8) {
    try {
      return JSON.parse(reply.slice(start, end + 1));
    } catch {
      end = reply.lastIndexOf("}", end - 1);
      attempts += 1;
    }
  }
  return null;
}

export function hasLlmSeed() {
  try {
    const raw = fs.readFileSync(SEED_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Boolean(parsed && Array.isArray(parsed.problems) && parsed.problems.length > 0);
  } catch {
    return false;
  }
}

export function loadLlmSeed() {
  if (!hasLlmSeed()) return null;
  try {
    return JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
  } catch {
    return null;
  }
}

export async function saveLlmSeed(data) {
  fs.mkdirSync(path.dirname(SEED_FILE), { recursive: true });
  fs.writeFileSync(SEED_FILE, JSON.stringify(data, null, 2));
}

const STEP_A_SYSTEM =
  'You are the data generation engine for REGULENS, an Indian regulatory intelligence platform. You produce realistic, internally-consistent workspace datasets for a national regulator scenario. Respond with ONLY valid JSON. No markdown, no prose outside the JSON.';

async function stepA() {
  const user = `Generate TWO lists for an Asian (India-focused) regulatory workspace:

1) businesses: exactly 12 companies across industries that face Indian regulation (food & beverage, pharmaceuticals, banking/fintech, energy/power distribution, telecoms, agricultural exports, construction, manufacturing, healthcare, logistics, insurance, consumer retail). For each: id ("BSN-001".."BSN-012"), name, industry, location (an Indian city/state), impact ("High"|"Medium"|"Low"), risk ("High"|"Medium"|"Low"), status ("Affected"|"At Risk"|"Monitored"). Give realistic fictional company names.

2) regulations: exactly 12 Indian regulatory instruments. For each: id ("REG-1001".."REG-1012"), title (a realistic regulation/order/directive name), authority (realistic Indian regulator such as RBI, SEBI, FSSAI, TRAI, CDSCO, CEA, IRDAI or similar), jurisdiction ("Central"|"State"), effectiveDate ("YYYY-MM-DD" in 2025-2026), impact ("High"|"Medium"|"Low"), status ("Active"|"Pending"|"Under Review"), sections (integer 15-140), description (1-2 sentences on what it governs).

Return ONLY: {"businesses": [...], "regulations": [...]}`;
  const reply = await groqChat({ system: STEP_A_SYSTEM, user, maxTokens: 4000, temperature: 0.6 });
  const parsed = tryJson(reply);
  if (!parsed?.businesses || !parsed?.regulations) throw new Error("step A produced invalid JSON");
  return { businesses: parsed.businesses, regulations: parsed.regulations };
}

function referenceTables(data) {
  const b = (data.businesses || []).map((x) => `${x.id} ${x.name} (${x.industry}, ${x.location})`).join("\n");
  const r = (data.regulations || []).map((x) => `${x.id} ${x.title} (${x.authority})`).join("\n");
  return { b, r };
}

async function stepB(data, problemCount, startIndex) {
  const { b, r } = referenceTables(data);
  const fromProblem = startIndex + 1;
  const toProblem = startIndex + problemCount;
  const fromSol = startIndex + 1;
  const toSol = startIndex + problemCount + 2;
  const user =
`Generate problems and solutions using ONLY the reference IDs provided.

Businesses available:
${b}

Regulations available:
${r}

problems: exactly ${problemCount} distinct regulatory problems (ids "PRB-2026-00${fromProblem}".."PRB-2026-00${toProblem}"). For each include: id, title, location (2-3 Indian states/cities like Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, or "Federal (India)"), category, severity ("Critical"|"High"|"Medium"|"Low"), businessesAffected (integer), populationImpact (integer), status (one of "Under Review", "Implemented", "Pending Verification", "Resolved"), updated ("YYYY-MM-DD" between 2026-08-20 and 2026-09-11), summary (2-3 sentences), rootCauses (2-3 strings), scores (object with keys severity, businesses, population, economic, regulatoryRisk, urgency, geographic, each 3-10), affectedBusinessIds (2-4 of the BSN ids above - combine with severity), regulationIds (1-3 of the REG ids above), policyIds (CANNOT reference yet - set to []), solutionIds (the SOL ids you create in this same response), implementation {stage, progress (0-100), owner, nextMilestone}, geographic {areas (3-5 items, MUST always include "India" as the national pilot area plus 2-4 Indian states/regions/cities), businessConcentration, severityByArea (object area->severity with an entry for "India" and for every listed area)}.

solutions: exactly ${problemCount + 2} solutions (ids "SOL-300${fromSol}".."SOL-300${toSol}"). For each: id, title, problemId (a PRB-2026 id from this response), cost ("Low"|"Medium"|"High"), time ("N-NA months"), impact ("High"|"Medium"|"Low"), feasibility ("High"|"Medium"|"Low"), compatibility ("High"|"Medium"|"Low"), status ("Proposed"|"In Design"|"In Implementation"|"Implemented"), owner.

Every solutionId in each problem must exactly match a solution id you create, and every solution's problemId must be one of your problem ids. Keep data realistic and non-repetitive.

Return ONLY: {"problems": [...], "solutions": [...]}`;
  const reply = await groqChat({ system: STEP_A_SYSTEM, user, maxTokens: 14000, temperature: 0.6 });
  const parsed = tryJson(reply);
  if (!parsed?.problems || !parsed?.solutions) throw new Error(`step B (${startIndex}) produced invalid JSON`);
  return { problems: parsed.problems, solutions: parsed.solutions };
}

async function stepC(data) {
  const problemIds = (data.problems || []).map((p) => `${p.id} ${p.title}`).join("\n");
  const user =
`Problems available:
${problemIds}

Generate the following lists using ONLY the PRB-2026 problem ids above:

1) policies: exactly 6 (ids "POL-2001".."POL-2006"). Fields: id, title, problemId (must be a valid PRB-2026 id), type ("Proposed"|"Active"), status ("Draft"|"Under Consultation"|"In Implementation"), currentState, scenario, affectedGroups, economicEffect, operationalEffect, regulatoryEffect.

2) evidence: exactly 8 (ids "EVD-001".."EVD-008"). Fields: id, problemId (valid PRB-2026 id), type ("Photo"|"Document"|"Inspection"), title, status ("Verified"|"Pending"), date ("YYYY-MM-DD" in 2026), before, after.

3) reports: exactly 6 (ids "RPT-001".."RPT-006"). Fields: id, title, type (e.g. "Investigation", "Verification", "Analysis", "Baseline"), date, status ("Draft"|"Ready"), summary.

4) notifications: exactly 6 (ids "NTF-001".."NTF-006"). Fields: id, title, body, time (ISO timestamp in Sep 2026), type ("priority"|"evidence"|"policy"|"deadline"|"business"|"report"), unread (boolean).

5) auditLogs: exactly 10. Fields: time (ISO timestamp), actor (person name or "System"), action, outcome ("Success"|"Warning"|"Info"), target (an id like PRB-.../EVD-.../POL-.../RPT-...).

Make each item consistent with the problems above. Return ONLY:
{"policies": [...], "evidence": [...], "reports": [...], "notifications": [...], "auditLogs": [...]}`;
  const reply = await groqChat({ system: STEP_A_SYSTEM, user, maxTokens: 10000, temperature: 0.6 });
  const parsed = tryJson(reply);
  if (!parsed) throw new Error("step C produced invalid JSON");
  return parsed;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sanitize(data) {
  const problems = asArray(data.problems).filter((p) => p && p.id && p.title);
  const solutions = asArray(data.solutions).filter((s) => s && s.id && s.title);
  const businesses = asArray(data.businesses).filter((b) => b && b.id && b.name);
  const regulations = asArray(data.regulations).filter((r) => r && r.id && r.title);
  const policies = asArray(data.policies).filter((p) => p && p.id && p.title);
  const evidence = asArray(data.evidence).filter((e) => e && e.id && e.title);
  const reports = asArray(data.reports).filter((r) => r && r.id && r.title);
  const notifications = asArray(data.notifications).filter((n) => n && n.id);
  const auditLogs = asArray(data.auditLogs).filter((a) => a && a.time && a.action);

  const problemIds = new Set(problems.map((p) => p.id));
  const businessIds = new Set(businesses.map((b) => b.id));
  const regulationIds = new Set(regulations.map((r) => r.id));
  const policyIds = new Set(policies.map((p) => p.id));
  const solutionIds = new Set(solutions.map((s) => s.id));

  const pruned = {
    businesses,
    regulations,
    problems: problems.map((p) => ({
      ...p,
      affectedBusinessIds: asArray(p.affectedBusinessIds).filter((id) => businessIds.has(id)),
      regulationIds: asArray(p.regulationIds).filter((id) => regulationIds.has(id)),
      policyIds: asArray(p.policyIds).filter((id) => policyIds.has(id)),
      solutionIds: asArray(p.solutionIds).filter((id) => solutionIds.has(id)),
    })),
    solutions: solutions.filter((s) => problemIds.has(s.problemId)),
    policies: policies.filter((p) => problemIds.has(p.problemId)),
    evidence: evidence.filter((e) => problemIds.has(e.problemId)),
    reports,
    notifications,
    auditLogs,
  };
  pruned.problems.forEach((p) => {
    p.solutionIds = (p.solutionIds || []).filter((id) => solutionIds.has(id));
  });
  return pruned;
}

export async function generateLlmSeed() {
  if (!groqAvailable()) throw new Error("GROQ_API_KEY is not configured, cannot generate an AI seed.");
  const data = {};
  const partA = await stepA();
  data.businesses = partA.businesses;
  data.regulations = partA.regulations;

  const b1 = await stepB(data, 5, 0);
  const b2 = await stepB(data, 5, 5);
  data.problems = [...b1.problems, ...b2.problems];
  data.solutions = [...b1.solutions, ...b2.solutions];

  const partC = await stepC(data);
  data.policies = partC.policies;
  data.evidence = partC.evidence;
  data.reports = partC.reports;
  data.notifications = partC.notifications;
  data.auditLogs = partC.auditLogs;

  const clean = sanitize(data);
  await saveLlmSeed(clean);
  return clean;
}

export async function generateLlmSeedAndApply(seedState) {
  const data = await generateLlmSeed();
  if (data) {
    const { problems, businesses, regulations, policies, solutions, evidence, reports, notifications, auditLogs } = data;
    const target = seedState();
    Object.assign(target, {
      problems,
      businesses,
      regulations,
      policies,
      solutions,
      evidence,
      reports,
      notifications,
      auditLogs,
    });
    return target;
  }
  return null;
}