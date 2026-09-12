export const SEVERITY_META = {
  Critical: { label: "Critical", variant: "red" },
  High: { label: "High", variant: "amber" },
  Medium: { label: "Medium", variant: "blue" },
  Low: { label: "Low", variant: "neutral" },
};

export const STATUS_META = {
  "Under Review": { label: "Under Review", variant: "amber" },
  Implemented: { label: "Implemented", variant: "green" },
  "Pending Verification": { label: "Pending Verification", variant: "blue" },
  Resolved: { label: "Resolved", variant: "neutral" },
};

export const PRIORITY_META = {
  P1: { label: "P1 — Critical", short: "P1", category: "Critical", variant: "red" },
  P2: { label: "P2 — High", short: "P2", category: "High", variant: "amber" },
  P3: { label: "P3 — Medium", short: "P3", category: "Medium", variant: "blue" },
  P4: { label: "P4 — Low", short: "P4", category: "Low", variant: "neutral" },
};

export const PRIORITY_FACTORS = [
  { key: "severity", label: "Severity", weight: 20 },
  { key: "businesses", label: "Businesses Affected", weight: 15 },
  { key: "population", label: "Population Impact", weight: 15 },
  { key: "economic", label: "Economic Impact", weight: 15 },
  { key: "regulatoryRisk", label: "Regulatory Risk", weight: 15 },
  { key: "urgency", label: "Urgency", weight: 10 },
  { key: "geographic", label: "Geographic Concentration", weight: 10 },
];

export function priorityFromScores(scores) {
  const total = PRIORITY_FACTORS.reduce((sum, factor) => {
    const score = scores[factor.key] || 0;
    return sum + (score / 10) * factor.weight;
  }, 0);
  if (total >= 7.5) return { priority: "P1", score: total };
  if (total >= 6.0) return { priority: "P2", score: total };
  if (total >= 4.5) return { priority: "P3", score: total };
  return { priority: "P4", score: total };
}

