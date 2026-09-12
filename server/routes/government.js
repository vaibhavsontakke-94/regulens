import { db } from "../store.js";
import { ok, created, badRequest, notFound, methodNotAllowed } from "../http.js";
import { buildProblemIntelligence, PROBLEM_LIFECYCLE } from "../../lib/problemIntelligence.js";
import { isEmail, isEmpty } from "../../lib/validators.js";
import { groqWithFallback } from "../groq.js";
import { runTestAndScale } from "../govAi.js";
import { matchProblemProviders } from "../problemMatcher.js";
import { INDIA_STATES } from "../../lib/businessProfileData.js";
import { INDIA_DISTRICTS, INDIA_DISTRICT_GROUPS } from "../../lib/indiaDistricts.js";
import { extractDocumentText } from "../documentText.js";

const INDIA_PILOT_AREAS = new Set([
  "India",
  "National",
  "Federal (India)",
  ...INDIA_STATES,
  ...INDIA_DISTRICTS,
  ...Object.keys(INDIA_DISTRICT_GROUPS),
]);

function businessForIds(ids) {
  return (ids || []).map((id) => db.state.businesses.find((b) => b.id === id)).filter(Boolean);
}

function filtersFromQuery(query) {
  const q = String(query.q || "").trim().toLowerCase();
  return {
    q,
    status: query.status || "",
    category: query.category || "",
    severity: query.severity || "",
    priority: query.priority || "",
    sort: query.sort || "updated",
    order: query.order === "asc" ? "asc" : "desc",
  };
}

function filterProblems(list, f) {
  let out = list.filter((p) => {
    if (f.q) {
      const haystack = `${p.title} ${p.id} ${p.category} ${p.location}`.toLowerCase();
      if (!haystack.includes(f.q)) return false;
    }
    if (f.status && p.status !== f.status) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.severity && p.severity !== f.severity) return false;
    if (f.priority) {
      const level = db.priorityLevel(p.scores || {});
      if (level !== f.priority) return false;
    }
    return true;
  });

  out = out.sort((a, b) => {
    let diff = 0;
    if (f.sort === "businesses") diff = a.businessesAffected - b.businessesAffected;
    else if (f.sort === "population") diff = a.populationImpact - b.populationImpact;
    else if (f.sort === "title") diff = a.title.localeCompare(b.title);
    else if (f.sort === "severity") diff = String(a.severity).localeCompare(String(b.severity));
    else if (f.sort === "priority") {
      const sa = db.priorityLevel(a.scores || {});
      const sb = db.priorityLevel(b.scores || {});
      const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      diff = (order[sa] || 0) - (order[sb] || 0);
    } else diff = new Date(a.updated) - new Date(b.updated);
    return f.order === "asc" ? diff : -diff;
  });
  return out;
}

