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

const IMPACT_SCORE = { High: 90, Medium: 75, Low: 60 };
const FEASIBILITY_SCORE = { High: 88, Medium: 70, Low: 55 };
const COMPATIBILITY_SCORE = { High: 85, Medium: 70, Low: 55 };
const SEVERITY_SCORE = { Critical: 82, High: 72, Medium: 62, Low: 50 };

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function round(n) {
  return Math.round(n);
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function verdictForScore(score) {
  if (score >= 80) return "Ready to Scale";
  if (score >= 65) return "Conditional";
  return "Not Ready";
}

export async function runTestAndScale({ problem, solution, pilotArea }) {
  const { system, user, fallback } = buildTestAndScale({ problem, solution, pilotArea });
  if (!groqAvailable()) return fallback;
  try {
    const reply = await groqChat({ system, user, maxTokens: 900, temperature: 0.4 });
    const parsed = tryJson(reply);
    if (!parsed || typeof parsed !== "object") return fallback;
    return normalizeAnalysis(parsed, fallback);
  } catch (err) {
    console.warn("[ai] test-and-scale unavailable, using fallback:", err.message);
    return fallback;
  }
}

function buildTestAndScale({ problem, solution, pilotArea }) {
  const seed = hash(`${problem.id}${solution.id}${pilotArea}`);
  const severityByArea = (problem.geographic && problem.geographic.severityByArea) || {};
  const areaSeverity = severityByArea[pilotArea] || problem.severity || "Medium";
  const impactScore = IMPACT_SCORE[solution.impact] || 75;
  const feasibilityScore = FEASIBILITY_SCORE[solution.feasibility] || 70;
  const compatibilityScore = COMPATIBILITY_SCORE[solution.compatibility] || 70;
  const severityScore = SEVERITY_SCORE[areaSeverity] || 60;

  const pilotScore = round(
    clamp(0.28 * impactScore + 0.27 * feasibilityScore + 0.2 * compatibilityScore + 0.25 * severityScore + ((seed % 7) - 3), 45, 95)
  );
  const confidence = round(clamp(60 + (seed % 22), 55, 92));
  const verdict = verdictForScore(pilotScore);
  const areas = (problem.geographic && problem.geographic.areas) || [];

  const phases = [
    {
      name: "Pilot Setup",
      duration: "Week 1–2",
      cost: solution.cost,
      description: `Scope the ${solution.title} for ${pilotArea}, secure the ${solution.owner} and agree measurement baselines with affected businesses.`,
    },
    {
      name: "Field Test",
      duration: "Week 3–6",
      cost: solution.cost,
      description: `Run the solution within ${pilotArea} with a bounded test cohort, collecting evidence against the success indicators.`,
    },
    {
      name: "Evaluation & Scale Decision",
      duration: "Week 7–8",
      cost: "Low",
      description: `Compare results to the success threshold, review risks, and make a verdict: ${verdict}.`,
    },
  ];

  const successIndicators = [
    `Demonstrated ${solution.impact} impact for affected businesses and consumers in ${pilotArea}.`,
    `Delivered within the estimated ${solution.cost} budget and ${solution.time} solution timeline.`,
    `Feasibility confirmed at ${solution.feasibility} level across ${solution.owner}.`,
    `Verifiable reduction in ${areaSeverity} severity for the problem in ${pilotArea}.`,
  ];

  const risks = [
    {
      risk: `Feasibility rated ${solution.feasibility}: deployment challenges could slow the pilot in ${pilotArea}.`,
      likelihood: solution.feasibility === "High" ? "Low" : solution.feasibility === "Medium" ? "Medium" : "High",
      mitigation: `Stand up a focused working team with ${solution.owner} and agree escalation paths before Week 3.`,
    },
    {
      risk: `Area severity is ${areaSeverity}, which increases the complexity of safe measurement.`,
      likelihood: areaSeverity === "Critical" || areaSeverity === "High" ? "Medium" : "Low",
      mitigation: `Cap the pilot cohort and run a controlled rollout inside ${pilotArea} before broadening.`,
    },
    {
      risk: "Baseline data availability may be uneven across the pilot area.",
      likelihood: "Medium",
      mitigation: "Define the success threshold and data collection points during Pilot Setup.",
    },
  ];

  const rolloutGuidance =
    verdict === "Ready to Scale"
      ? `Proceed with national rollout staged across ${areas.length || "priority"} areas, starting with the highest-severity locations in parallel with ${pilotArea}.`
      : verdict === "Conditional"
        ? `Do not roll out nationally yet. Address the feasibility and data gaps above, then run a second pilot across 2–3 areas before deciding.`
        : `Hold national rollout. Resolve the barriers surfaced in ${pilotArea} first; consider whether ${solution.title} is the right solution for this problem.`;

  const predictedImpact = `Implementing ${solution.title} in ${pilotArea} is expected to deliver ${solution.impact} impact at ${solution.feasibility} feasibility for a ${solution.cost} budget within the ${solution.time} window, where area severity is currently ${areaSeverity}.`;

  const fallback = {
    predictedImpact,
    successIndicators,
    phases,
    risks,
    pilotScore,
    scaleVerdict: verdict,
    rolloutGuidance,
    confidence,
  };

  const context = {
    problem: {
      id: problem.id,
      title: problem.title,
      location: problem.location,
      category: problem.category,
      severity: problem.severity,
      status: problem.status,
      businessesAffected: problem.businessesAffected,
      populationImpact: problem.populationImpact,
      summary: problem.summary,
      implementation: problem.implementation,
      geographic: problem.geographic,
    },
    solution: {
      id: solution.id,
      title: solution.title,
      cost: solution.cost,
      time: solution.time,
      impact: solution.impact,
      feasibility: solution.feasibility,
      compatibility: solution.compatibility,
      status: solution.status,
      owner: solution.owner,
    },
    pilotArea,
  };

  return {
    system:
      'You are a regulatory pilot analyst for REGULENS, a Nigerian regulatory intelligence platform. A government agency wants to test a solution for a problem in one small area and predict whether it can later be scaled nationally. Return ONLY valid JSON with keys: predictedImpact (string), successIndicators (array of strings), phases (array of {name, duration, cost, description}), risks (array of {risk, likelihood, mitigation}), pilotScore (integer 0-100), scaleVerdict (string, one of "Not Ready", "Conditional", "Ready to Scale"), rolloutGuidance (string), confidence (integer 0-100). Ground every statement in the problem and solution data provided. No markdown.',
    user: JSON.stringify(context, null, 2),
    fallback,
  };
}

function normalizeAnalysis(parsed, fallback) {
  const out = { ...fallback, ...parsed };
  if (!Array.isArray(out.successIndicators)) out.successIndicators = fallback.successIndicators;
  if (!Array.isArray(out.phases) || out.phases.length < 2) out.phases = fallback.phases;
  if (!Array.isArray(out.risks)) out.risks = fallback.risks;
  if (typeof out.pilotScore !== "number") out.pilotScore = fallback.pilotScore;
  out.pilotScore = Math.round(clamp(Number(out.pilotScore) || fallback.pilotScore, 0, 100));
  if (typeof out.confidence !== "number") out.confidence = fallback.confidence;
  out.confidence = Math.round(clamp(Number(out.confidence) || fallback.confidence, 0, 100));
  if (!out.scaleVerdict) out.scaleVerdict = verdictForScore(out.pilotScore);
  if (!["Not Ready", "Conditional", "Ready to Scale"].includes(out.scaleVerdict)) {
    out.scaleVerdict = verdictForScore(out.pilotScore);
  }
  for (const key of ["predictedImpact", "rolloutGuidance"]) {
    if (typeof out[key] !== "string" || !out[key].trim()) out[key] = fallback[key];
  }
  return out;
}