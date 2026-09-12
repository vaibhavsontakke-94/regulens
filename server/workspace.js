import { computeProfileCompletion } from "../lib/businessProfileData.js";

const STATUS_MAP = {
  Active: "Compliant",
  Pending: "Under Review",
  "Expiring Soon": "Action Required",
  Expired: "Expired",
};

const REGISTRATION_OBLIGATIONS = {
  "CAC Registration": { requirement: "CAC annual returns filing", authority: "Corporate Affairs Commission", jurisdiction: "Federal", risk: "Low" },
  "TIN (Tax Identification)": { requirement: "Annual tax returns filing", authority: "Federal Inland Revenue Service", jurisdiction: "Federal", risk: "Low" },
  "VAT Registration": { requirement: "VAT returns and remittance", authority: "Federal Inland Revenue Service", jurisdiction: "Federal", risk: "Low" },
  PENCOM: { requirement: "Pension (PENCOM) contribution remittance", authority: "National Pension Commission", jurisdiction: "Federal", risk: "Medium" },
  NSITF: { requirement: "NSITF employee compensation contributions", authority: "Nigeria Social Insurance Trust Fund", jurisdiction: "Federal", risk: "Medium" },
  "ITF Levy": { requirement: "ITF training levy payment", authority: "Industrial Training Fund", jurisdiction: "Federal", risk: "Medium" },
  NAFDAC: { requirement: "NAFDAC product registration and renewal", authority: "NAFDAC", jurisdiction: "Federal", risk: "Medium" },
  SON: { requirement: "SON product certification", authority: "Standards Organisation of Nigeria", jurisdiction: "Federal", risk: "Medium" },
  NESREA: { requirement: "NESREA environmental compliance", authority: "NESREA", jurisdiction: "Federal", risk: "High" },
  "Factory License": { requirement: "Factory license and inspection", authority: "State Ministry of Environment / Industries", jurisdiction: "State", risk: "High" },
};

const ECONOMIC_ZONE_MARKETS = [
  "Economic Zone (e.g., Lekki Free Zone, Abuja SEZ)",
  "West Africa (ECOWAS)",
  "Sub-Saharan Africa",
  "Middle East & North Africa",
  "Europe",
  "North America",
  "Asia",
];

const REVENUE_BANDS = {
  "Under ₦25 million": { mid: 15, costBasis: 8 },
  "₦25M – ₦100M": { mid: 60, costBasis: 12 },
  "₦100M – ₦500M": { mid: 300, costBasis: 18 },
  "₦500M – ₦1B": { mid: 750, costBasis: 26 },
  "₦1B – ₦5B": { mid: 3000, costBasis: 40 },
  "Above ₦5B": { mid: 7000, costBasis: 60 },
};

export const REFERENCE_REGULATORY_UPDATES = [
  { id: "RU-01", regulation: "Consumer Price Guidance (Retail) Regulations", authority: "Consumer Protection Directorate", jurisdiction: "Federal", effectiveDate: endDate(0, 4), impact: "Medium", businessAreas: "Pricing, retail operations", actionRequired: "Review pricing bands", status: "Upcoming" },
  { id: "RU-02", regulation: "Data Protection (Cross-Border Transfer) Rules", authority: "Data Protection Office", jurisdiction: "Federal", effectiveDate: endDate(0, 0), impact: "Medium", businessAreas: "Digital operations, HR records", actionRequired: "Update data transfer consent", status: "Enacted" },
  { id: "RU-03", regulation: "Occupational Health & Safety (Contracts) Rules", authority: "Labour Standards Bureau", jurisdiction: "Federal", effectiveDate: endDate(-1, 0), impact: "High", businessAreas: "Worksites, subcontractors", actionRequired: "Extend safety duties to contractors", status: "Enacted" },
  { id: "RU-04", regulation: "Industrial Effluent Standards Amendment", authority: "State EPA", jurisdiction: "State", effectiveDate: endDate(0, 3), impact: "High", businessAreas: "Wastewater, permits", actionRequired: "Re-sample and renew discharge permit", status: "Upcoming" },
  { id: "RU-05", regulation: "Export Documentation (Single Window) Directive", authority: "Trade Facilitation Unit", jurisdiction: "Federal", effectiveDate: endDate(0, 2), impact: "Low", businessAreas: "Export clearance", actionRequired: "Adopt single-window submissions", status: "Upcoming" },
];