export default async function governmentRoutes(req, res, sub, user) {
  const [head = ""] = sub;

  if (head === "" || head === "dashboard") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, db.dashboardStats());
  }

  if (head === "reset-data") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const counts = db.resetGovernmentData();
    return ok(res, { reset: true, counts });
  }

  if (head === "problem-intelligence") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const body = req.body || {};
    if (isEmpty(body.title)) return badRequest(res, "A problem title is required.");
    const businesses = Array.isArray(body.businesses) ? body.businesses : [];
    const data = buildProblemIntelligence({ id: body.id || `PRB-${Date.now()}`, title: body.title, businesses });
    const narrative = await intelligenceNarrative(body.title, businesses);
    return ok(res, { intelligence: { ...data, narrative }, lifecycle: PROBLEM_LIFECYCLE });
  }

  if (head === "problem-matches") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const body = req.body || {};
    const title = String(body.problem || body.title || "").trim();
    if (!title) return badRequest(res, "Describe the problem before searching.");
    const result = await matchProblemProviders(title, {
      businesses: db.state.businesses,
      solutions: db.state.solutions,
    });
    return ok(res, result);
  }

  if (head === "test-and-scale") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const body = req.body || {};
    const problem = db.getProblem(body.problemId);
    if (!problem) return badRequest(res, "Select a valid problem.");
    const solution = (problem.solutionIds || [])
      .map((id) => db.state.solutions.find((s) => s.id === id))
      .filter(Boolean)
      .find((s) => s.id === body.solutionId);
    if (!solution) return badRequest(res, "Select a solution linked to this problem.");
    const areas = (problem.geographic && problem.geographic.areas) || [];
    const pilotArea = String(body.pilotArea || "").trim();
    if (!areas.includes(pilotArea) && !INDIA_PILOT_AREAS.has(pilotArea)) {
      return badRequest(res, "Select a pilot area covered by this problem.");
    }
    const analysis = await runTestAndScale({ problem, solution, pilotArea });
    const record = db.addTestAndScale({
      problemId: problem.id,
      problemTitle: problem.title,
      solutionId: solution.id,
      solutionTitle: solution.title,
      pilotArea,
      analysis,
      actor: user.name,
    });
    return created(res, { record });
  }

  if (head === "problems") {
    if (sub.length === 1) {
      if (req.method === "GET") {
        const f = filtersFromQuery(req.query);
        return ok(res, { problems: filterProblems(db.state.problems, f), meta: { count: db.state.problems.length } });
      }
      if (req.method === "POST") {
        const body = req.body || {};
        if (isEmpty(body.title)) return badRequest(res, "Problem title is required.");
        if (!isEmail(body.reporterEmail)) return badRequest(res, "Enter a valid report email.");
        if (isEmpty(body.summary)) return badRequest(res, "Summary is required.");
        const problem = db.createProblemFromFields(body);
        return created(res, { problem });
      }
      return methodNotAllowed(res);
    }

    if (sub.length === 2) {
      const id = sub[1];
      if (req.method === "GET") {
        const problem = db.getProblem(id);
        if (!problem) return notFound(res, `Problem ${id} not found.`);
        return ok(res, { problem });
      }
      if (req.method === "PATCH") {
        const problem = db.getProblem(id);
        if (!problem) return notFound(res, `Problem ${id} not found.`);
        const allowed = ["title", "location", "category", "severity", "status", "summary", "rootCauses", "scores", "implementation", "affectedBusinessIds", "regulationIds", "policyIds", "solutionIds", "businessesAffected", "populationImpact"];
        const patch = {};
        for (const key of allowed) {
          if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) patch[key] = req.body[key];
        }
        return ok(res, { problem: db.updateProblem(id, patch, user.name) });
      }
      if (req.method === "DELETE") {
        const problem = db.getProblem(id);
        if (!problem) return notFound(res, `Problem ${id} not found.`);
        db.state.problems = db.state.problems.filter((p) => p.id !== id);
        db.persist();
        db.audit(`Problem deleted: ${id}`, { actor: user.name, target: id });
        return ok(res, { deleted: true });
      }
      return methodNotAllowed(res);
    }

    if (sub.length === 3) {
      const id = sub[1];
      const relation = sub[2];
      const problem = db.getProblem(id);
      if (!problem) return notFound(res, `Problem ${id} not found.`);
      if (req.method !== "GET") return methodNotAllowed(res);
      if (relation === "businesses") return ok(res, { businesses: businessForIds(problem.affectedBusinessIds) });
      if (relation === "regulations")
        return ok(res, { regulations: (problem.regulationIds || []).map((rid) => db.state.regulations.find((r) => r.id === rid)).filter(Boolean) });
      if (relation === "policies")
        return ok(res, { policies: (problem.policyIds || []).map((rid) => db.state.policies.find((r) => r.id === rid)).filter(Boolean) });
      if (relation === "solutions")
        return ok(res, { solutions: (problem.solutionIds || []).map((rid) => db.state.solutions.find((r) => r.id === rid)).filter(Boolean) });
      if (relation === "evidence") return ok(res, { evidence: db.state.evidence.filter((e) => e.problemId === id) });
      if (relation === "audits") return ok(res, { audits: db.state.auditLogs.filter((a) => a.target === id) });
      return notFound(res, `Unknown relation: ${relation}`);
    }
    return notFound(res, `Unknown problems endpoint.`);
  }

  if (head === "businesses") {
    if (sub.length === 1) {
      if (req.method !== "GET") return methodNotAllowed(res);
      const f = filtersFromQuery(req.query);
      let list = db.state.businesses;
      if (f.q) list = list.filter((b) => `${b.name} ${b.industry} ${b.location}`.toLowerCase().includes(f.q));
      if (req.query.status) list = list.filter((b) => b.status === req.query.status);
      if (req.query.impact) list = list.filter((b) => b.impact === req.query.impact);
      if (req.query.risk) list = list.filter((b) => b.risk === req.query.risk);
      return ok(res, { businesses: list });
    }
    if (sub.length === 2) {
      if (req.method !== "GET") return methodNotAllowed(res);
      const business = db.getBusiness(sub[1]);
      if (!business) return notFound(res, `Business ${sub[1]} not found.`);
      const problems = business ? db.state.problems.filter((p) => (p.affectedBusinessIds || []).includes(business.id)) : [];
      return ok(res, { business, problems });
    }
    return notFound(res, `Unknown businesses endpoint.`);
  }

  if (head === "regulations") {
    if (req.method !== "GET") return methodNotAllowed(res);
    if (sub.length === 2) {
      const reg = db.state.regulations.find((r) => r.id === sub[1]);
      if (!reg) return notFound(res, `Regulation ${sub[1]} not found.`);
      return ok(res, { regulation: reg });
    }
    return ok(res, { regulations: db.state.regulations });
  }

  if (head === "policies") {
    if (req.method !== "GET") return methodNotAllowed(res);
    if (sub.length === 2) {
      const policy = db.state.policies.find((p) => p.id === sub[1]);
      if (!policy) return notFound(res, `Policy ${sub[1]} not found.`);
      return ok(res, { policy });
    }
    return ok(res, { policies: db.state.policies });
  }

  if (head === "solutions") {
    if (req.method !== "GET") return methodNotAllowed(res);
    if (sub.length === 2) {
      const solution = db.state.solutions.find((s) => s.id === sub[1]);
      if (!solution) return notFound(res, `Solution ${sub[1]} not found.`);
      return ok(res, { solution });
    }
    return ok(res, { solutions: db.state.solutions });
  }

  if (head === "evidence") {
    if (sub.length === 1) {
      if (req.method === "GET") {
        let list = db.state.evidence;
        if (req.query.problemId) list = list.filter((e) => e.problemId === req.query.problemId);
        if (req.query.status) list = list.filter((e) => e.status === req.query.status);
        return ok(res, { evidence: list });
      }
      if (req.method === "POST") {
        const body = req.body || {};
        if (isEmpty(body.title)) return badRequest(res, "Evidence title is required.");
        return created(res, { evidence: db.addEvidence(body) });
      }
      return methodNotAllowed(res);
    }
    if (sub.length === 2) {
      const id = sub[1];
      if (req.method === "PATCH") return ok(res, { evidence: db.updateEvidence(id, req.body || {}) });
      if (req.method === "DELETE") {
        const exists = db.state.evidence.some((e) => e.id === id);
        if (!exists) return notFound(res, `Evidence ${id} not found.`);
        db.state.evidence = db.state.evidence.filter((e) => e.id !== id);
        db.persist();
        return ok(res, { deleted: true });
      }
      return methodNotAllowed(res);
    }
    return notFound(res, `Unknown evidence endpoint.`);
  }

  if (head === "reports") {
    if (sub.length === 1) {
      if (req.method === "GET") return ok(res, { reports: db.state.reports });
      if (req.method === "POST") {
        const body = req.body || {};
        if (isEmpty(body.title)) return badRequest(res, "Report title is required.");
        return created(res, { report: db.addReport(body) });
      }
      return methodNotAllowed(res);
    }
    if (sub.length === 2) {
      const id = sub[1];
      if (req.method === "GET") {
        const report = db.state.reports.find((r) => r.id === id);
        if (!report) return notFound(res, `Report ${id} not found.`);
        return ok(res, { report });
      }
      if (req.method === "PATCH") {
        const report = db.state.reports.find((r) => r.id === id);
        if (!report) return notFound(res, `Report ${id} not found.`);
        return ok(res, { report: db.updateReport(id, req.body || {}) });
      }
      return methodNotAllowed(res);
    }
    return notFound(res, `Unknown reports endpoint.`);
  }

  if (head === "notifications") {
    if (sub.length === 1) {
      if (req.method === "GET") return ok(res, { notifications: db.state.notifications });
      if (req.method === "POST") {
        const body = req.body || {};
        if (isEmpty(body.title)) return badRequest(res, "Notification title is required.");
        return created(res, { notification: db.addGovNotification(body.title, body.body || "", body.type) });
      }
      return methodNotAllowed(res);
    }
    if (sub.length === 2 && sub[1] === "read-all") {
      if (req.method !== "POST") return methodNotAllowed(res);
      db.state.notifications.forEach((n) => {
        n.unread = false;
      });
      db.persist();
      return ok(res, { done: true });
    }
    if (sub.length === 2) {
      if (req.method !== "PATCH") return methodNotAllowed(res);
      const item = db.state.notifications.find((n) => n.id === sub[1]);
      if (!item) return notFound(res, `Notification ${sub[1]} not found.`);
      Object.assign(item, req.body || {});
      db.persist();
      return ok(res, { notification: item });
    }
    return notFound(res, `Unknown notifications endpoint.`);
  }

  if (head === "audit-logs") {
    if (req.method !== "GET") return methodNotAllowed(res);
    let list = db.state.auditLogs;
    if (req.query.problemId) list = list.filter((a) => a.target === req.query.problemId);
    if (req.query.limit) list = list.slice(0, Number(req.query.limit));
    return ok(res, { logs: list });
  }

  if (head === "copilot") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const message = String((req.body || {}).message || "").trim();
    if (!message) return badRequest(res, "A message is required.");
    const active = (req.body || {}).problem || null;
    const reply = await govCopilot(message, active);
    return ok(res, { reply });
  }

  if (head === "document-review") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const body = req.body || {};
    const active = body.problem || null;
    let text = String(body.document || "").trim();
    let label = "";
    if (!text && body.file && typeof body.file === "object") {
      try {
        const source = await documentToText(body.file);
        text = source.text;
        label = source.label;
      } catch (err) {
        return badRequest(res, err.message || "The uploaded file could not be read.");
      }
    }
    if (!text) return badRequest(res, "Paste a document or upload a file to review.");
    const reply = await govDocumentSummary(text, active, label);
    return ok(res, { reply });
  }

  return notFound(res, `Unknown government endpoint: ${head}`);
}