export const PROBLEMS = [
  {
    id: "PRB-2026-014",
    title: "Retail price transparency for essential goods",
    location: "Jaipur, Pune & Mumbai",
    category: "Consumer Protection & Pricing",
    severity: "High",
    businessesAffected: 128,
    populationImpact: 2100000,
    status: "Under Review",
    updated: "2026-09-11",
    summary:
      "Consumers report wide unexplained price variation for regulated essential goods between neighbouring retail districts. Illustrative intelligence suggests inconsistent application of published price guidance.",
    rootCauses: [
      "Inconsistent compliance with published price reference bands",
      "Limited enforcement capacity at district level",
      "Gaps in point-of-sale data reporting by large retailers",
    ],
    scores: {
      severity: 7,
      businesses: 6,
      population: 8,
      economic: 7,
      regulatoryRisk: 6,
      urgency: 8,
      geographic: 6,
    },
    affectedBusinessIds: ["BSN-001", "BSN-002", "BSN-007"],
    regulationIds: ["REG-1001", "REG-1002"],
    policyIds: ["POL-2001"],
    solutionIds: ["SOL-3001", "SOL-3002"],
    implementation: {
      stage: "Policy design under consultation",
      progress: 35,
      owner: "Consumer Protection Directorate",
      nextMilestone: "Reference price band gazette — Dec 2026",
    },
    geographic: {
      areas: ["Jaipur", "Pune", "Mumbai"],
      businessConcentration: "High in retail corridors of Jaipur and Mumbai",
      severityByArea: { Jaipur: "High", Pune: "Medium", Mumbai: "High" },
    },
    audits: [
      { time: "2026-09-11T09:20:00Z", actor: "System", action: "Impact indicators refreshed" },
      { time: "2026-09-09T14:10:00Z", actor: "A. Yusuf", action: "Regulatory context updated" },
      { time: "2026-09-05T10:00:00Z", actor: "System", action: "Problem created from field report" },
    ],
  },
  {
    id: "PRB-2026-013",
    title: "Electricity tariff compliance gaps in distribution",
    location: "Federal (India)",
    category: "Energy Regulation",
    severity: "Critical",
    businessesAffected: 64,
    populationImpact: 4200000,
    status: "Pending Verification",
    updated: "2026-09-10",
    summary:
      "Illustrative intelligence flags distribution companies billing above approved tariff bands, with high-impact concentration in metro districts and weak consumer redress pathways.",
    rootCauses: [
      "Tariff band misinterpretation across customer classes",
      "Insufficient metering coverage",
      "Slow dispute resolution by distribution companies",
    ],
    scores: {
      severity: 9,
      businesses: 5,
      population: 9,
      economic: 8,
      regulatoryRisk: 8,
      urgency: 9,
      geographic: 7,
    },
    affectedBusinessIds: ["BSN-004"],
    regulationIds: ["REG-1003"],
    policyIds: ["POL-2002"],
    solutionIds: ["SOL-3003"],
    implementation: {
      stage: "Ground verification in progress",
      progress: 60,
      owner: "Energy Regulatory Desk",
      nextMilestone: "Verify billing data across 3 metro districts — Nov 2026",
    },
    geographic: {
      areas: ["Delhi NCR", "Mumbai", "Chennai"],
      businessConcentration: "Concentrated in commercial clusters",
      severityByArea: { "Delhi NCR": "Critical", Mumbai: "High", "Chennai": "High" },
    },
    audits: [
      { time: "2026-09-10T16:40:00Z", actor: "System", action: "Verification evidence requested" },
      { time: "2026-09-08T11:05:00Z", actor: "B. Okafor", action: "Affected businesses identified" },
    ],
  },
  {
    id: "PRB-2026-012",
    title: "Data localization requirements for financial institutions",
    location: "Mumbai & Delhi NCR",
    category: "Digital & Data Governance",
    severity: "High",
    businessesAffected: 23,
    populationImpact: 0,
    status: "Under Review",
    updated: "2026-09-09",
    summary:
      "Illustrative assessment of cross-border data flows indicates ambiguity between sectoral data protection rules and proposed localization requirements for customer financial data.",
    rootCauses: [
      "Overlapping provisions across data governance instruments",
      "Limited regulatory guidance on cross-border transfers",
      "Compliance cost pressure on fintech operators",
    ],
    scores: {
      severity: 6,
      businesses: 7,
      population: 4,
      economic: 7,
      regulatoryRisk: 9,
      urgency: 6,
      geographic: 4,
    },
    affectedBusinessIds: ["BSN-006", "BSN-010"],
    regulationIds: ["REG-1004", "REG-1005"],
    policyIds: ["POL-2003"],
    solutionIds: ["SOL-3004", "SOL-3005"],
    implementation: {
      stage: "Regulatory impact analysis",
      progress: 25,
      owner: "Digital Economy Unit",
      nextMilestone: "Interpretive guidance draft — Jan 2027",
    },
    geographic: { areas: ["Mumbai", "Delhi NCR"], businessConcentration: "Fintech hub clusters", severityByArea: { Mumbai: "High", "Delhi NCR": "Medium" } },
    audits: [
      { time: "2026-09-09T08:30:00Z", actor: "C. Eze", action: "Regulatory risk reassessed" },
    ],
  },
  {
    id: "PRB-2026-011",
    title: "Food safety certification backlog at border entry points",
    location: "Mumbai, Kochi & Chennai",
    category: "Food Safety",
    severity: "Critical",
    businessesAffected: 540,
    populationImpact: 8400000,
    status: "Under Review",
    updated: "2026-09-08",
    summary:
      "Illustrative backlog in food safety certification is delaying perishable imports, raising spoilage losses and creating food security pressure in urban markets.",
    rootCauses: [
      "Manual certification workflow and limited laboratories",
      "Insufficient inspection staffing at major ports",
      "Uncoordinated document checks across agencies",
    ],
    scores: {
      severity: 8,
      businesses: 9,
      population: 9,
      economic: 8,
      regulatoryRisk: 7,
      urgency: 9,
      geographic: 8,
    },
    affectedBusinessIds: ["BSN-002", "BSN-009"],
    regulationIds: ["REG-1006"],
    policyIds: ["POL-2004"],
    solutionIds: ["SOL-3006"],
    implementation: {
      stage: "Workflow redesign scoping",
      progress: 20,
      owner: "Standards & Inspection Directorate",
      nextMilestone: "Port pilot — Feb 2027",
    },
    geographic: { areas: ["Mumbai", "Kochi", "Chennai"], businessConcentration: "Import terminal corridors", severityByArea: { Mumbai: "Critical", Kochi: "High", "Chennai": "High" } },
    audits: [
      { time: "2026-09-08T13:15:00Z", actor: "System", action: "Backlog threshold breached" },
    ],
  },
  {
    id: "PRB-2026-010",
    title: "Occupational health standards in construction supply chains",
    location: "Delhi NCR & Federal Capital Territory",
    category: "Labour & Workplace",
    severity: "Medium",
    businessesAffected: 210,
    populationImpact: 640000,
    status: "Implemented",
    updated: "2026-09-07",
    summary:
      "Illustrative roll-out of updated occupational health standards for construction subcontractors. Majority of covered firms now aligned with mandatory PPE and training requirements.",
    rootCauses: [
      "Subcontractor tiers operating below supervision thresholds",
      "Variable enforcement across worksites",
    ],
    scores: {
      severity: 5,
      businesses: 6,
      population: 5,
      economic: 4,
      regulatoryRisk: 5,
      urgency: 5,
      geographic: 5,
    },
    affectedBusinessIds: ["BSN-008"],
    regulationIds: ["REG-1007"],
    policyIds: ["POL-2005"],
    solutionIds: ["SOL-3007"],
    implementation: { stage: "Implemented — verification scheduled", progress: 85, owner: "Labour Standards Bureau", nextMilestone: "Worksite verification — Oct 2026" },
    geographic: { areas: ["Delhi NCR"], businessConcentration: "Construction clusters", severityByArea: { "Delhi NCR": "Medium" } },
    audits: [
      { time: "2026-09-07T12:00:00Z", actor: "D. Ibrahim", action: "Implementation confirmed" },
    ],
  },
  {
    id: "PRB-2026-009",
    title: "Export documentation delays for agricultural produce",
    location: "Ahmedabad, Surat & Jaipur",
    category: "Trade & Customs",
    severity: "High",
    businessesAffected: 180,
    populationImpact: 1300000,
    status: "Pending Verification",
    updated: "2026-09-06",
    summary:
      "Illustrative inefficiency in export documentation workflows adds 6–9 days to clearance for agricultural consignments, affecting perishable produce and grower margins.",
    rootCauses: [
      "Duplicate document submissions across platforms",
      "Limited single-window integration",
    ],
    scores: {
      severity: 6,
      businesses: 8,
      population: 6,
      economic: 7,
      regulatoryRisk: 6,
      urgency: 7,
      geographic: 5,
    },
    affectedBusinessIds: ["BSN-007"],
    regulationIds: ["REG-1008"],
    policyIds: ["POL-2004"],
    solutionIds: ["SOL-3008"],
    implementation: { stage: "Verification of queue reduction", progress: 55, owner: "Trade Facilitation Unit", nextMilestone: "Measure average clearance after pilot — Nov 2026" },
    geographic: { areas: ["Ahmedabad", "Surat", "Jaipur"], businessConcentration: "Produce export hubs", severityByArea: { Ahmedabad: "High", Surat: "Medium", Jaipur: "High" } },
    audits: [
      { time: "2026-09-06T09:45:00Z", actor: "E. Adeyemi", action: "Documentation sample collected" },
    ],
  },
  {
    id: "PRB-2026-008",
    title: "Pension remittance defaults in the SME sector",
    location: "Federal (India)",
    category: "Financial Systems",
    severity: "Medium",
    businessesAffected: 960,
    populationImpact: 1100000,
    status: "Under Review",
    updated: "2026-09-05",
    summary:
      "Illustrative intelligence estimates a share of registered SMEs failing to remit pension contributions within required timelines, affecting contributor trust and entitlements.",
    rootCauses: [
      "Cash-flow pressure among small employers",
      "Weak automated tracking of remittance schedules",
    ],
    scores: {
      severity: 5,
      businesses: 8,
      population: 5,
      economic: 6,
      regulatoryRisk: 6,
      urgency: 5,
      geographic: 5,
    },
    affectedBusinessIds: ["BSN-010"],
    regulationIds: ["REG-1002"],
    policyIds: ["POL-2003"],
    solutionIds: ["SOL-3005"],
    implementation: { stage: "Remittance analytics scoped", progress: 15, owner: "Financial Systems Desk", nextMilestone: "Baseline dataset — Dec 2026" },
    geographic: { areas: ["National"], businessConcentration: "Spread across SME hubs", severityByArea: { National: "Medium" } },
    audits: [
      { time: "2026-09-05T15:00:00Z", actor: "System", action: "Remittance pattern detected" },
    ],
  },
  {
    id: "PRB-2026-007",
    title: "Fluoride standards for packaged water",
    location: "Pune & Dehradun",
    category: "Health & Safety",
    severity: "High",
    businessesAffected: 32,
    populationImpact: 3000000,
    status: "Implemented",
    updated: "2026-09-04",
    summary:
      "Illustrative enforcement of updated fluoride limits for packaged water. Sampling across producing states indicates compliance levels now within required bands.",
    rootCauses: [
      "Historical use of source water above recommended thresholds",
      "Limited treatment verification among small producers",
    ],
    scores: {
      severity: 7,
      businesses: 4,
      population: 8,
      economic: 5,
      regulatoryRisk: 6,
      urgency: 7,
      geographic: 6,
    },
    affectedBusinessIds: ["BSN-005"],
    regulationIds: ["REG-1006"],
    policyIds: ["POL-2005"],
    solutionIds: ["SOL-3007"],
    implementation: { stage: "Implemented — verification scheduled", progress: 88, owner: "Standards & Inspection Directorate", nextMilestone: "Follow-up sampling — Oct 2026" },
    geographic: { areas: ["Pune", "Dehradun"], businessConcentration: "Packaged water producers", severityByArea: { Pune: "High", Dehradun: "Medium" } },
    audits: [
      { time: "2026-09-04T11:20:00Z", actor: "F. Nnaji", action: "Sampling results recorded" },
    ],
  },
  {
    id: "PRB-2026-006",
    title: "Advertising disclosure rules for digital lenders",
    location: "Mumbai & National digital channels",
    category: "Financial Consumer Protection",
    severity: "Medium",
    businessesAffected: 41,
    populationImpact: 520000,
    status: "Resolved",
    updated: "2026-09-02",
    summary:
      "Illustrative campaign on advertising disclosure for digital lenders. Sample audits now show required interest-rate and fee disclosures consistently displayed.",
    rootCauses: [
      "Non-standard disclosure placement across digital channels",
      "Ambiguity in what constitutes a 'clear summary'",
    ],
    scores: {
      severity: 5,
      businesses: 5,
      population: 6,
      economic: 5,
      regulatoryRisk: 5,
      urgency: 4,
      geographic: 4,
    },
    affectedBusinessIds: ["BSN-006"],
    regulationIds: ["REG-1004"],
    policyIds: ["POL-2001"],
    solutionIds: ["SOL-3004"],
    implementation: { stage: "Resolved and archived", progress: 100, owner: "Consumer Protection Directorate", nextMilestone: "—" },
    geographic: { areas: ["Mumbai"], businessConcentration: "Digital lender platforms", severityByArea: { Mumbai: "Medium" } },
    audits: [
      { time: "2026-09-02T10:30:00Z", actor: "System", action: "Problem resolved" },
    ],
  },
  {
    id: "PRB-2026-005",
    title: "Waste management compliance for manufacturers",
    location: "Surat & Rivers",
    category: "Environment",
    severity: "Low",
    businessesAffected: 86,
    populationImpact: 0,
    status: "Resolved",
    updated: "2026-08-28",
    summary:
      "Illustrative review of packaging waste compliance. Tracking indicates manufacturers have adopted required registration and reporting within scope.",
    rootCauses: [
      "Low awareness of extended reporting obligations",
      "Compliance tracking discontinuity between local authorities",
    ],
    scores: {
      severity: 4,
      businesses: 5,
      population: 3,
      economic: 4,
      regulatoryRisk: 5,
      urgency: 3,
      geographic: 5,
    },
    affectedBusinessIds: [],
    regulationIds: ["REG-1007"],
    policyIds: [],
    solutionIds: ["SOL-3008"],
    implementation: { stage: "Resolved and archived", progress: 100, owner: "Environment Desk", nextMilestone: "—" },
    geographic: { areas: ["Surat", "Rivers"], businessConcentration: "Manufacturing belts", severityByArea: { Surat: "Low", Rivers: "Low" } },
    audits: [
      { time: "2026-08-28T14:00:00Z", actor: "G. Bello", action: "Compliance confirmed" },
    ],
  },
  {
    id: "PRB-2026-004",
    title: "Import permit digitization for medical devices",
    location: "Federal (India)",
    category: "Health & Product Registration",
    severity: "Critical",
    businessesAffected: 27,
    populationImpact: 5200000,
    status: "Under Review",
    updated: "2026-08-26",
    summary:
      "Illustrative assessment of import permit workflows for medical devices shows reliance on paper verification, slowing registration of critical equipment and maintenance parts.",
    rootCauses: [
      "Paper-based verification of device classification",
      "Limited national database of approved devices",
    ],
    scores: {
      severity: 8,
      businesses: 6,
      population: 8,
      economic: 6,
      regulatoryRisk: 7,
      urgency: 8,
      geographic: 5,
    },
    affectedBusinessIds: ["BSN-009"],
    regulationIds: ["REG-1005", "REG-1006"],
    policyIds: ["POL-2004"],
    solutionIds: ["SOL-3006", "SOL-3001"],
    implementation: { stage: "Solution design", progress: 18, owner: "Health Regulation Unit", nextMilestone: "Workflow prototype — Dec 2026" },
    geographic: { areas: ["Mumbai", "Delhi NCR"], businessConcentration: "Medical distribution hubs", severityByArea: { Mumbai: "High", "Delhi NCR": "High" } },
    audits: [
      { time: "2026-08-26T09:00:00Z", actor: "H. Usman", action: "Regulatory impact assessed" },
    ],
  },
  {
    id: "PRB-2026-003",
    title: "Insurance pricing transparency for consumers",
    location: "National (digital channels)",
    category: "Insurance Regulation",
    severity: "Low",
    businessesAffected: 38,
    populationImpact: 0,
    status: "Implemented",
    updated: "2026-08-22",
    summary:
      "Illustrative monitoring confirms premium quotations now display base price, levies and optional covers in a consistent format across major digital insurers.",
    rootCauses: [
      "Inconsistent premium breakdown presentation",
      "Unclear presentation of optional add-ons",
    ],
    scores: {
      severity: 4,
      businesses: 5,
      population: 4,
      economic: 4,
      regulatoryRisk: 4,
      urgency: 3,
      geographic: 4,
    },
    affectedBusinessIds: [],
    regulationIds: ["REG-1004"],
    policyIds: [],
    solutionIds: ["SOL-3004"],
    implementation: { stage: "Implemented — monitoring", progress: 92, owner: "Insurance Desk", nextMilestone: "Quarterly monitoring — Dec 2026" },
    geographic: { areas: ["National"], businessConcentration: "Digital insurers", severityByArea: { National: "Low" } },
    audits: [
      { time: "2026-08-22T12:45:00Z", actor: "I. Nwachukwu", action: "Monitoring baseline established" },
    ],
  },
];

