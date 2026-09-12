import { groqAvailable, groqChat } from "./groq.js";

const SCORE_BANDS = [
  { min: 80, label: "High", variant: "amber" },
  { min: 65, label: "Medium", variant: "blue" },
  { min: 0, label: "Low", variant: "neutral" },
];

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function bandForScore(score) {
  return SCORE_BANDS.find((b) => score >= b.min);
}

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

function industryTech(industry) {
  const map = {
    "Food Manufacturing": "Production automation & quality control systems",
    "Pharmaceuticals": "Supply-chain & regulatory compliance software",
    Fintech: "Compliance, data analytics & secure payments infrastructure",
    Energy: "Metering, billing & tariff reconciliation platforms",
    Beverages: "Packaging compliance & production monitoring",
    Manufacturing: "Industrial analytics & standards management",
    "Agricultural Exports": "Export documentation, cold-chain & logistics tech",
    Construction: "Worksite safety & compliance management",
    "Medical Devices": "Equipment registration & regulatory workflow tools",
    "Financial Services": "Statutory remittance, payroll & reporting engines",
    Insurance: "Premium disclosure & consumer analytics",
    Logistics: "Border clearance & single-window integration tech",
    Telecoms: "Consumer protection & billing transparency systems",
    Healthcare: "Health data interoperability & licensing platforms",
  };
  return map[industry] || "Sector-specific compliance & analytics technology";
}

function fallbackMatchProblem(title, businesses) {
  const tokens = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const list = businesses.map((b) => {
    const hay = `${b.industry} ${b.location} ${b.name} ${b.status} ${b.risk} ${b.impact} ${b.industry.split(/\s+/).slice(0, 2).join(" ")}`.toLowerCase();
    const matched = tokens.filter((t) => hay.includes(t)).length;
    const riskBonus = b.risk === "High" ? 8 : b.risk === "Medium" ? 3 : 0;
    const impactBonus = b.impact === "High" ? 6 : b.impact === "Medium" ? 2 : 0;
    const base = 42 + matched * 7 + riskBonus + impactBonus;
    const score = clamp(Math.round(base), 40, 99);
    const band = bandForScore(score);
    return {
      id: b.id,
      name: b.name,
      description: `${b.name} operates in ${b.industry} across ${b.location}, currently ${b.risk.toLowerCase()} risk with ${b.impact.toLowerCase()} regulatory impact.`,
      technology: industryTech(b.industry),
      industry: b.industry,
      location: b.location,
      reasons: matched > 0 ? ["Industry Match", "Problem Relevance", "Recorded Exposure"] : ["Eligibility"],
      priorityScore: score,
      priorityLabel: band.label,
      priorityVariant: band.variant,
      expectedImpact: b.impact,
      costFit: b.risk === "High" ? "Moderate" : b.risk === "Medium" ? "Good" : "High",
      experience: `Recorded regulatory activity in ${b.location}`,
    };
  });
  return list.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 4);
}

function normalizeMatches(parsed, title, businesses) {
  const matches = (parsed?.matches && Array.isArray(parsed.matches) ? parsed.matches : []).filter((m) => m && m.id);
  const known = new Set(businesses.map((b) => b.id));
  const sourceById = new Map(businesses.map((b) => [b.id, b]));
  const out = matches
    .filter((m) => known.has(m.id))
    .map((m) => {
      const src = sourceById.get(m.id);
      const raw = Math.round(Number(m.priorityScore) || 0);
      const score = clamp(Number.isFinite(raw) ? raw : 40, 40, 99);
      const band = bandForScore(score);
      const reasonList = Array.isArray(m.reasons) && m.reasons.length ? m.reasons.slice(0, 3) : ["Eligibility"];
      return {
        id: m.id,
        name: String(m.name || src?.name || ""),
        description: String(m.description || ""),
        technology: String(m.technology || ""),
        industry: src?.industry || "",
        location: src?.location || "",
        reasons: reasonList,
        priorityScore: score,
        priorityLabel: band.label,
        priorityVariant: band.variant,
        expectedImpact: ["High", "Medium", "Low"].includes(m.expectedImpact) ? m.expectedImpact : "Medium",
        costFit: ["Good", "Moderate", "High"].includes(m.costFit) ? m.costFit : "Moderate",
        experience: String(m.experience || ""),
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4);
  const summary =
    typeof parsed?.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : `Initial triage of "${title}" identified ${out.length} solution provider${
          out.length === 1 ? "" : "s"
        } with relevant sector exposure.`;
  return { summary, matches: out };
}

export async function matchProblemProviders(title, { businesses = [], solutions = [] } = {}) {
  const fallback = {
    summary: `Initial triage of "${title}" identified candidate solution providers based on recorded sector exposure.`,
    matches: fallbackMatchProblem(title, businesses),
  };
  if (!groqAvailable()) return fallback;

  const catalog = businesses.map((b) => `${b.id} | ${b.name} | ${b.industry} | ${b.location} | impact ${b.impact} | risk ${b.risk}`).join("\n");

  try {
    const reply = await Promise.race([
      groqChat({
        system:
          'You are the REGULENS problem matcher for Indian regulators. A government officer describes a regulatory problem. Using ONLY the provided catalog of businesses, choose up to 4 companies whose sector, location and recorded exposure make them the most relevant solution providers or affected businesses. Return ONLY valid JSON: {"summary": string (2-3 sentences on the problem context and the chosen providers), "matches": [{"id": string (exact catalog id), "name": string, "description": string (1 sentence), "technology": string (what kind of solution/technology they bring), "reasons": [array of 2-3 short strings], "priorityScore": integer 40-99, "expectedImpact": "High"|"Medium"|"Low", "costFit": "Good"|"Moderate"|"High", "experience": string}]}. Rank by relevance; never invent ids outside the catalog. No markdown.',
        user: `PROBLEM: ${title}\n\nCATALOG:\n${catalog || "(no businesses yet)"}`,
        maxTokens: 1600,
        temperature: 0.3,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("match request timed out")), 30000)),
    ]);
    const parsed = tryJson(reply);
    if (!parsed) {
      console.warn("[ai] problem-matches reply was not parseable JSON, using fallback.");
      return fallback;
    }
    return normalizeMatches(parsed, title, businesses);
  } catch (err) {
    console.warn("[ai] problem-matches unavailable, using fallback:", err.message);
    return fallback;
  }
}