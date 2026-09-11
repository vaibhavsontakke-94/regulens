export const BUSINESS_PROFILE = {
  name: "Nortex Textiles Ltd",
  legalName: "Nortex Textiles Nigeria Limited",
  id: "CAC-RC-1847293",
  businessType: "Limited Liability Company",
  industry: "Textiles & Apparel Manufacturing",
  sector: "Manufacturing",
  tagline: "Sustainable apparel for African markets",
  profileCompletion: 82,
  identity: {
    registrar: "Corporate Affairs Commission (CAC)",
    registrationDate: "2012-04-18",
    taxId: "TIN 00456789-0001",
    businessSize: "Medium enterprise",
    employees: 340,
  },
  locations: [
    { id: "LOC-01", label: "Headquarters", city: "Kaduna", state: "Kaduna", type: "Manufacturing plant", operational: true },
    { id: "LOC-02", label: "Distribution hub", city: "Abuja", state: "FCT", type: "Warehouse", operational: true },
    { id: "LOC-03", label: "Export depot", city: "Lagos", state: "Lagos", type: "Logistics hub", operational: true },
  ],
  operations: [
    { id: "OP-01", area: "Spinning & weaving", status: "Active", capacity: "600 tonnes/yr" },
    { id: "OP-02", area: "Garment assembly", status: "Active", capacity: "480k units/yr" },
    { id: "OP-03", area: "Dyeing & finishing", status: "Active", capacity: "720k m²/yr" },
    { id: "OP-04", area: "Quality lab", status: "Active", capacity: "ISO-aligned sampling" },
  ],
  productsServices: [
    "Industrial cotton fabrics",
    "Workwear & uniforms",
    "Apparel for retailers",
    "Textile finishing services",
  ],
  stage: "Growth Stage",
  revenue: "NGN 1.2B (illustrative FY2025)",
  ownership: "Private — 3 shareholders",
  licenses: [
    { id: "LIC-01", name: "Manufacturing business licence", authority: "Kaduna State", status: "Active", expiry: "2027-03-31" },
    { id: "LIC-02", name: "Import duty exemption certificate", authority: "Nigeria Customs Service", status: "Active", expiry: "2026-12-31" },
    { id: "LIC-03", name: "Environmental discharge permit", authority: "State EPA", status: "Under renewal", expiry: "2026-10-01" },
  ],
  certifications: [
    { id: "CERT-01", name: "ISO 9001:2015 (Quality Management)", status: "Active" },
    { id: "CERT-02", name: "ISO 14001:2015 (Environmental)", status: "Active" },
    { id: "CERT-03", name: "SONCAP product certification", status: "Active" },
  ],
  environmentalProfile: { energy: "Grid + diesel backup", water: "Municipal + borehole", waste: "Recycling partner", emissions: "Below threshold (est.)" },
  importExport: {
    imports: ["Dye chemicals", "Spare machinery parts"],
    exports: ["Industrial cotton fabrics", "Workwear"],
  },
  expansionPlans: [
    { id: "EXP-01", target: "Abuja Special Economic Zone", intent: "Second assembly line", horizon: "12–18 months" },
    { id: "EXP-02", target: "Kano Free Trade Zone", intent: "Export base to Sahel markets", horizon: "18–24 months" },
  ],
  contact: { phone: "+234 800 123 4567", email: "ops@nortextextiles.demo" },
};

export const HEALTH_SCORES = {
  overall: 72,
  compliance: 78,
  risk: 64,
  operations: 74,
  financialExposure: 68,
  growthReadiness: 81,
  label: "Healthy — with attention areas",
  summary:
    "Illustrative composite health for this business. Compliance and growth readiness are the strongest areas; financial exposure needs monitoring.",
};