export const BUSINESSES = [
  { id: "BSN-001", name: "Zambezi Foods", industry: "Food Manufacturing", location: "Jaipur", impact: "High", risk: "High", status: "Affected" },
  { id: "BSN-002", name: "Helix Pharma Distributors", industry: "Pharmaceuticals", location: "Mumbai", impact: "High", risk: "Medium", status: "Affected" },
  { id: "BSN-003", name: "Nortex Textiles", industry: "Manufacturing", location: "Pune", impact: "Medium", risk: "Low", status: "Monitored" },
  { id: "BSN-004", name: "Atlas Energy Retail", industry: "Energy", location: "Chennai", impact: "High", risk: "High", status: "Affected" },
  { id: "BSN-005", name: "ClearWaters Ltd", industry: "Beverages", location: "Delhi NCR", impact: "Medium", risk: "Medium", status: "Monitored" },
  { id: "BSN-006", name: "DigitFinance", industry: "Fintech", location: "Mumbai", impact: "High", risk: "Medium", status: "At Risk" },
  { id: "BSN-007", name: "AgriLink Exports", industry: "Agricultural Exports", location: "Ahmedabad", impact: "High", risk: "High", status: "Affected" },
  { id: "BSN-008", name: "BuildRight Contractors", industry: "Construction", location: "Delhi NCR", impact: "Medium", risk: "Low", status: "Monitored" },
  { id: "BSN-009", name: "MedSupply India", industry: "Medical Devices", location: "Mumbai", impact: "High", risk: "Medium", status: "Affected" },
  { id: "BSN-010", name: "Payroll Systems Ltd", industry: "Financial Services", location: "Lucknow", impact: "Medium", risk: "Medium", status: "At Risk" },
];

