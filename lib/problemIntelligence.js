// CENTRALIZED PROBLEM INTELLIGENCE — FRONTEND ONLY (demo)
// All data produced here is explicitly illustrative mock content.
// It exists so Government modules (Command Center, Regulations,
// Policies, Solutions, Ground Intelligence, Reports, Copilot) can all
// be connected to a single active problem context.
//
// Production will replace `buildProblemIntelligence` with API calls
// (e.g. POST /api/v1/problems, GET /api/v1/problems/{id}/businesses,
// /regulations, /policies, /solutions, /ground-intelligence, /reports)
// that return the same JSON shape, so the UI does not need to change.

export const PROBLEM_LIFECYCLE = [
  "Draft",
  "Under Review",
  "High Priority",
  "Solution Identified",
  "Pilot Recommended",
  "Pilot Running",
  "Completed",
  "Resolved",
];

const PRIORITY_BANDS = [
  { min: 80, label: "High", variant: "amber" },
  { min: 65, label: "Medium", variant: "blue" },
  { min: 0, label: "Low", variant: "neutral" },
];

const SECTOR_HINTS = [
  { regex: /farm|irrigation|water|agricultur|crop|agri/i, sector: "Agriculture" },
  { regex: /compliance|reporting|regulat|filing|audit|paperwork|licen/i, sector: "Business & Regulatory Services" },
  { regex: /price|retail|consumer|goods|inflation|essential|affordable/i, sector: "Consumer Goods & Retail" },
  { regex: /tariff|electric|energy|meter|utility|power|bill/i, sector: "Energy & Utilities" },
  { regex: /export|border|customs|trade|port|logistics|shipment/i, sector: "Trade & Logistics" },
  { regex: /pension|remittance|payroll|labour|worker|wages|benefit/i, sector: "Financial Services & Labour" },
];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function bandForScore(score) {
  return PRIORITY_BANDS.find((b) => score >= b.min);
}

function pick(seed, arr) {
  return arr[seed % arr.length];
}

function detectSector(title) {
  return SECTOR_HINTS.find((h) => h.regex.test(title))?.sector || "Cross-sector";
}

// Priority of the problem itself, derived from the top matching business.
export function buildProblemPriority(businesses) {
  const score = businesses.length ? Number(businesses[0].priorityScore) : 0;
  const band = bandForScore(score);
  return {
    score,
    level: band.label,
    variant: band.variant,
    status: score >= 80 ? "High Priority" : "Under Review",
  };
}

// Builds the full connected intelligence for an active problem.
export function buildProblemIntelligence({ id, title, businesses }) {
  const seed = hashCode(title.trim().toLowerCase());
  const { score, level, variant, status } = buildProblemPriority(businesses);
  const sector = detectSector(title);

  const businessesAffected = 800 + (seed % 1100);
  const populationImpact = 20000 + (seed % 250000);
  const economicImpact = seed % 2 ? "High" : "Medium";
  const regulatoryRisk = seed % 3 ? "Medium" : "High";
  const urgency = seed % 2 ? "High" : "Medium";

  const topProviders = businesses.slice(0, 3);

  const regulations = topProviders.map((b, i) => ({
    id: `ILR-REG-${String(seed % 90 + 10)}${i + 1}`,
    title: `${b.technology} oversight framework`,
    description: `Illustrative regulation connected to the active problem and the solution profile of ${b.name}. Demo record only — not an official instrument.`,
    relevance: i === 0 ? "High" : "Medium",
    affectedSector: sector,
    jurisdiction: "Illustrative federal jurisdiction",
    status: "Active",
  }));

  const policies = [
    {
      id: `ILR-POL-${String(seed % 90 + 10)}`,
      currentPolicy: `${sector} support & enforcement policy`,
      potentialImpact: economicImpact,
      affectedBusinesses: businessesAffected,
      affectedPopulation: populationImpact,
      options: ["Strengthen monitoring", "Co-fund adoption", "Enforcement alignment"],
      status: "Under Consultation",
    },
  ];

  const solutions = businesses.map((b, i) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    technology: b.technology,
    priorityScore: b.priorityScore,
    priorityLevel: b.priorityLabel,
    problemMatch: i === 0 ? "Very High" : "High",
    expectedImpact: i === 0 ? "High" : "Medium",
    estimatedCost: pick(seed + i, ["Low", "Medium", "High"]),
    scalability: pick(seed + i + 1, ["Medium", "High", "High"]),
    pilotRisk: pick(seed + i + 2, ["Low", "Medium", "Low"]),
    pilotSuitable: b.priorityScore >= 75,
    reasons: b.reasons,
  }));

  const locations = [0, 1, 2].map((i) => ({
    district: `District ${String.fromCharCode(65 + i)}`,
    affectedBusinesses: Math.max(120, Math.round(businessesAffected / (3 - i))),
    populationAffected: Math.max(5000, Math.round(populationImpact / (3 - i))),
    severity: i === 0 ? "High" : i === 1 ? "Medium" : "Medium",
    concentration: i === 0 ? "High" : "Medium",
    status: i === 0 ? "Under Review" : "Pending Verification",
  }));

  const groundIntelligence = {
    affectedLocations: locations,
    fieldSignals: {
      affectedBusinesses: businessesAffected,
      populationAffected: populationImpact,
      reportedSeverity: urgency,
      geographicConcentration: "High",
      status: "Pending Verification",
    },
  };

  const risk = {
    overall: regulatoryRisk,
    factors: [
      { label: "Compliance gap", level: urgency },
      { label: "Regulatory exposure", level: regulatoryRisk },
      { label: "Economic impact", level: economicImpact },
      { label: "Implementation risk", level: "Medium" },
    ],
  };

  const reports = [
    {
      id: `RPT-${id}`,
      title: "Problem Intelligence Report",
      type: "Problem Intelligence",
      status: "Draft",
      summary: `Illustrative draft report assembled from the active problem context (${sector}). No real documents exist.`,
      sections: [
        "Problem Overview",
        "Affected Businesses",
        "Priority Analysis",
        "Relevant Regulations",
        "Policy Impact",
        "Matching Businesses",
        "Solutions",
        "Risk",
        "Ground Intelligence",
        "Recommended Next Steps",
      ],
    },
  ];

  return {
    id,
    title,
    status,
    priorityScore: score,
    priorityLevel: level,
    priorityVariant: variant,
    createdAt: new Date().toISOString(),
    sector,
    overview: { businessesAffected, populationImpact, economicImpact, regulatoryRisk, urgency },
    businesses,
    regulations,
    policies,
    solutions,
    groundIntelligence,
    risk,
    reports,
    lifecycle: PROBLEM_LIFECYCLE,
  };
}