export const COMPLIANCE_REQUIREMENTS = [
  { id: "CR-01", requirement: "Annual tax returns filing", authority: "Federal Inland Revenue Service", jurisdiction: "Federal", status: "Compliant", dueDate: "2026-06-30", risk: "Low" },
  { id: "CR-02", requirement: "PAYE remittance for employees", authority: "FIRS / State IRS", jurisdiction: "Federal & State", status: "Compliant", dueDate: "Monthly", risk: "Low" },
  { id: "CR-03", requirement: "Corporate Affairs annual returns", authority: "CAC", jurisdiction: "Federal", status: "Compliant", dueDate: "2026-08-31", risk: "Low" },
  { id: "CR-04", requirement: "Industrial effluent discharge permit", authority: "State Environmental Protection Agency", jurisdiction: "Kaduna", status: "Action Required", dueDate: "2026-10-01", risk: "High" },
  { id: "CR-05", requirement: "Occupational health & safety audit", authority: "Labour Standards Bureau", jurisdiction: "Federal", status: "Under Review", dueDate: "2026-11-15", risk: "Medium" },
  { id: "CR-06", requirement: "Product batch (SONCAP) certification renewal", authority: "Standards Organisation of Nigeria", jurisdiction: "Federal", status: "Compliant", dueDate: "2027-01-31", risk: "Medium" },
  { id: "CR-07", requirement: "Workers compensation insurance", authority: "Nigeria Social Insurance Trust Fund", jurisdiction: "Federal", status: "Action Required", dueDate: "2026-09-20", risk: "High" },
  { id: "CR-08", requirement: "Import duty exemption certificate renewal", authority: "Nigeria Customs Service", jurisdiction: "Federal", status: "Expired", dueDate: "2026-12-13", risk: "Medium" },
];

export const RISK_CATEGORIES = [
  { id: "RK-REG", category: "Regulatory", severity: "Medium", probability: "High", impact: "Medium", status: "Elevated", summary: "Expired import exemption certificate exposes duty liability; environmental permit under renewal." },
  { id: "RK-OP", category: "Operational", severity: "Low", probability: "Medium", impact: "Medium", status: "Managed", summary: "Single-line dyeing capacity concentration adds downtime exposure." },
  { id: "RK-FIN", category: "Financial", severity: "Medium", probability: "Medium", impact: "High", status: "Elevated", summary: "Growth capex reliance on debt increases financial exposure to FX movement." },
  { id: "RK-MKT", category: "Market", severity: "Low", probability: "Low", impact: "Low", status: "Stable", summary: "Local demand remains supportive for industrial fabrics." },
  { id: "RK-EXP", category: "Expansion", severity: "Low", probability: "Medium", impact: "Medium", status: "Managed", summary: "Zone approvals and infrastructure readiness drive most expansion risk." },
];

export const RISK_ANALYSIS = {
  matrixAxis: { x: "Probability", y: "Impact" },
  risks: [
    { id: "RA-01", name: "Import duty re-assessment", category: "Regulatory", probability: 3, impact: 4, action: "Renew exemption certificate; retain duty support documents." },
    { id: "RA-02", name: "Effluent permit lapse", category: "Regulatory", probability: 3, impact: 4, action: "Complete renewal application with updated discharge samples." },
    { id: "RA-03", name: "FX-driven input costs", category: "Financial", probability: 4, impact: 4, action: "Dollar-hedged procurement contract for dye chemicals." },
    { id: "RA-04", name: "Dyeing line downtime", category: "Operational", probability: 2, impact: 3, action: "Add preventive-maintenance schedule and buffer stock." },
    { id: "RA-05", name: "Zone approval delay", category: "Expansion", probability: 3, impact: 3, action: "Pre-eligibility check for Abuja SEZ incentives." },
    { id: "RA-06", name: "Workforce skill gap", category: "Market", probability: 2, impact: 2, action: "Partner with vocational academy for machine operators." },
  ],
  timeline: [
    { phase: "Now — 3 months", items: ["Renew import exemption certificate", "Submit effluent permit renewal", "Notify NSITF compliance officer"] },
    { phase: "3 — 6 months", items: ["Complete OHS audit", "Re-certify SONCAP product batches", "Negotiate FX hedging contract"] },
    { phase: "6 — 12 months", items: ["Abuja SEZ pre-application", "Second dyeing line feasibility", "Financial exposure re-baseline"] },
  ],
  mitigations: [
    { id: "MIT-01", risk: "Regulatory exposure", action: "Central compliance calendar with owner sign-off", owner: "Compliance lead", status: "Active" },
    { id: "MIT-02", risk: "Financial exposure", action: "Quarterly exposure review and hedging policy", owner: "Finance lead", status: "Active" },
    { id: "MIT-03", risk: "Operational downtime", action: "Preventive maintenance SLA with equipment partner", owner: "Plant manager", status: "Planned" },
  ],
};