async function intelligenceNarrative(title, businesses) {
  const summary = businesses
    .slice(0, 5)
    .map((b) => `- ${b.name} (${b.technology}, priority ${b.priorityScore}/100)`)
    .join("\n");
  return groqWithFallback(
    `Problem: "${title}"\n\nMatching businesses:\n${summary || "- none listed yet"}\n\nWrite a concise executive summary (3 short paragraphs max).`,
    {
      system:
        "You are a regulatory analyst for REGULENS, an Indian regulatory intelligence platform. Provide a factual, concise executive summary of a newly reported government problem, grounded in the workspace data given.",
      maxTokens: 700,
      fallback: () =>
        `This is a preliminary intelligence summary for "${title}". ${
          businesses.length ? `${businesses.length} matching businesses have been identified.` : "No matching businesses have been identified yet."
        } Priority scoring and ground verification will refine these findings.`,
    }
  );
}

async function documentToText(file) {
  const name = String(file.name || "document");
  const base64 = String(file.base64 || "");
  if (!base64) throw new Error("File contents are missing.");
  if (base64.length > 18_000_000) throw new Error("File is too large. Maximum upload size is 12 MB.");
  const buffer = Buffer.from(base64, "base64");
  const text = await extractDocumentText(name, buffer);
  return { text, label: name };
}