export const REGULATIONS = [
  { id: "REG-1001", title: "Consumer Price Guidance (Retail) Regulations", authority: "Consumer Protection Directorate", jurisdiction: "Federal", effectiveDate: "2026-01-01", impact: "High", status: "Active", sections: 42, description: "Sets reference price bands for essential goods and retail disclosure obligations." },
  { id: "REG-1002", title: "Employee Benefits (Remittance) Regulations", authority: "National Pensions Authority", jurisdiction: "Federal", effectiveDate: "2025-06-01", impact: "Medium", status: "Active", sections: 28, description: "Defines contribution timelines and reporting duties for all registered employers." },
  { id: "REG-1003", title: "Electricity Tariff (Customer Classes) Order", authority: "Energy Regulatory Commission", jurisdiction: "Federal", effectiveDate: "2025-11-01", impact: "High", status: "Active", sections: 55, description: "Specifies approved tariff bands and metering obligations per customer class." },
  { id: "REG-1004", title: "Digital Lending Disclosure Regulation", authority: "Financial Services Commission", jurisdiction: "Federal", effectiveDate: "2025-09-01", impact: "High", status: "Active", sections: 31, description: "Governs advertising disclosures and summary pricing for digital lenders." },
  { id: "REG-1005", title: "Data Protection (Cross-Border Transfer) Rules", authority: "Data Protection Office", jurisdiction: "Federal", effectiveDate: "2026-02-01", impact: "Medium", status: "Active", sections: 47, description: "Conditions for transferring customer data across borders, with sector carve-outs." },
  { id: "REG-1006", title: "Food & Products Safety Standards", authority: "Standards & Inspection Directorate", jurisdiction: "Federal", effectiveDate: "2025-05-01", impact: "High", status: "Active", sections: 120, description: "Set mandatory safety, labelling and sampling standards across food, water and devices." },
  { id: "REG-1007", title: "Occupational Health & Safety (Contracts) Rules", authority: "Labour Standards Bureau", jurisdiction: "Federal", effectiveDate: "2025-08-01", impact: "Medium", status: "Active", sections: 63, description: "Extends health and safety duties to subcontractor tiers in construction." },
  { id: "REG-1008", title: "Export Documentation (Single Window) Directive", authority: "Trade Facilitation Unit", jurisdiction: "Federal", effectiveDate: "2026-03-01", impact: "Medium", status: "Active", sections: 22, description: "Mandates single-window submission and duplicate-document elimination for exports." },
];

