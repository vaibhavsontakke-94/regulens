import { db } from "../store.js";
import { ok, created, badRequest, notFound, methodNotAllowed } from "../http.js";
import { isEmpty, isEmail } from "../../lib/validators.js";
import { groqWithFallback } from "../groq.js";
import { runAiModule, runEvidenceAnalysis } from "../businessAi.js";

export default async function businessRoutes(req, res, sub, user) {
  const [head = ""] = sub;

  if (head === "" || head === "dashboard") {
    if (req.method !== "GET") return methodNotAllowed(res);
    const data = db.businessDataFor(user.id);
    const health = data.healthScores;
    const compliance = data.compliance;
    const actionCount = compliance.filter((c) => c.status === "Action Required" || c.status === "Expired").length;
    const dueSoon = compliance.filter((c) => c.status !== "Compliant").length;
    return ok(res, {
      profile: data.profile,
      displayName: data.profile?.identity?.businessName || data.staticProfile?.name || "Your Business",
      health,
      healthAreas: [
        { key: "compliance", label: "Compliance Health", score: health.compliance },
        { key: "risk", label: "Risk Readiness", score: health.risk },
        { key: "operations", label: "Operational Health", score: health.operations },
        { key: "financial", label: "Financial Exposure", score: health.financialExposure },
        { key: "growth", label: "Growth Readiness", score: health.growthReadiness },
      ],
      overview: {
        totalProblems: data.problems.length,
        activeProblems: data.problems.filter((p) => !["VERIFIED", "RESOLVED"].includes(p.status)).length,
        openCompliance: actionCount,
        dueSoon,
        unreadNotifications: data.notifications.filter((n) => n.unread).length,
      },
      alerts: [
        ...compliance.filter((c) => c.status === "Action Required").map((c) => ({ level: "action", title: c.requirement, detail: `${c.authority} · due ${c.dueDate}` })),
        ...compliance.filter((c) => c.status === "Expired").map((c) => ({ level: "expired", title: c.requirement, detail: `${c.authority} · expired ${c.dueDate}` })),
        ...data.regulatoryUpdates.filter((u) => u.status === "Enacted").slice(0, 2).map((u) => ({ level: "regulatory", title: u.regulation, detail: `Effective ${u.effectiveDate}` })),
      ],
      notifications: data.notifications,
    });
  }

  if (head === "workspace") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, db.businessDataFor(user.id));
  }

  if (head === "profile") {
    if (req.method === "GET") return ok(res, { profile: db.businessWorkspace(user.id).profile ? JSON.parse(JSON.stringify(db.businessWorkspace(user.id).profile)) : null });
    if (req.method === "POST" || req.method === "PATCH") {
      const body = req.body || {};
      const existing = db.businessWorkspace(user.id).profile || {};
      const next = { ...existing, ...body };
      if (body.identity) next.identity = { ...existing.identity, ...body.identity };
      if (body.location) next.location = { ...existing.location, ...body.location };
      if (body.operations) next.operations = { ...existing.operations, ...body.operations };
      if (body.scale) next.scale = { ...existing.scale, ...body.scale };
      if (body.compliance) next.compliance = { ...existing.compliance, ...body.compliance };
      if (body.environmental) next.environmental = { ...existing.environmental, ...body.environmental };
      if (body.growth) next.growth = { ...existing.growth, ...body.growth };
      db.businessWorkspace(user.id).profile = next;
      db.persist();
      if (next.identity?.businessName) {
        db.addBusinessNotification(user.id, "Business profile updated", `Your profile for ${next.identity.businessName} was saved.`, "profile");
      }
      return ok(res, { profile: JSON.parse(JSON.stringify(next)) });
    }
    return methodNotAllowed(res);
  }

  if (head === "source") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { profile: db.businessDataFor(user.id).staticProfile });
  }

  if (head === "health") {
    if (req.method !== "GET") return methodNotAllowed(res);
    const data = db.businessDataFor(user.id);
    return ok(res, { health: data.healthScores, areas: [
      { key: "compliance", label: "Compliance Health", score: data.healthScores.compliance },
      { key: "risk", label: "Risk Readiness", score: data.healthScores.risk },
      { key: "operations", label: "Operational Health", score: data.healthScores.operations },
      { key: "financial", label: "Financial Exposure", score: data.healthScores.financialExposure },
      { key: "growth", label: "Growth Readiness", score: data.healthScores.growthReadiness },
    ] });
  }

  if (head === "compliance") {
    if (sub.length === 2) {
      if (req.method !== "PATCH") return methodNotAllowed(res);
      const current = db.businessDataFor(user.id).compliance.find((c) => c.id === sub[1]);
      if (!current) return notFound(res, `Compliance item ${sub[1]} not found.`);
      const status = String((req.body || {}).status || "").trim();
      if (!status) return badRequest(res, "A status value is required.");
      db.businessWorkspace(user.id).complianceStatus[sub[1]] = status;
      db.persist();
      const updated = db.businessDataFor(user.id).compliance.find((c) => c.id === sub[1]);
      return ok(res, { requirement: updated });
    }
    if (req.method !== "GET") return methodNotAllowed(res);
    const data = db.businessDataFor(user.id);
    const isExpiringSoon = (date) => {
      if (!date) return false;
      const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 60;
    };
    const items = data.compliance.map((c) => ({ ...c, expiringSoon: isExpiringSoon(c.dueDate) }));
    return ok(res, {
      requirements: items,
      summary: {
        total: items.length,
        compliant: items.filter((c) => c.status === "Compliant").length,
        actionRequired: items.filter((c) => c.status === "Action Required").length,
        expired: items.filter((c) => c.status === "Expired").length,
        underReview: items.filter((c) => c.status === "Under Review").length,
        expiringSoon: items.filter((c) => c.expiringSoon).length,
      },
    });
  }

  if (head === "risks") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { riskAnalysis: db.businessDataFor(user.id).riskAnalysis });
  }

  if (head === "regulatory-risk") {
    if (req.method !== "GET") return methodNotAllowed(res);
    const data = db.businessDataFor(user.id);
    return ok(res, {
      categories: data.riskCategories,
      topCategories: ["Regulatory", "Financial", "Operational", "Expansion", "Market"],
    });
  }

  if (head === "financial-impact") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { financial: db.businessDataFor(user.id).financialImpact });
  }

  if (head === "expansion") {
    if (req.method !== "GET") return methodNotAllowed(res);
    const data = db.businessDataFor(user.id);
    return ok(res, { analysis: data.expansionAnalysis, factors: data.expansionFactors });
  }

  if (head === "expansion-readiness") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { readiness: db.businessDataFor(user.id).expansionReadiness });
  }

  if (head === "growth") {
    if (req.method !== "GET") return methodNotAllowed(res);
    const data = db.businessDataFor(user.id);
    return ok(res, {
      readiness: data.expansionReadiness,
      growthReadiness: data.healthScores.growthReadiness,
      factors: data.expansionFactors,
      targetMarket: "Abuja Special Economic Zone",
      regions: { current: data.expansionAnalysis.currentRegion, target: data.expansionAnalysis.targetRegion },
    });
  }

  if (head === "certifications") {
    if (sub.length === 2) {
      if (req.method !== "PATCH") return methodNotAllowed(res);
      const current = db.businessDataFor(user.id).certifications.find((c) => c.id === sub[1]);
      if (!current) return notFound(res, `Certification ${sub[1]} not found.`);
      const status = String((req.body || {}).status || "").trim();
      if (!status) return badRequest(res, "A status value is required.");
      db.businessWorkspace(user.id).certificationStatus[sub[1]] = status;
      db.persist();
      const updated = db.businessDataFor(user.id).certifications.find((c) => c.id === sub[1]);
      return ok(res, { certification: updated });
    }
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { certifications: db.businessDataFor(user.id).certifications });
  }

  if (head === "certification-intelligence") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { certificationIntel: db.businessDataFor(user.id).certificationIntel });
  }

  if (head === "regulatory-updates") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { updates: db.businessDataFor(user.id).regulatoryUpdates });
  }

  if (head === "schemes") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { schemes: db.businessDataFor(user.id).schemes });
  }

  if (head === "problems") {
    if (sub.length === 1) {
      if (req.method === "GET") return ok(res, { problems: db.businessDataFor(user.id).problems, lifecycle: db.businessDataFor(user.id).problemLifecycle });
      if (req.method === "POST") {
        const body = req.body || {};
        if (isEmpty(body.title)) return badRequest(res, "Problem title is required.");
        if (body.reporterEmail && !isEmail(body.reporterEmail)) return badRequest(res, "Enter a valid email.");
        const problem = db.addBusinessProblem(user.id, body);
        db.addBusinessNotification(user.id, "Problem reported", `${problem.title} was added to My Problems.`, "problem");
        return created(res, { problem });
      }
      return methodNotAllowed(res);
    }
    if (sub.length === 2) {
      if (req.method !== "PATCH") return methodNotAllowed(res);
      const updated = db.updateBusinessProblem(user.id, sub[1], req.body || {});
      if (!updated) return notFound(res, `Problem ${sub[1]} not found.`);
      return ok(res, { problem: updated });
    }
    return notFound(res, `Unknown problems endpoint.`);
  }

  if (head === "evidence") {
    if (sub.length === 1) {
      if (req.method === "GET") {
        let list = db.businessDataFor(user.id).evidence;
        if (req.query.problemId) list = list.filter((e) => e.problemId === req.query.problemId);
        return ok(res, { evidence: list });
      }
      if (req.method === "POST") {
        const body = req.body || {};
        if (isEmpty(body.title)) return badRequest(res, "Evidence title is required.");
        const evidence = db.addBusinessEvidence(user.id, {
          title: body.title,
          type: body.type,
          problemId: body.problemId,
          size: body.size,
        });
        const data = db.businessDataFor(user.id);
        const analysis = await runEvidenceAnalysis(evidence, data);
        const persisted = db.updateBusinessEvidence(user.id,evidence.id, {
          status: analysis?.status === "needs-review" ? "needs-review" : "complete",
          progress: 100,
          analysis,
        });
        return created(res, { evidence: persisted, analysis });
      }
      return methodNotAllowed(res);
    }
    if (sub.length === 2) {
      if (req.method === "PATCH") {
        const existing = db.businessWorkspace(user.id).evidence.find((e) => e.id === sub[1]);
        if (!existing) return notFound(res, `Evidence ${sub[1]} not found.`);
        const updated = db.updateBusinessEvidence(user.id,sub[1], req.body || {});
        return ok(res, { evidence: updated });
      }
      if (req.method === "DELETE") {
        const index = db.businessWorkspace(user.id).evidence.findIndex((e) => e.id === sub[1]);
        if (index === -1) return notFound(res, `Evidence ${sub[1]} not found.`);
        db.businessWorkspace(user.id).evidence.splice(index, 1);
        db.persist();
        db.audit(`Evidence removed: ${sub[1]}`, { target: sub[1] });
        return ok(res, { done: true });
      }
      return methodNotAllowed(res);
    }
    if (sub.length === 3 && sub[2] === "analyze") {
      if (req.method !== "POST") return methodNotAllowed(res);
      const found = db.businessWorkspace(user.id).evidence.find((e) => e.id === sub[1]);
      if (!found) return notFound(res, `Evidence ${sub[1]} not found.`);
      const data = db.businessDataFor(user.id);
      const analysis = await runEvidenceAnalysis(found, data);
      const persisted = db.updateBusinessEvidence(user.id,found.id, {
        status: analysis?.status === "needs-review" ? "needs-review" : "complete",
        progress: 100,
        analysis,
      });
      return ok(res, { evidence: persisted, analysis });
    }
    return notFound(res, `Unknown evidence endpoint.`);
  }

  if (head === "reports") {
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { reports: db.businessDataFor(user.id).reports });
  }

  if (head === "notifications") {
    if (sub.length === 2 && sub[1] === "read-all") {
      if (req.method !== "POST") return methodNotAllowed(res);
      db.businessDataFor(user.id).notifications.forEach((n) => {
        db.businessWorkspace(user.id).notificationsRead[n.id] = true;
      });
      db.persist();
      return ok(res, { done: true });
    }
    if (sub.length === 2) {
      if (req.method !== "PATCH") return methodNotAllowed(res);
      const item = db.businessDataFor(user.id).notifications.find((n) => n.id === sub[1]);
      if (!item) return notFound(res, `Notification ${sub[1]} not found.`);
      const patch = req.body || {};
      if (patch.unread === false || patch.read === true) db.businessWorkspace(user.id).notificationsRead[sub[1]] = true;
      db.persist();
      return ok(res, { notification: { ...item, unread: false } });
    }
    if (req.method !== "GET") return methodNotAllowed(res);
    return ok(res, { notifications: db.businessDataFor(user.id).notifications });
  }

  if (head === "ai") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const module = String((req.body || {}).module || "");
    const data = db.businessDataFor(user.id);
    const analysis = await runAiModule(module, data);
    if (!analysis) return badRequest(res, `Unknown AI module: ${module}`);
    return ok(res, { module, analysis });
  }

  if (head === "copilot") {
    if (req.method !== "POST") return methodNotAllowed(res);
    const message = String((req.body || {}).message || "").trim();
    if (!message) return badRequest(res, "A message is required.");
    const data = db.businessDataFor(user.id);
    const reply = await bizCopilot(message, data);
    return ok(res, { reply });
  }

  return notFound(res, `Unknown business endpoint: ${head}`);
}