export const EXPANSION_FACTORS = [
  { factor: "Regulations", scoreCurrent: 78, scoreTarget: 84, weight: 10 },
  { factor: "Licenses", scoreCurrent: 74, scoreTarget: 80, weight: 10 },
  { factor: "Certifications", scoreCurrent: 82, scoreTarget: 78, weight: 9 },
  { factor: "Taxes", scoreCurrent: 68, scoreTarget: 86, weight: 10 },
  { factor: "Labor", scoreCurrent: 72, scoreTarget: 76, weight: 9 },
  { factor: "Environment", scoreCurrent: 70, scoreTarget: 82, weight: 9 },
  { factor: "Infrastructure", scoreCurrent: 65, scoreTarget: 88, weight: 11 },
  { factor: "Workforce", scoreCurrent: 76, scoreTarget: 80, weight: 8 },
  { factor: "Logistics", scoreCurrent: 74, scoreTarget: 90, weight: 10 },
  { factor: "Incentives", scoreCurrent: 58, scoreTarget: 92, weight: 8 },
  { factor: "Setup Cost", scoreCurrent: 66, scoreTarget: 70, weight: 6 },
];

export const EXPANSION_ANALYSIS = {
  currentRegion: "Kaduna Industrial District",
  targetRegion: "Abuja Special Economic Zone",
  currentScore: 70,
  targetScore: 83,
  advantages: [
    "SEZ incentives: tax holidays and duty-free imports",
    "Superior logistics access to central corridors",
    "Modern infrastructure and power availability",
    "Stronger incentives packet for export-oriented output",
  ],
  requirements: [
    "SEZ operator licence and zone registration",
    "Environmental impact assessment clearance",
    "Re-certification of products for the zone",
    "Employment targets and payroll alignment",
  ],
  risks: [
    "Zone entry approval timeline",
    "Higher setup cost in the short term",
    "Skill availability during ramp-up",
  ],
  estimatedCost: "~NGN 340M (illustrative setup & compliance)",
  recommendedActions: [
    "Pre-approval documentation pack for zone entry",
    "Perform EIA to de-risk permit timeline",
    "Negotiate equipment lease to reduce setup cost",
    "Run 12-month pilot line in existing plant",
  ],
};

export const EXPANSION_READINESS = {
  readiness: 81,
  label: "Ready to expand",
  summary: "Illustrative readiness across 11 expansion factors.",
  breakdown: EXPANSION_FACTORS,
};

export const CERTIFICATIONS = [
  { id: "CF-01", name: "ISO 9001:2015", mandatory: false, eligibility: "Any organisation with QMS", authority: "International (certification body)", documents: "Quality manual, process docs, audit records", cost: "Medium", timeline: "6–9 months", status: "Active" },
  { id: "CF-02", name: "ISO 14001:2015", mandatory: false, eligibility: "Organisations managing environmental impact", authority: "International (certification body)", documents: "EMS policy, impact register", cost: "Medium", timeline: "6–9 months", status: "Active" },
  { id: "CF-03", name: "SONCAP product certification", mandatory: true, eligibility: "Manufacturers/exporters of listed goods", authority: "Standards Organisation of Nigeria", documents: "Batch test reports, factory audit", cost: "Low", timeline: "2–4 months", status: "Active" },
  { id: "CF-04", name: "NAFDAC registration", mandatory: true, eligibility: "Producers of regulated goods", authority: "NAFDAC", documents: "Product dossier, facility inspection", cost: "Medium", timeline: "4–8 months", status: "Not Started" },
  { id: "CF-05", name: "AfCFTA Rules of Origin certificate", mandatory: false, eligibility: "Exporters within Africa", authority: "Customs / trade authority", documents: "Origination records, product classification", cost: "Low", timeline: "1–2 months", status: "Not Started" },
  { id: "CF-06", name: "ISO 45001 (Occupational H&S)", mandatory: false, eligibility: "All organisations", authority: "International (certification body)", documents: "OHS policy, risk assessments", cost: "Medium", timeline: "8–12 months", status: "Planned" },
];