export const POLICIES = [
  { id: "POL-2001", title: "Essential Goods Price Band Policy", problemId: "PRB-2026-014", type: "Proposed", status: "Under Consultation", currentState: "Reference prices published but non-binding", scenario: "Binding reference price bands with retail display requirement", affectedGroups: "Retailers, distributors, consumers", economicEffect: "−2.4% projected consumer cost index", operationalEffect: "New display and reporting duties for ~5,200 retailers", regulatoryEffect: "Amends Consumer Price Guidance Regulations" },
  { id: "POL-2002", title: "Tariff Compliance & Redress Framework", problemId: "PRB-2026-013", type: "Proposed", status: "Under Consultation", currentState: "Tariff bands fragmented across customer classes", scenario: "Unified tariff bands with mandatory 72-hour redress", affectedGroups: "Distribution companies, households, SMEs", economicEffect: "−9% projected household overbilling exposure", operationalEffect: "Billing system certification for all distributors", regulatoryEffect: "Consolidates Electricity Tariff Order" },
  { id: "POL-2003", title: "Cross-Border Data Transfer Guidance", problemId: "PRB-2026-012", type: "Proposed", status: "Draft", currentState: "Sectoral provisions overlap with no guidance", scenario: "Standard adequacy framework with sector carve-outs", affectedGroups: "Financial institutions, fintech, cloud providers", economicEffect: "Unlock ~1,100 projected jobs in data services", operationalEffect: "Standard contractual clauses for transfers", regulatoryEffect: "Reconciles Data Protection Rules" },
  { id: "POL-2004", title: "Border Clearance Modernisation Programme", problemId: "PRB-2026-011", type: "Active", status: "In Implementation", currentState: "Manual certification with multi-agency checks", scenario: "Digitized single-floor certification at 3 ports", affectedGroups: "Importers, freight forwarders, inspection bodies", economicEffect: "−38% projected spoilage loss on perishables", operationalEffect: "One-time submission, shared inspection data", regulatoryEffect: "Streamlines Food Safety Standards workflow" },
  { id: "POL-2005", title: "Standards Enforcement Master Plan", problemId: "PRB-2026-010", type: "Active", status: "In Implementation", currentState: "Variable enforcement across sectors", scenario: "Risk-ranked sampling with joint agency inspection", affectedGroups: "Producers, importers, inspection agencies", economicEffect: "−15% projected non-compliance remediation cost", operationalEffect: "Shared lab capacity and joint inspection teams", regulatoryEffect: "Amends Standards Enforcement cadence" },
];