async function govDocumentSummary(document, active, label = "") {
  const doc = document.length > 12000 ? `${document.slice(0, 12000)}\n\n[... document truncated for review ...]` : document;
  const context = [
    label ? `Document under review: ${label}` : null,
    active ? `Active problem context: ${active.id} — ${active.title}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return groqWithFallback(`${context}\n\nDocument to review:\n"""${doc}"""`, {
    system:
      "You are a regulatory analyst for REGULENS, an Indian regulatory intelligence platform. Review the document text provided and explain it in very simple, plain language so a non-expert can understand it fully. Reply with exactly these bullet sections: What this document is; The main points; What you must do (obligations / action items); Red flags or risks to watch for. Keep each section short and use everyday words. Do not invent facts that are not in the document; if the text lacks enough information, say so clearly.",
    maxTokens: 1200,
    fallback: () =>
      `Here is a simple summary of the document:\n\n- What it is likely about: ${doc.split(/\s+/).slice(0, 40).join(" ") || "the pasted text could not be read."}\n\n- This is a quick preview. Paste the full document text so the assistant can give you the complete points, action items and red flags.`,
  });
}

async function govCopilot(message, active) {
  const priority = (scores = {}) => {
    const total =
      (scores.severity || 0) * 20 +
      (scores.businesses || 0) * 15 +
      (scores.population || 0) * 15 +
      (scores.economic || 0) * 15 +
      (scores.regulatoryRisk || 0) * 15 +
      (scores.urgency || 0) * 10 +
      (scores.geographic || 0) * 10;
    return Math.round(total / 70);
  };
  const workspace = {
    problems: db.state.problems.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      location: p.location,
      category: p.category,
      severity: p.severity,
      priorityScore: p.scores ? priority(p.scores) : null,
      businessesAffected: p.businessesAffected,
    })),
    businesses: db.state.businesses.map((b) => ({
      id: b.id,
      name: b.name,
      industry: b.industry,
      location: b.location,
      size: b.size,
      risk: b.risk,
      impact: b.impact,
      status: b.status,
    })),
    regulations: db.state.regulations.map((r) => ({ id: r.id, title: r.title, status: r.status })),
    policies: db.state.policies.map((p) => ({ id: p.id, currentPolicy: p.currentPolicy, status: p.status })),
    solutions: db.state.solutions.map((s) => ({ id: s.id, name: s.name, technology: s.technology })),
    evidence: db.state.evidence.map((e) => ({ id: e.id, problemId: e.problemId, type: e.type, status: e.status })),
    reports: db.state.reports.map((r) => ({ id: r.id, title: r.title, status: r.status })),
    activeProblem: active
      ? {
          id: active.id || "",
          title: active.title || "",
          status: active.status || "",
          priorityScore: active.priorityScore,
          priorityLevel: active.priorityLevel,
          solutions: (active.solutions || []).map((s) => s.name),
        }
      : null,
  };
  return groqWithFallback(`${JSON.stringify(workspace, null, 2)}\n\nQuestion: ${message}`, {
    system:
      "You are the REGULENS Government Copilot — an AI assistant for Indian regulators using the REGULENS regulatory intelligence workspace. Answer questions about regulatory problems, affected businesses, regulations, policies, solutions, evidence and reports using ONLY the workspace context provided. Give SHORT, SIMPLE, CLEAN answers: 1-3 plain-text sentences maximum, no markdown, no bold, no stars, no tables, no bullet lists. Lead with the direct answer in one line. If you lack data, say so in one short sentence.",
    maxTokens: 250,
    fallback: () => govFallbackReply(message, active),
  });
}

function govFallbackReply(message, active) {
  const text = message.toLowerCase();
  if (/priority|critical|score|p1/i.test(text)) {
    return `Priority analysis scores problems on the methodology (Severity 20, Businesses 15, Population 15, Economic 15, Regulatory Risk 15, Urgency 10, Geographic 10). ${active ? `Current context ${active.id} is prioritised ${active.priorityLevel} (${active.priorityScore}/10).` : ""} Values are as recorded in the workspace.`;
  }
  if (/business|affect|sme/i.test(text)) {
    return `Business matching uses sector, technology and priority-score signals. ${active ? `${(active.businesses || []).length} solution providers are matched to ${active.id}.` : "No active problem context loaded."} Recommendations reflect the recorded scores.`;
  }
  if (/evidence|ground|verify/i.test(text)) {
    return `Ground intelligence links evidence to problems for verification. Use the Ground Intelligence module to review photos, documents and inspections linked to the active problem.`;
  }
  if (/policy|regulation|act|law/i.test(text)) {
    return `Related instruments are attached to each problem. Review the Regulations and Policies modules for the active problem context.`;
  }
  if (/^(hi|hello|hey|yo|hiya|howdy|good (morning|afternoon|evening)|greetings)\b/i.test(text) && text.length < 80) {
    return `Hello! I'm the REGULENS Government Copilot. I can help you analyse problems by priority, find affected businesses, and review regulations, policies, evidence and reports in the workspace. What would you like to look into?`;
  }
  if (/thanks|thank you|thx/i.test(text)) {
    return "You're welcome! Ask me about problems, businesses, policies or evidence anytime.";
  }
  return `Here is a response to "${message}" based on the workspace data. I can detail problem priority, business matching, regulatory context and ground evidence if you narrow the question.`;
}