export const REGULATORY_UPDATES = [
  { id: "RU-01", regulation: "Consumer Price Guidance (Retail) Regulations", authority: "Consumer Protection Directorate", jurisdiction: "Federal", effectiveDate: "2027-01-01", impact: "Medium", businessAreas: "Pricing, retail operations", actionRequired: "Review pricing bands", status: "Upcoming" },
  { id: "RU-02", regulation: "Data Protection (Cross-Border Transfer) Rules", authority: "Data Protection Office", jurisdiction: "Federal", effectiveDate: "2026-09-15", impact: "Medium", businessAreas: "Digital operations, HR records", actionRequired: "Update data transfer consent", status: "Enacted" },
  { id: "RU-03", regulation: "Occupational Health & Safety (Contracts) Rules", authority: "Labour Standards Bureau", jurisdiction: "Federal", effectiveDate: "2026-08-01", impact: "High", businessAreas: "Worksites, subcontractors", actionRequired: "Extend safety duties to contractors", status: "Enacted" },
  { id: "RU-04", regulation: "Industrial Effluent Standards Amendment", authority: "State EPA", jurisdiction: "Kaduna", effectiveDate: "2026-12-01", impact: "High", businessAreas: "Wastewater, permits", actionRequired: "Re-sample and renew discharge permit", status: "Upcoming" },
  { id: "RU-05", regulation: "Export Documentation (Single Window) Directive", authority: "Trade Facilitation Unit", jurisdiction: "Federal", effectiveDate: "2026-11-01", impact: "Low", businessAreas: "Export clearance", actionRequired: "Adopt single-window submissions", status: "Upcoming" },
];

export const CERTIFICATION_INTEL = [
  { certification: "ISO 45001", sector: "All industries", authority: "International", demand: "High", value: "Strong", mandatory: false, status: "Recommended" },
  { certification: "AfCFTA Rules of Origin", sector: "Exporters", authority: "Customs / trade", demand: "Rising", value: "Medium", mandatory: false, status: "Recommended" },
  { certification: "NAFDAC registration", sector: "Regulated goods", authority: "NAFDAC", demand: "Regulatory", value: "Required", mandatory: true, status: "Required" },
  { certification: "SONCAP product certification", sector: "Manufacturing & exports", authority: "SON", demand: "Regulatory", value: "Required", mandatory: true, status: "Held" },
];

export const SCHEMES = [
  { id: "SCH-01", scheme: "Single-Digit Manufacturing Lending", authority: "Development Bank", eligibility: "Manufacturers exporting ≥30% output", benefit: "Loans at single-digit rates", deadline: "2026-12-31", status: "Open" },
  { id: "SCH-02", scheme: "SEZ Investment Incentives", authority: "Special Economic Zones Authority", eligibility: "Investors locating in approved zones", benefit: "Tax holidays, duty-free imports", deadline: "Rolling", status: "Open" },
  { id: "SCH-03", scheme: "Export Expansion Grant", authority: "Trade Facilitation Unit", eligibility: "Registered exporters with verifiable earnings", benefit: "Grant on export proceeds", deadline: "2027-03-31", status: "Open" },
  { id: "SCH-04", scheme: "Workers Training Rebate", authority: "Skills Development Fund", eligibility: "Firms running accredited training", benefit: "Rebate on training costs", deadline: "2026-10-31", status: "Open" },
  { id: "SCH-05", scheme: "Green Manufacturing Support", authority: "State EPA / Energy Office", eligibility: "Cleaner production investments", benefit: "Technology grant up to 40%", deadline: "2026-11-30", status: "Limited" },
];

export const MY_PROBLEMS = [
  { id: "BP-01", title: "Retail price disclosure variance", status: "VERIFIED", updated: "2026-09-10", severity: "Medium", category: "Consumer Protection & Pricing" },
  { id: "BP-02", title: "Dye chemical import clearance delay", status: "UNDER REVIEW", updated: "2026-09-09", severity: "Medium", category: "Trade & Customs" },
  { id: "BP-03", title: "Effluent permit renewal complexity", status: "SOLUTION PROPOSED", updated: "2026-09-06", severity: "High", category: "Environment" },
  { id: "BP-04", title: "OHS audit scheduling for plant B", status: "ANALYZING", updated: "2026-09-03", severity: "Low", category: "Labour & Workplace" },
  { id: "BP-05", title: "Workers compensation claim processing", status: "IN PROGRESS", updated: "2026-08-28", severity: "High", category: "Financial Systems" },
];