export const SOLUTIONS = [
  { id: "SOL-3001", title: "Digital price monitoring dashboard", problemId: "PRB-2026-014", cost: "Medium", time: "4–6 months", impact: "High", feasibility: "High", compatibility: "High", status: "In Design", owner: "Consumer Protection Directorate" },
  { id: "SOL-3002", title: "Retailer price-reference training & signage", problemId: "PRB-2026-014", cost: "Low", time: "2–3 months", impact: "Medium", feasibility: "High", compatibility: "High", status: "Proposed", owner: "State Consumer Bureaus" },
  { id: "SOL-3003", title: "Metro billing verification drive", problemId: "PRB-2026-013", cost: "Medium", time: "3–4 months", impact: "High", feasibility: "Medium", compatibility: "High", status: "In Implementation", owner: "Energy Regulatory Desk" },
  { id: "SOL-3004", title: "Disclosure compliance scanner", problemId: "PRB-2026-006", cost: "Low", time: "2 months", impact: "Medium", feasibility: "High", compatibility: "High", status: "Implemented", owner: "Financial Consumer Protection Unit" },
  { id: "SOL-3005", title: "SME remittance analytics workspace", problemId: "PRB-2026-008", cost: "Medium", time: "3–6 months", impact: "Medium", feasibility: "Medium", compatibility: "High", status: "In Design", owner: "Financial Systems Desk" },
  { id: "SOL-3006", title: "Single-floor border certification pilot", problemId: "PRB-2026-011", cost: "High", time: "6–9 months", impact: "High", feasibility: "Medium", compatibility: "Medium", status: "In Design", owner: "Standards & Inspection Directorate" },
  { id: "SOL-3007", title: "Shared lab sampling partnership", problemId: "PRB-2026-007", cost: "Medium", time: "4 months", impact: "Medium", feasibility: "High", compatibility: "High", status: "Implemented", owner: "Standards & Inspection Directorate" },
  { id: "SOL-3008", title: "Single-window export documentation", problemId: "PRB-2026-009", cost: "High", time: "8–12 months", impact: "High", feasibility: "Medium", compatibility: "Medium", status: "In Implementation", owner: "Trade Facilitation Unit" },
];