async function bizCopilot(message, data) {
  const pending = data.compliance.filter((c) => c.status !== "Compliant");
  const activeCerts = data.certifications.filter((c) => c.status === "Active").length;
  const context = {
    businessName: data.profile?.identity?.businessName || data.staticProfile.identity?.businessName || "Your Business",
    healthScores: data.healthScores,
    compliance: {
      total: data.compliance.length,
      compliant: data.compliance.filter((c) => c.status === "Compliant").length,
      actionRequired: data.compliance.filter((c) => c.status === "Action Required").length,
      expired: data.compliance.filter((c) => c.status === "Expired").length,
      dueSoon: pending.filter((c) => {
        if (!c.dueDate) return false;
        const days = (new Date(c.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
        return c.status !== "Compliant" && days > 0 && days <= 60;
      }).map((c) => ({ requirement: c.requirement, dueDate: c.dueDate, status: c.status, authority: c.authority })),
      outstanding: pending.slice(0, 6).map((c) => ({ requirement: c.requirement, dueDate: c.dueDate, status: c.status, authority: c.authority })),
    },
    risk: {
      overall: data.healthScores.risk,
      categories: data.riskCategories.map((r) => ({ category: r.category, status: r.status, severity: r.severity })),
    },
    financial: { exposure: data.healthScores.financialExposure, costs: data.financialImpact?.bars?.map((b) => ({ label: b.label, value: b.value })) || [] },
    expansion: {
      readiness: data.healthScores.growthReadiness,
      currentRegion: data.expansionAnalysis.currentRegion,
      currentScore: data.expansionAnalysis.currentScore,
      targetRegion: data.expansionAnalysis.targetRegion,
      targetScore: data.expansionAnalysis.targetScore,
    },
    certifications: { active: activeCerts, total: data.certifications.length, intelAvailable: Boolean(data.certificationIntel?.length) },
    schemesOpen: data.schemes.filter((s) => s.status === "Open").map((s) => ({ scheme: s.scheme, authority: s.authority, deadline: s.deadline })),
    updatesEnacted: data.regulatoryUpdates.filter((u) => u.status === "Enacted").length,
    myProblems: data.problems.length,
  };
  return groqWithFallback(`${JSON.stringify(context, null, 2)}\n\nQuestion: ${message}`, {
    system:
      "You are the REGULENS Business Copilot — an AI assistant for Nigerian businesses managing regulatory compliance. Answer questions about compliance deadlines, risk exposure, certifications, government schemes, regulatory updates and expansion readiness using ONLY the business context provided. Be concise, structured and specific. If you lack data, say so.",
    fallback: () => bizFallbackReply(message, data),
  });
}

function bizFallbackReply(message, data) {
  const text = message.toLowerCase();
  if (/deadline|due|compliance|expire/i.test(text)) {
    const pending = data.compliance.filter((c) => c.status !== "Compliant").slice(0, 3);
    if (pending.length === 0) return "No compliance deadlines are currently outstanding. Well done!";
    return `Upcoming obligations:\n${pending.map((c) => `• ${c.requirement} — ${c.status} (due ${c.dueDate}, ${c.authority})`).join("\n")}`;
  }
  if (/risk|exposure|regulatory risk/i.test(text)) {
    const elevated = data.riskCategories.filter((r) => r.status === "Elevated").map((r) => r.category).slice(0, 3);
    return `Regulatory risk is currently ${data.healthScores.risk}/100. Elevated areas: ${elevated.join(", ") || "none"}. Review the Risk & Exposure module for mitigation owners.`;
  }
  if (/expand|kaduna|abuja|sez|zone/i.test(text)) {
    const a = data.expansionAnalysis;
    return `${a.currentRegion} (${a.currentScore}/100) vs ${a.targetRegion} (${a.targetScore}/100). Advantages: ${a.advantages.slice(0, 2).join("; ")}. Estimated setup ~${a.estimatedCost}.`;
  }
  if (/scheme|grant|incentive|fund/i.test(text)) {
    const open = data.schemes.filter((s) => s.status === "Open").slice(0, 3);
    return `Schemes currently open: ${open.map((s) => `• ${s.scheme} (${s.authority})`).join("\n")}. Deadlines vary — see the Government Schemes module.`;
  }
  if (/certif|readiness/i.test(text)) {
    const held = data.certifications.filter((c) => c.status === "Active").length;
    const mandatory = data.certifications.filter((c) => c.mandatory && c.status !== "Active").map((c) => c.name).slice(0, 2);
    return `You hold ${held} of ${data.certifications.length} tracked certifications${mandatory.length ? `. Mandatory missing: ${mandatory.join(", ")}` : ""}.`;
  }
  if (/^(hi|hello|hey|yo|hiya|howdy|good (morning|afternoon|evening)|greetings)\b/i.test(text) && text.length < 80) {
    const pending = data.compliance.filter((c) => c.status !== "Compliant").length;
    return `Hello! I'm the REGULENS Business Copilot. Right now your compliance health is ${data.healthScores.compliance}/100 with ${pending} obligation${pending === 1 ? "" : "s"} not yet compliant, and overall risk at ${data.healthScores.risk}/100. Ask me about compliance deadlines, risk exposure, certifications, government schemes or expansion readiness.`;
  }
  if (/thanks|thank you|thx/i.test(text)) {
    return "You're welcome! Ask me anytime about your compliance, risk or expansion data.";
  }
  return `Here's what I know about that: "${message}". I can walk through your compliance, risk or expansion data in more detail if you narrow the question.`;
}