export const PROBLEM_LIFECYCLE = [
  "REPORTED", "ANALYZING", "SOLUTION PROPOSED", "UNDER REVIEW", "APPROVED",
  "IN PROGRESS", "IMPLEMENTED", "VERIFICATION PENDING", "VERIFIED", "RESOLVED", "REOPENED",
];

export const EVIDENCE = [
  { id: "BEV-01", type: "Photo", title: "Plant B effluent outfall", problemId: "BP-03", status: "Verified", date: "2026-09-08", note: "Sample point at discharge weir" },
  { id: "BEV-02", type: "Document", title: "Import duty exemption certificate", problemId: "BP-02", status: "Verified", date: "2026-09-05", note: "Expiry 2026-12-13" },
  { id: "BEV-03", type: "Video", title: "Warehouse compliance walkthrough", problemId: "BP-01", status: "Pending", date: "2026-09-02", note: "Retail display walkthrough" },
  { id: "BEV-04", type: "Document", title: "Digital lender correspondence", problemId: "BP-05", status: "Pending", date: "2026-08-30", note: "Claims trail" },
  { id: "BEV-05", type: "Photo", title: "Retail shelf pricing signage", problemId: "BP-01", status: "Verified", date: "2026-08-24", note: "Kaduna district" },
];

export const BIZ_REPORTS = [
  { id: "BRP-01", title: "Compliance Health Snapshot", type: "Readiness", date: "2026-09-11", status: "Ready", summary: "Illustrative snapshot of compliance status across permits, taxes and standards." },
  { id: "BRP-02", title: "Regulatory Change Brief", type: "Intelligence", date: "2026-09-08", status: "Ready", summary: "Round-up of the latest regulatory updates relevant to manufacturing." },
  { id: "BRP-03", title: "Expansion Feasibility — Abuja SEZ", type: "Expansion", date: "2026-09-02", status: "Draft", summary: "Illustrative comparison of current region vs Abuja Special Economic Zone." },
  { id: "BRP-04", title: "Risk & Exposure Review", type: "Risk", date: "2026-08-29", status: "Ready", summary: "Risk matrix review covering regulatory, financial and operational exposure." },
  { id: "BRP-05", title: "Government Schemes Watchlist", type: "Schemes", date: "2026-08-22", status: "Draft", summary: "Tracked schemes with eligibility and deadline status." },
];

export const FINANCIAL_IMPACT = {
  complianceCost: "NGN 18.5M",
  potentialExposure: "NGN 64M",
  setupCost: "NGN 96M",
  expansionCost: "NGN 340M",
  operationalImpact: "NGN 42M",
  note: "All figures are illustrative mock values for the demo. They do not represent real financial data.",
  bars: [
    { label: "Compliance Cost", value: 18.5, tone: "success", note: "Permits, audits, fees" },
    { label: "Potential Exposure", value: 64, tone: "danger", note: "Duty, penalties, claims" },
    { label: "Setup Cost", value: 96, tone: "primary", note: "Existing plant baseline" },
    { label: "Expansion Cost", value: 340, tone: "warning", note: "Abuja SEZ scenario" },
    { label: "Operational Impact", value: 42, tone: "neutral", note: "Plant running costs" },
  ],
};

export const NOTIFICATIONS = [
  { id: "BNTF-01", title: "Regulatory update affecting you", body: "Cross-Border Data Transfer Rules go live this month.", time: "2026-09-11T08:00:00Z", type: "regulatory", unread: true },
  { id: "BNTF-02", title: "Compliance deadline approaching", body: "Workers compensation insurance due 2026-09-20.", time: "2026-09-10T15:30:00Z", type: "deadline", unread: true },
  { id: "BNTF-03", title: "Problem status changed", body: "BP-01 moved to VERIFIED.", time: "2026-09-10T09:10:00Z", type: "problem", unread: false },
  { id: "BNTF-04", title: "New scheme listed", body: "Export Expansion Grant now open for applications.", time: "2026-09-08T12:00:00Z", type: "scheme", unread: false },
  { id: "BNTF-05", title: "Expansion score updated", body: "Abuja SEZ target score recomputed to 83.", time: "2026-09-06T11:45:00Z", type: "expansion", unread: false },
];

export function healthTone(value) {
  if (value >= 75) return "good";
  if (value >= 55) return "medium";
  return "attention";
}