export const EVIDENCE = [
  { id: "EVD-001", problemId: "PRB-2026-013", type: "Photo", title: "Substation meter readings — district A", status: "Verified", date: "2026-09-04", before: "Unmetered cluster, estimated overbilling", after: "Contractor meter installed, corrected band" },
  { id: "EVD-002", problemId: "PRB-2026-014", type: "Document", title: "Mumbai retail corridor price survey", status: "Verified", date: "2026-09-06", before: "17% variance vs reference band", after: "Survey v2 shows 6% variance" },
  { id: "EVD-003", problemId: "PRB-2026-011", type: "Inspection", title: "Kochi port cold-chain inspection", status: "Pending", date: "2026-09-09", before: "Backlog of 12,400 consignments", after: "Digitized queue under test" },
  { id: "EVD-004", problemId: "PRB-2026-007", type: "Document", title: "Pune water sampling results", status: "Verified", date: "2026-09-02", before: "2 producers above threshold", after: "All samples within band" },
  { id: "EVD-005", problemId: "PRB-2026-009", type: "Photo", title: "Export clearing bay queue sample", status: "Pending", date: "2026-09-07", before: "Average 7-day wait", after: "Pilot queue under measurement" },
  { id: "EVD-006", problemId: "PRB-2026-010", type: "Inspection", title: "Construction worksite audit — FCT", status: "Verified", date: "2026-09-01", before: "38% sites short of PPE", after: "Re-audit shows 92% compliance" },
];

export const REPORTS = [
  { id: "RPT-001", title: "Quarterly Regulatory Intelligence Digest", type: "Quarterly Digest", date: "2026-09-30", status: "Draft", summary: "Consolidated regulatory signals and impact intelligence for Q3 2026." },
  { id: "RPT-002", title: "Essential Goods Pricing Investigation", type: "Investigation", date: "2026-09-18", status: "Ready", summary: "Findings and evidence review for retail price transparency problem PRB-2026-014." },
  { id: "RPT-003", title: "Tariff Compliance Verification Report", type: "Verification", date: "2026-09-12", status: "Ready", summary: "Ground verification results for electricity tariff compliance (PRB-2026-013)." },
  { id: "RPT-004", title: "Border Clearance Backlog Analysis", type: "Analysis", date: "2026-09-05", status: "Draft", summary: "Quantified impact and workflow analysis for food safety certification backlog." },
  { id: "RPT-005", title: "Policy Option Appraisal — Price Bands", type: "Policy Appraisal", date: "2026-08-30", status: "Ready", summary: "Appraisal of binding reference price bands against evidence base." },
  { id: "RPT-006", title: "SME Remittance Compliance Baseline", type: "Baseline", date: "2026-08-25", status: "Draft", summary: "Baseline estimate of pension remittance gaps across registered SMEs." },
];

