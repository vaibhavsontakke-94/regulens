import { groqAvailable, groqChat } from "./groq.js";

function tryJson(reply) {
  if (!reply) return null;
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(reply.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function runAiModule(module, data) {
  const game = MODULE_BUILDERS[module];
  if (!game) return null;
  const { system, user, fallback } = game(data);
  if (!groqAvailable()) return fallback;
  try {
    const reply = await groqChat({ system, user, maxTokens: 900, temperature: 0.4 });
    return tryJson(reply) || fallback;
  } catch (err) {
    console.warn(`[ai] ${module} unavailable, using fallback:`, err.message);
    return fallback;
  }
}

function isExpiringSoon(date) {
  if (!date || typeof date !== "string" || Number.isNaN(Date.parse(date))) return false;
  const days = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  return days > 0 && days <= 60;
}

function complianceBuilder(data) {
  const items = data.compliance.map((c) => ({ ...c, expiringSoon: isExpiringSoon(c.dueDate) }));
  const total = items.length;
  const compliant = items.filter((c) => c.status === "Compliant").length;
  const score = Math.round((compliant / total) * 100);
  const context = {
    business: data.profile?.identity?.businessName || data.staticProfile?.identity?.businessName,
    complianceScore: score,
    healthScores: data.healthScores,
    items: items.map((c) => ({
      requirement: c.requirement,
      authority: c.authority,
      jurisdiction: c.jurisdiction,
      status: c.status,
      dueDate: c.dueDate,
      risk: c.risk,
    })),
  };
  const fallback = {
    summary: `Compliance stands at ${score}% with ${compliant} of ${total} requirements fulfilled. ${
      items.filter((c) => c.status === "Action Required" || c.status === "Expired").length || 0
    } require immediate action.`,
    complianceScore: score,
    priorities: items
      .filter((c) => c.status === "Action Required" || c.status === "Expired" || c.expiringSoon)
      .slice(0, 4)
      .map((c) => ({
        requirement: c.requirement,
        authority: c.authority,
        dueDate: c.dueDate,
        reason: c.status === "Expired" ? "Expired" : c.expiringSoon ? "Expiring within 60 days" : `Status: ${c.status}`,
      })),
    recommendations: items
      .filter((c) => c.status === "Action Required" || c.status === "Expired")
      .map((c) => `Complete ${c.requirement} with ${c.authority} before the next review cycle.`)
      .slice(0, 3),
  };
  return {
    system:
      "You are a compliance analyst for REGULENS, a Nigerian regulatory intelligence platform. Return ONLY valid JSON with keys: summary (string), complianceScore (integer 0-100), priorities (array of {requirement, authority, dueDate, reason}), recommendations (array of strings). Ground every statement in the business compliance data provided. No markdown.",
    user: JSON.stringify(context, null, 2),
    fallback,
  };
}

function risksBuilder(data) {
  const risks = (data.riskAnalysis?.risks || []).map((r) => ({
    name: r.name,
    category: r.category,
    probability: r.probability,
    impact: r.impact,
    score: (r.probability || 0) * (r.impact || 0),
    action: r.action,
  }));
  const context = {
    business: data.profile?.identity?.businessName || data.staticProfile?.identity?.businessName,
    riskScore: data.healthScores.risk,
    categories: (data.riskCategories || []).map((r) => ({ category: r.category, status: r.status, severity: r.severity, summary: r.summary })),
    risks,
    mitigations: (data.riskAnalysis?.mitigations || []).map((m) => ({ risk: m.risk, action: m.action, owner: m.owner, status: m.status })),
  };
  const top = [...risks].sort((a, b) => b.score - a.score).slice(0, 4);
  const fallback = {
    summary: `Overall risk is ${data.healthScores.risk}/100. The highest-ranked exposure is ${top[0]?.name || "none"} (score ${top[0]?.score || 0}). ${data.riskCategories?.filter((r) => r.status === "Elevated").length || 0} risk categories are currently elevated.`,
    overallScore: data.healthScores.risk,
    topRisks: top.map((r) => ({ name: r.name, score: r.score, drivers: `${r.category} · P${r.probability} × I${r.impact}`, action: r.action })),
    watchList: data.riskCategories?.filter((r) => r.status === "Elevated").map((r) => r.category).slice(0, 3) || [],
    mitigations: (data.riskAnalysis?.mitigations || []).map((m) => ({ risk: m.risk, action: m.action, owner: m.owner, status: m.status })),
  };
  return {
    system:
      "You are a risk analyst for REGULENS, a Nigerian regulatory intelligence platform. Return ONLY valid JSON with keys: summary (string), overallScore (integer 0-100), topRisks (array of {name, score (integer), drivers (string), action (string)}), watchList (array of strings), mitigations (array of {risk, action, owner, status}). Ground every statement in the business risk data provided. No markdown.",
    user: JSON.stringify(context, null, 2),
    fallback,
  };
}

function regulatoryRiskBuilder(data) {
  const categories = (data.riskCategories || []).map((r) => ({
    category: r.category,
    status: r.status,
    severity: r.severity,
    probability: r.probability,
    impact: r.impact,
    summary: r.summary,
  }));
  const elevated = categories.filter((r) => r.status === "Elevated");
  const context = {
    business: data.profile?.identity?.businessName || data.staticProfile?.identity?.businessName,
    overallRisk: data.healthScores.risk,
    categories,
  };
  const fallback = {
    summary: `Regulatory risk profile reads as ${data.healthScores.risk}/100. ${elevated.length} of ${categories.length} categories are elevated and need monitoring.`,
    elevated: elevated.slice(0, 4).map((r) => r.category),
    watchList: elevated.map((r) => `${r.category}: ${r.summary}`).slice(0, 2),
    recommendations: elevated.map((r) => `Actively monitor ${r.category} risk (${r.severity}) with a named owner and review cadence.`).slice(0, 3),
  };
  return {
    system:
      "You are a regulatory risk analyst for REGULENS, a Nigerian regulatory intelligence platform. Return ONLY valid JSON with keys: summary (string), elevated (array of strings), watchList (array of strings), recommendations (array of strings). Ground every statement in the risk categories provided. No markdown.",
    user: JSON.stringify(context, null, 2),
    fallback,
  };
}

function certificationsBuilder(data) {
  const certs = (data.certifications || []).map((c) => ({
    name: c.name,
    authority: c.authority,
    status: c.status,
    mandatory: Boolean(c.mandatory),
    timeline: c.timeline,
  }));
  const active = certs.filter((c) => c.status === "Active").length;
  const readiness = Math.round((active / (certs.length || 1)) * 100);
  const gaps = certs.filter((c) => c.mandatory && c.status !== "Active");
  const context = {
    business: data.profile?.identity?.businessName || data.staticProfile?.identity?.businessName,
    readiness,
    certifications: certs,
  };
  const fallback = {
    summary: `Certification readiness is ${readiness}% with ${active} of ${certs.length} certifications active. ${gaps.length} mandatory certification${gaps.length === 1 ? "" : "s"} not yet active.`,
    readiness,
    gaps: gaps.map((c) => ({ certification: c.name, reason: `Mandatory but currently ${c.status}`, nextStep: `Start ${c.name} application with ${c.authority}.` })),
    nextSteps: gaps.map((c) => `Begin ${c.name} onboarding with ${c.authority}; allow ${c.timeline || "the stated"} lead time.`).slice(0, 3),
  };
  return {
    system:
      "You are a certification analyst for REGULENS, a Nigerian regulatory intelligence platform. Return ONLY valid JSON with keys: summary (string), readiness (integer 0-100), gaps (array of {certification, reason, nextStep}), nextSteps (array of strings). Ground every statement in the certification data provided. No markdown.",
    user: JSON.stringify(context, null, 2),
    fallback,
  };
}

function certificationIntelBuilder(data) {
  const intel = (data.certificationIntel || []).map((c) => ({
    certification: c.certification,
    sector: c.sector,
    authority: c.authority,
    demand: c.demand,
    value: c.value,
    status: c.status,
  }));
  const context = {
    business: data.profile?.identity?.businessName || data.staticProfile?.identity?.businessName,
    targetMarket: "Expansion toward Abuja Special Economic Zone",
    certifications: intel,
  };
  const fallback = {
    summary: `${intel.length} certifications tracked in the landscape. Regulatory-demand items like ${intel.filter((c) => c.mandatory).map((c) => c.certification).join(" and ") || "mandatory certificates"} are the most important to secure first.`,
    opportunities: intel
      .filter((c) => c.status !== "Held")
      .slice(0, 4)
      .map((c) => ({ certification: c.certification, sector: c.sector, demand: c.demand, value: c.value, recommendation: c.mandatory ? "Prioritize before expansion." : "Pursue when expansion plans are confirmed." })),
    watchList: intel.filter((c) => c.demand === "Rising").map((c) => `${c.certification}: demand is rising and not yet held.`).slice(0, 2),
    recommendations: ["Align certification roadmap with Abuja SEZ requirements.", "Secure regulatory (mandatory) certifications before optional ones.", "Re-validate certification value against target-market demand."],
  };
  return {
    system:
      "You are a certification intelligence analyst for REGULENS, a Nigerian regulatory intelligence platform. Return ONLY valid JSON with keys: summary (string), opportunities (array of {certification, sector, demand, value, recommendation}), watchList (array of strings), recommendations (array of strings). Ground every statement in the certification intelligence provided. No markdown.",
    user: JSON.stringify(context, null, 2),
    fallback,
  };
}

const MODULE_BUILDERS = {
  compliance: complianceBuilder,
  risks: risksBuilder,
  "regulatory-risk": regulatoryRiskBuilder,
  certifications: certificationsBuilder,
  "certification-intelligence": certificationIntelBuilder,
};