export const REFERENCE_CERTIFICATION_INTEL = [
  { certification: "ISO 45001", sector: "All industries", authority: "International", demand: "High", value: "Strong", mandatory: false, status: "Recommended" },
  { certification: "AfCFTA Rules of Origin", sector: "Exporters", authority: "Customs / trade", demand: "Rising", value: "Medium", mandatory: false, status: "Recommended" },
  { certification: "NAFDAC registration", sector: "Regulated goods", authority: "NAFDAC", demand: "Regulatory", value: "Required", mandatory: true, status: "Required" },
  { certification: "SONCAP product certification", sector: "Manufacturing & exports", authority: "SON", demand: "Regulatory", value: "Required", mandatory: true, status: "Required" },
];

export const REFERENCE_SCHEMES = [
  { id: "SCH-01", scheme: "Single-Digit Manufacturing Lending", authority: "Development Bank", eligibility: "Manufacturers exporting ≥30% output", benefit: "Loans at single-digit rates", deadline: endDate(0, 4), status: "Open" },
  { id: "SCH-02", scheme: "SEZ Investment Incentives", authority: "Special Economic Zones Authority", eligibility: "Investors locating in approved zones", benefit: "Tax holidays, duty-free imports", deadline: "Rolling", status: "Open" },
  { id: "SCH-03", scheme: "Export Expansion Grant", authority: "Trade Facilitation Unit", eligibility: "Registered exporters with verifiable earnings", benefit: "Grant on export proceeds", deadline: endDate(0, 7), status: "Open" },
  { id: "SCH-04", scheme: "Workers Training Rebate", authority: "Skills Development Fund", eligibility: "Firms running accredited training", benefit: "Rebate on training costs", deadline: endDate(0, 2), status: "Open" },
  { id: "SCH-05", scheme: "Green Manufacturing Support", authority: "State EPA / Energy Office", eligibility: "Cleaner production investments", benefit: "Technology grant up to 40%", deadline: endDate(0, 3), status: "Limited" },
];