export const NOTIFICATIONS = [
  { id: "NTF-001", title: "Priority assessment updated", body: "PRB-2026-013 changed to P1 after new verification evidence.", time: "2026-09-11T08:40:00Z", type: "priority", unread: true },
  { id: "NTF-002", title: "Ground evidence submitted", body: "EVD-001 'Substation meter readings' marked Verified by inspection team.", time: "2026-09-11T07:15:00Z", type: "evidence", unread: true },
  { id: "NTF-003", title: "Policy consultation opened", body: "POL-2001 'Essential Goods Price Band Policy' opened for consultation.", time: "2026-09-10T16:20:00Z", type: "policy", unread: true },
  { id: "NTF-004", title: "Verification deadline approaching", body: "EVD-003 inspection due within 48 hours.", time: "2026-09-10T09:00:00Z", type: "deadline", unread: false },
  { id: "NTF-005", title: "Affected businesses refreshed", body: "128 businesses now associated with PRB-2026-014.", time: "2026-09-09T14:10:00Z", type: "business", unread: false },
  { id: "NTF-006", title: "Report ready for review", body: "RPT-002 'Essential Goods Pricing Investigation' is ready.", time: "2026-09-08T11:30:00Z", type: "report", unread: false },
];

export const AUDIT_LOGS = [
  { time: "2026-09-11T08:40:00Z", actor: "System", action: "Priority score recomputed for PRB-2026-013", outcome: "P1", target: "PRB-2026-013" },
  { time: "2026-09-11T07:15:00Z", actor: "B. Okafor", action: "Marked evidence EVD-001 as Verified", outcome: "Success", target: "EVD-001" },
  { time: "2026-09-10T16:20:00Z", actor: "A. Yusuf", action: "Opened consultation on POL-2001", outcome: "Success", target: "POL-2001" },
  { time: "2026-09-10T09:00:00Z", actor: "System", action: "Deadline reminder generated", outcome: "Info", target: "EVD-003" },
  { time: "2026-09-09T14:10:00Z", actor: "System", action: "Business association refreshed for PRB-2026-014", outcome: "128 updated", target: "PRB-2026-014" },
  { time: "2026-09-09T10:05:00Z", actor: "C. Eze", action: "Adjusted regulatory risk factor for PRB-2026-012", outcome: "Success", target: "PRB-2026-012" },
  { time: "2026-09-08T13:15:00Z", actor: "System", action: "Backlog threshold breach flagged", outcome: "Warning", target: "PRB-2026-011" },
  { time: "2026-09-08T11:30:00Z", actor: "G. Bello", action: "Published report RPT-002", outcome: "Success", target: "RPT-002" },
  { time: "2026-09-07T12:00:00Z", actor: "D. Ibrahim", action: "Confirmed implementation for PRB-2026-010", outcome: "Success", target: "PRB-2026-010" },
  { time: "2026-09-06T09:45:00Z", actor: "E. Adeyemi", action: "Collected documentation sample", outcome: "Success", target: "PRB-2026-009" },
  { time: "2026-09-05T10:00:00Z", actor: "System", action: "Problem created from field report", outcome: "PRB-2026-014", target: "PRB-2026-014" },
  { time: "2026-09-04T11:20:00Z", actor: "F. Nnaji", action: "Recorded sampling results", outcome: "Success", target: "EVD-004" },
];

export function getProblemById(id) {
  return PROBLEMS.find((p) => p.id === id) || null;
}

export function getBusinessById(id) {
  return BUSINESSES.find((b) => b.id === id) || null;
}

export function getRegulationsByProblem(problem) {
  return problem.regulationIds
    .map((id) => REGULATIONS.find((r) => r.id === id))
    .filter(Boolean);
}

export function getBusinessesByProblem(problem) {
  return problem.affectedBusinessIds
    .map((id) => BUSINESSES.find((b) => b.id === id))
    .filter(Boolean);
}

export function getPoliciesByProblem(problem) {
  return problem.policyIds.map((id) => POLICIES.find((p) => p.id === id)).filter(Boolean);
}

export function getSolutionsByProblem(problem) {
  return problem.solutionIds.map((id) => SOLUTIONS.find((s) => s.id === id)).filter(Boolean);
}

export function getEvidenceByProblem(problem) {
  return EVIDENCE.filter((e) => e.problemId === problem.id);
}

export function problemStatusCounts() {
  const counts = { "Under Review": 0, Implemented: 0, "Pending Verification": 0, Resolved: 0 };
  PROBLEMS.forEach((p) => {
    if (counts[p.status] !== undefined) counts[p.status] += 1;
  });
  return counts;
}

export function problemPriorityCounts() {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  PROBLEMS.forEach((p) => {
    const { priority } = priorityFromScores(p.scores);
    const category = PRIORITY_META[priority].category;
    counts[category] += 1;
  });
  return counts;
}