function endDate(deltaMonths, extraMonths) {
  const d = new Date();
  d.setMonth(d.getMonth() + deltaMonths + extraMonths);
  return d.toISOString().slice(0, 10);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function isExpiringSoon(date) {
  if (!date || typeof date !== "string" || Number.isNaN(Date.parse(date))) return false;
  const days = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  return days > 0 && days <= 60;
}

function revenueBand(profile) {
  return profile?.scale?.revenueRange || "";
}

const BASE_OBLIGATIONS = ["CAC Registration", "TIN (Tax Identification)", "VAT Registration", "PENCOM", "NSITF", "ITF Levy"];

function buildCompliance(profile, overrides = {}) {
  const hasProfile = Boolean(profile);
  const items = [];
  const registrations = profile?.compliance?.registrations || [];
  const licenses = profile?.compliance?.licenses || [];
  const included = new Set();

  const push = (name, authority, jurisdiction, status, dueDate, risk) => {
    if (included.has(name)) return;
    included.add(name);
    items.push({
      id: `CR-${String(items.length + 1).padStart(2, "0")}`,
      requirement: name,
      authority,
      jurisdiction,
      status,
      dueDate,
      risk,
    });
  };

  if (hasProfile) {
    BASE_OBLIGATIONS.forEach((key) => {
      const template = REGISTRATION_OBLIGATIONS[key];
      if (!template) return;
      push(template.requirement, template.authority, template.jurisdiction, "Compliant", endDate(0, 2), template.risk);
    });
  }

  registrations.forEach((reg) => {
    const template = REGISTRATION_OBLIGATIONS[reg];
    if (!template) return;
    push(template.requirement, template.authority, template.jurisdiction, "Compliant", endDate(0, 2), template.risk);
  });

  licenses.forEach((license) => {
    push(license.name, license.authority, "State", STATUS_MAP[license.status] || "Under Review", license.expiry || endDate(0, 6), license.status === "Expired" || license.status === "Expiring Soon" ? "High" : license.status === "Pending" ? "Medium" : "Low");
  });

  return items.map((item) => ({
    ...item,
    status: overrides[item.id] || item.status,
  }));
}

function buildRiskCategories(profile, compliance) {
  const hasProfile = Boolean(profile);
  const active = compliance.filter((c) => c.status === "Compliant").length;
  const elevatedList = compliance.filter((c) => c.status === "Expired" || c.status === "Action Required");
  const pendingList = compliance.filter((c) => c.status === "Under Review");
  const regulatoryStatus = elevatedList.length > 0 ? "Elevated" : hasProfile ? "Managed" : "Stable";
  const financialStatus = elevatedList.length > 0 ? "Elevated" : "Managed";
  const operationalStatus = !hasProfile ? "Stable" : profile.operations?.operatingModel ? "Managed" : "Elevated";
  const marketStatus = hasProfile ? (profile.growth?.targetMarket && profile.growth?.targetMarket !== profile.growth?.currentMarket ? "Managed" : "Stable") : "Stable";
  const expansionStatus = hasProfile && profile.growth?.expansionPlans ? "Managed" : "Elevated";

  return [
    {
      id: "RK-REG",
      category: "Regulatory",
      severity: elevatedList.length > 0 ? "High" : "Medium",
      probability: elevatedList.length > 0 ? "High" : "Medium",
      impact: "Medium",
      status: regulatoryStatus,
      summary: elevatedList.length > 0
        ? `${elevatedList.length} obligation${elevatedList.length === 1 ? "" : "s"} need immediate action: ${elevatedList.map((c) => c.requirement).join(", ")}.`
        : hasProfile ? "All tracked regulatory obligations are in good standing." : "Register your business profile to generate a regulatory risk assessment.",
    },
    {
      id: "RK-OP",
      category: "Operational",
      severity: "Low",
      probability: "Medium",
      impact: "Medium",
      status: operationalStatus,
      summary: hasProfile && profile.operations?.operatingModel
        ? `Operating model (${profile.operations.operatingModel}) is defined across ${profile.operations.operations?.length || 0} operation areas.`
        : "Define your operating model and operational areas to complete this assessment.",
    },
    {
      id: "RK-FIN",
      category: "Financial",
      severity: elevatedList.length > 0 ? "Medium" : "Low",
      probability: "Medium",
      impact: "High",
      status: financialStatus,
      summary: `${pct(active, compliance.length)}% of obligations are current. ${elevatedList.length > 0 ? "Outstanding obligations increase financial exposure." : "Financial compliance is on track."}`,
    },
    {
      id: "RK-MKT",
      category: "Market",
      severity: "Low",
      probability: "Low",
      impact: "Low",
      status: marketStatus,
      summary: profile?.growth?.currentMarket || "Market presence not yet defined for this business.",
    },
    {
      id: "RK-EXP",
      category: "Expansion",
      severity: "Low",
      probability: "Medium",
      impact: "Medium",
      status: expansionStatus,
      summary: profile?.growth?.expansionPlans ? "Expansion plans are documented and being assessed." : "Document expansion plans and a target market to reduce expansion uncertainty.",
    },
  ];
}

function buildRiskAnalysis(profile, compliance, riskCategories) {
  const risks = [];
  compliance.forEach((c) => {
    if (c.status === "Expired" || c.status === "Action Required") {
      risks.push({
        id: `RA-${String(risks.length + 1).padStart(2, "0")}`,
        name: c.requirement,
        category: c.jurisdiction === "Federal" ? "Regulatory" : "Operational",
        probability: c.status === "Expired" ? 4 : 3,
        impact: c.risk === "High" ? 4 : 3,
        action: `Complete ${c.requirement} with ${c.authority} to restore compliance.`,
      });
    }
  });
  riskCategories.forEach((cat) => {
    if (cat.status === "Elevated" && cat.category !== "Regulatory") {
      risks.push({
        id: `RA-${String(risks.length + 1).padStart(2, "0")}`,
        name: `${cat.category} risk exposure`,
        category: cat.category,
        probability: cat.probability === "High" ? 4 : 3,
        impact: cat.impact === "High" ? 4 : 3,
        action: `Assign an owner and review cadence for ${cat.category} risk (${cat.severity}).`,
      });
    }
  });

  const pending = compliance.filter((c) => c.status !== "Compliant");
  const timeline = [
    {
      phase: "Now — 3 months",
      items: pending.filter((c) => isExpiringSoon(c.dueDate) || c.status === "Expired").slice(0, 3).map((c) => c.requirement),
    },
    {
      phase: "3 — 6 months",
      items: pending.filter((c) => !isExpiringSoon(c.dueDate) && c.dueDate !== "Monthly").slice(0, 3).map((c) => c.requirement),
    },
    {
      phase: "6 — 12 months",
      items: profile?.growth?.expansionPlans ? ["Expansion plan execution", "Re-baseline risk exposure", "Review certification roadmap"] : ["Define expansion targets", "Re-baseline risk exposure"],
    },
  ].map((phase) => ({ ...phase, items: phase.items.filter(Boolean) }));

  const mitigations = pending.slice(0, 3).map((c, i) => ({
    id: `MIT-${String(i + 1).padStart(2, "0")}`,
    risk: c.requirement,
    action: `Track ${c.requirement} to completion with ${c.authority}.`,
    owner: "Compliance Lead",
    status: "Active",
  }));

  return {
    matrixAxis: { x: "Probability", y: "Impact" },
    risks,
    timeline,
    mitigations,
  };
}

function buildExpansion(profile) {
  const hasProfile = Boolean(profile);
  const currentRegion = profile?.location?.primaryCity
    ? `${profile.location.primaryCity}${profile.location.state ? `, ${profile.location.state}` : ""}`
    : profile?.growth?.currentMarket || "Current region";
  const targetRegion = profile?.growth?.targetMarket || "Target market";

  const complianceFactor = complianceFactorScore(profile);
  const licensesFactor = clamp(complianceFactor + 6);
  const certificationsFactor = clamp(complianceFactor + 2);
  const taxesFactor = hasProfile ? clamp((profile.compliance?.registrations || []).length * 12 + 40) : 20;
  const laborFactor = hasProfile ? clamp((profile.scale?.employees ? 48 : 24) + (profile.operations?.operations?.length || 0) * 8) : 20;
  const environmentFactor = clamp((profile?.environmental?.environmentalProfile ? 46 : 22) + (profile?.environmental?.environmentalProfile === "High Impact Industries" ? 8 : 0));
  const infrastructureFactor = profile?.operations?.operatingModel ? 62 : 30;
  const workforceFactor = clamp((profile?.operations?.operations?.length || 0) * 10 + (profile?.scale?.employees ? 40 : 20));
  const logisticsFactor = hasProfile ? clamp((profile.location?.additionalLocations?.length || 0) * 14 + 46) : 24;
  const incentivesFactor = ECONOMIC_ZONE_MARKETS.includes(targetRegion) ? 86 : 56;
  const setupFactor = hasProfile ? clamp(100 - (profile?.growth?.expansionTimeline ? 34 : 22)) : 30;

  const factors = [
    { factor: "Regulations", scoreCurrent: complianceFactor, scoreTarget: clamp(complianceFactor + 8), weight: 10 },
    { factor: "Licenses", scoreCurrent: licensesFactor, scoreTarget: clamp(licensesFactor + 6), weight: 10 },
    { factor: "Certifications", scoreCurrent: certificationsFactor, scoreTarget: clamp(certificationsFactor + 4), weight: 9 },
    { factor: "Taxes", scoreCurrent: taxesFactor, scoreTarget: clamp(taxesFactor + 10), weight: 10 },
    { factor: "Labor", scoreCurrent: laborFactor, scoreTarget: clamp(laborFactor + 4), weight: 9 },
    { factor: "Environment", scoreCurrent: environmentFactor, scoreTarget: clamp(environmentFactor + 10), weight: 9 },
    { factor: "Infrastructure", scoreCurrent: infrastructureFactor, scoreTarget: clamp(infrastructureFactor + 14), weight: 11 },
    { factor: "Workforce", scoreCurrent: workforceFactor, scoreTarget: clamp(workforceFactor + 8), weight: 8 },
    { factor: "Logistics", scoreCurrent: logisticsFactor, scoreTarget: clamp(logisticsFactor + 12), weight: 10 },
    { factor: "Incentives", scoreCurrent: incentivesFactor, scoreTarget: clamp(incentivesFactor + 8), weight: 8 },
    { factor: "Setup Cost", scoreCurrent: setupFactor, scoreTarget: clamp(setupFactor + 4), weight: 6 },
  ];

  const weightTotal = factors.reduce((s, f) => s + f.weight, 0);
  const currentScore = Math.round(factors.reduce((s, f) => s + f.scoreCurrent * f.weight, 0) / weightTotal);
  const targetScore = Math.round(factors.reduce((s, f) => s + f.scoreTarget * f.weight, 0) / weightTotal);
  const revenue = REVENUE_BANDS[revenueBand(profile)];

  const advantages = ECONOMIC_ZONE_MARKETS.includes(targetRegion)
    ? ["Incentives: tax holidays and duty-free imports", "Modern infrastructure and power availability", "Improved logistics access to target corridors", "Stronger export-oriented policy support"]
    : hasProfile ? ["Proximity to current operations", "Familiar regulatory environment", "Lower near-term setup complexity", "Existing workforce continuity"] : ["Define expansion plans to unlock specific advantages"];

  const requirements = [
    "Complete zone or state registration requirements",
    "Environmental impact assessment where applicable",
    "Align certifications with target-market demand",
    "Confirm local permits and inspection schedules",
  ];

  const risksList = [
    "Approval and entry timelines for the target location",
    "Short-term setup and compliance costs",
    "Workforce availability during ramp-up",
  ];

  return {
    expansionFactors: factors,
    currentRegion,
    targetRegion,
    currentScore,
    targetScore,
    advantages,
    requirements,
    risks: risksList,
    estimatedCost: revenue ? `~NGN ${Math.round(revenue.mid * 0.55).toLocaleString()}M estimated setup & compliance` : "Estimated after revenue range is set",
    recommendedActions: [
      "Pre-approval documentation pack for the target location",
      "Perform an impact assessment to de-risk permit timelines",
      "Negotiate equipment lease to reduce setup cost",
      "Run a pilot in the existing plant before full relocation",
    ],
  };
}

function complianceFactorScore(profile) {
  const hasProfile = Boolean(profile);
  const regs = (profile?.compliance?.registrations || []).length;
  const licenses = (profile?.compliance?.licenses || []).length;
  const activeLicenses = (profile?.compliance?.licenses || []).filter((l) => l.status === "Active").length;
  const legalType = profile?.identity?.businessType ? 12 : 0;
  return clamp(regs * 8 + licLicenseScore(activeLicenses, licenses) * 6 + legalType + (hasProfile ? 12 : 0));
}

function licLicenseScore(active, total) {
  if (!total) return 0;
  return Math.round((active / total) * 10);
}

function buildCertifications(profile) {
  const registrations = profile?.compliance?.registrations || [];
  const licenses = profile?.compliance?.licenses || [];
  const held = new Set([...registrations, ...licenses.map((l) => l.name)]);
  const certs = [];
  const push = (name, mandatory, eligibility, authority, documents, cost, timeline, status) => {
    certs.push({ id: `CF-${String(certs.length + 1).padStart(2, "0")}`, name, mandatory, eligibility, authority, documents, cost, timeline, status });
  };

  if (hasAny(held, ["SON", "SONCAP"])) push("SONCAP product certification", true, "Manufacturers/exporters of listed goods", "Standards Organisation of Nigeria", "Batch test reports, factory audit", "Low", "2–4 months", "Active");
  else push("SONCAP product certification", true, "Manufacturers/exporters of listed goods", "Standards Organisation of Nigeria", "Batch test reports, factory audit", "Low", "2–4 months", "Not Started");

  if (hasAny(held, ["NAFDAC"])) push("NAFDAC registration", true, "Producers of regulated goods", "NAFDAC", "Product dossier, facility inspection", "Medium", "4–8 months", "Active");
  else push("NAFDAC registration", true, "Producers of regulated goods", "NAFDAC", "Product dossier, facility inspection", "Medium", "4–8 months", "Not Started");

  push("ISO 9001:2015", false, "Any organisation with QMS", "International (certification body)", "Quality manual, process docs, audit records", "Medium", "6–9 months", "Not Started");
  const exporting = profile?.environmental?.importExport === "Exporter" || profile?.environmental?.importExport === "Both Importer & Exporter";
  push("AfCFTA Rules of Origin certificate", false, "Exporters within Africa", exporting ? "Customs / trade authority" : "Customs / trade authority", "Origination records, product classification", "Low", "1–2 months", exporting ? "Planned" : "Not Started");
  push("ISO 45001 (Occupational H&S)", false, "All organisations", "International (certification body)", "OHS policy, risk assessments", "Medium", "8–12 months", "Planned");

  return certs;
}

function hasAny(held, candidates) {
  return candidates.some((c) => held.has(c));
}

function buildFinancialImpact(profile, compliance) {
  const revenue = REVENUE_BANDS[revenueBand(profile)];
  const outstanding = compliance.filter((c) => c.status === "Expired" || c.status === "Action Required").length;
  const annualEstimate = revenue ? revenue.costBasis * 8 : 0;
  const exposureEstimate = revenue ? revenue.costBasis * outstanding * 2 + revenue.costBasis * 3 : 0;
  const setupEstimate = revenue ? Math.round(revenue.mid * 0.3) : 0;
  const expansionEstimate = revenue ? Math.round(revenue.mid * 0.55) : 0;
  const operationEstimate = revenue ? Math.round(revenue.mid * 0.12) : 0;

  return {
    complianceCost: `NGN ${annualEstimate.toLocaleString()}M`,
    potentialExposure: `NGN ${exposureEstimate.toLocaleString()}M`,
    setupCost: `NGN ${setupEstimate.toLocaleString()}M`,
    expansionCost: `NGN ${expansionEstimate.toLocaleString()}M`,
    operationalImpact: `NGN ${operationEstimate.toLocaleString()}M`,
    note: `Estimated from your ${revenue ? "revenue range" : "business profile"} and current compliance status of ${compliance.length} obligations.`,
    bars: [
      { label: "Compliance Cost", value: annualEstimate, tone: "success", note: "Permits, audits, fees" },
      { label: "Potential Exposure", value: exposureEstimate, tone: "danger", note: "Duty, penalties, claims" },
      { label: "Setup Cost", value: setupEstimate, tone: "primary", note: "Existing plant baseline" },
      { label: "Expansion Cost", value: expansionEstimate, tone: "warning", note: "Expansion scenario" },
      { label: "Operational Impact", value: operationEstimate, tone: "neutral", note: "Running costs" },
    ],
  };
}

function buildHealth(profile, compliance, riskCategories, expansion) {
  const hasProfile = Boolean(profile);
  const compliant = compliance.length ? pct(compliance.filter((c) => c.status === "Compliant").length, compliance.length) : 100;
  const riskPenalty = compliance.filter((c) => c.status === "Expired").length * 15 + compliance.filter((c) => c.status === "Action Required").length * 10 + compliance.filter((c) => c.status === "Under Review").length * 5;
  const risk = clamp(100 - riskPenalty - (riskCategories.filter((c) => c.status === "Elevated").length * 5));

  const operations =
    (profile?.operations?.operatingModel ? 20 : 0) +
    Math.min((profile?.operations?.operations?.length || 0) * 10, 20) +
    (profile?.operations?.productsServices?.length ? 20 : 0) +
    (profile?.location?.primaryCity ? 15 : 0) +
    (profile?.scale?.employees ? 15 : 0) +
    (profile?.scale?.businessStage ? 10 : 0);
  const operationsScore = clamp(operations);

  const envRisk = profile?.environmental?.environmentalProfile === "High Impact Industries" || profile?.environmental?.environmentalProfile === "Significant" ? 12 : 0;
  const importExportRisk = profile?.environmental?.importExport === "Importer" || profile?.environmental?.importExport === "Exporter" || profile?.environmental?.importExport === "Both Importer & Exporter" ? 8 : 0;
  const financialScore = clamp(100 - envRisk - importExportRisk - riskPenalty);

  const growth =
    (profile?.growth?.currentMarket ? 20 : 0) +
    (profile?.growth?.targetMarket ? 25 : 0) +
    (profile?.growth?.expansionPlans ? 25 : 0) +
    (profile?.growth?.expansionTimeline ? 15 : 0) +
    (expansion.targetScore >= 60 ? 15 : 0);
  const growthScore = clamp(growth);

  const overall = clamp(growthScore * 0.2 + financialScore * 0.1 + operationsScore * 0.15 + risk * 0.25 + compliant * 0.3);
  const label = hasProfile ? (overall >= 75 ? "Healthy" : overall >= 55 ? "Moderate" : "Needs attention") : "Not set up";
  const weakest = [];
  if (compliant < 60) weakest.push("compliance");
  if (risk < 60) weakest.push("risk exposure");
  if (growthScore < 60) weakest.push("growth readiness");

  return {
    overall,
    compliance: compliant,
    risk,
    operations: operationsScore,
    financialExposure: financialScore,
    growthReadiness: growthScore,
    label,
    summary: hasProfile
      ? `Composite health for ${profile.identity?.businessName || "this business"} based on your registered profile and ${compliance.length} tracked obligations.${weakest.length ? ` Focus areas: ${weakest.join(", ")}.` : ""}`
      : "Create your Business Profile to generate a health assessment from your real registration and compliance data.",
  };
}

function buildReports(profile, compliance, riskAnalysis, expansion, certifications) {
  const pending = compliance.filter((c) => c.status !== "Compliant").length;
  return [
    {
      id: "BRP-01",
      title: "Compliance Health Snapshot",
      type: "Readiness",
      date: todayString(),
      status: "Ready",
      summary: `${profile?.identity?.businessName || "Business"} compliance posture across ${compliance.length} obligations; ${pending} require attention.`,
    },
    {
      id: "BRP-02",
      title: "Regulatory Change Brief",
      type: "Intelligence",
      date: todayString(),
      status: "Ready",
      summary: `Round-up of regulatory updates relevant to your business and ${profile?.operations?.operations?.length || 0} operation areas.`,
    },
    {
      id: "BRP-03",
      title: `Expansion Feasibility — ${expansion.targetRegion}`,
      type: "Expansion",
      date: todayString(),
      status: "Ready",
      summary: `Comparison of current region (${expansion.currentScore}/100) vs ${expansion.targetRegion} (${expansion.targetScore}/100).`,
    },
    {
      id: "BRP-04",
      title: "Risk & Exposure Review",
      type: "Risk",
      date: todayString(),
      status: "Ready",
      summary: `Risk matrix covering ${riskAnalysis.risks.length} identified exposures across regulatory, financial and operational areas.`,
    },
    {
      id: "BRP-05",
      title: "Certification Readiness",
      type: "Schemes",
      date: todayString(),
      status: "Ready",
      summary: `${certifications.filter((c) => c.status === "Active").length} of ${certifications.length} tracked certifications active.`,
    },
  ];
}

function buildNotifications(profile, compliance, riskCategories, expansions = {}) {
  const list = [];
  compliance.forEach((c) => {
    if (c.status === "Expired") list.push({ id: `NTF-CR-${c.id}`, title: "Compliance deadline missed", body: `${c.requirement} (${c.authority}) is expired.`, time: new Date().toISOString(), type: "deadline", unread: true });
    else if (c.status === "Action Required" || isExpiringSoon(c.dueDate)) list.push({ id: `NTF-CR-${c.id}`, title: "Compliance deadline approaching", body: `${c.requirement} is due ${c.dueDate} (${c.authority}).`, time: new Date().toISOString(), type: "deadline", unread: true });
  });
  REFERENCE_REGULATORY_UPDATES.forEach((u) => {
    if (u.status === "Enacted") list.push({ id: `NTF-RU-${u.id}`, title: "Regulatory update affecting you", body: `${u.regulation} is enacted · ${u.actionRequired}.`, time: new Date().toISOString(), type: "regulatory", unread: true });
  });
  REFERENCE_SCHEMES.forEach((s) => {
    if (s.status === "Open") list.push({ id: `NTF-SCH-${s.id}`, title: "Scheme application open", body: `${s.scheme} is open for applications (${s.authority}).`, time: new Date().toISOString(), type: "scheme", unread: true });
  });
  return list.slice(0, 8);
}

export function buildWorkspace(profile, { problems = [], evidence = [], reports = [], notifications = [], notificationsRead = {}, complianceStatus = {}, certificationStatus = {} } = {}) {
  const compliance = buildCompliance(profile, complianceStatus);
  const riskCategories = buildRiskCategories(profile, compliance);
  const expansion = buildExpansion(profile);
  const riskAnalysis = buildRiskAnalysis(profile, compliance, riskCategories);
  const certifications = buildCertifications(profile).map((c) => ({
    ...c,
    status: certificationStatus[c.id] || c.status,
  }));
  const financialImpact = buildFinancialImpact(profile, compliance);
  const healthScores = buildHealth(profile, compliance, riskCategories, expansion);
  const completion = computeProfileCompletion(profile);

  const staticProfile = {
    name: profile?.identity?.businessName || "Your Business",
    legalName: profile?.identity?.legalName || "",
    businessType: profile?.identity?.businessType || "",
    industry: profile?.identity?.industry || profile?.identity?.subIndustry || "",
    profileCompletion: completion,
    identity: {
      businessName: profile?.identity?.businessName || "",
      registrar: "Corporate Affairs Commission (CAC)",
      employees: profile?.scale?.employees || "",
      businessSize: profile?.scale?.businessStage || "",
    },
  };

  const derivedNotifications = buildNotifications(profile, compliance, riskCategories, expansion);
  const mergedNotifications = [...derivedNotifications, ...notifications].map((n) => ({
    ...n,
    unread: !notificationsRead[n.id] && n.unread !== false,
  }));

  return {
    staticProfile,
    healthScores,
    compliance,
    riskCategories,
    riskAnalysis,
    expansionFactors: expansion.expansionFactors,
    expansionAnalysis: {
      currentRegion: expansion.currentRegion,
      targetRegion: expansion.targetRegion,
      currentScore: expansion.currentScore,
      targetScore: expansion.targetScore,
      advantages: expansion.advantages,
      requirements: expansion.requirements,
      risks: expansion.risks,
      estimatedCost: expansion.estimatedCost,
      recommendedActions: expansion.recommendedActions,
    },
    expansionReadiness: {
      readiness: expansion.targetScore,
      label: hasAnyLabel(profile),
      summary: "Expansion readiness across tracked factors, scored from your profile.",
      breakdown: expansion.expansionFactors,
    },
    certifications,
    certificationIntel: REFERENCE_CERTIFICATION_INTEL,
    regulatoryUpdates: REFERENCE_REGULATORY_UPDATES,
    schemes: REFERENCE_SCHEMES,
    problems,
    problemLifecycle: ["REPORTED", "ANALYZING", "SOLUTION PROPOSED", "UNDER REVIEW", "APPROVED", "IN PROGRESS", "IMPLEMENTED", "VERIFICATION PENDING", "VERIFIED", "RESOLVED", "REOPENED"],
    evidence,
    reports: [...reports, ...buildReports(profile, compliance, riskAnalysis, expansion, certifications)],
    financialImpact,
    notifications: mergedNotifications,
  };
}

function hasAnyLabel(profile) {
  return profile ? (profile.growth?.expansionPlans ? "Ready to expand" : "Base readiness") : "Not set up";
}