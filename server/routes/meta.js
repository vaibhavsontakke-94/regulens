import { ok, methodNotAllowed } from "../http.js";
import { ROLES } from "../../components/auth/roles.js";
import {
  BUSINESS_TYPES,
  INDUSTRIES,
  SUB_INDUSTRIES,
  OPERATING_MODELS,
  OPERATION_AREAS,
  EMPLOYEE_RANGES,
  BUSINESS_STAGES,
  REVENUE_RANGES,
  ENVIRONMENTAL_PROFILES,
  IMPORT_EXPORT,
  DATA_TECHNOLOGY,
  NIGERIA_STATES,
  LICENSE_STATUSES,
  TARGET_MARKETS,
  PROFILE_SECTIONS,
} from "../../lib/businessProfileData.js";
import {
  SEVERITY_META,
  STATUS_META,
  PRIORITY_META,
  PRIORITY_FACTORS,
} from "../../lib/mockData.js";
import { PROBLEM_LIFECYCLE as GOV_LIFECYCLE } from "../../lib/problemIntelligence.js";
import { PROBLEM_LIFECYCLE as BIZ_LIFECYCLE } from "../../lib/businessData.js";

const GOV_CATEGORIES = [
  "Consumer Protection & Pricing",
  "Energy Regulation",
  "Digital & Data Governance",
  "Food Safety",
  "Labour & Workplace",
  "Trade & Customs",
  "Financial Systems",
  "Health & Safety",
  "Environment",
  "Insurance Regulation",
];

const GOV_LOCATIONS = [
  "Kano",
  "Kaduna",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Ogun",
  "Onne",
  "Enugu",
  "Plateau",
  "Federal (National)",
];

const GOV_SEVERITIES = ["Critical", "High", "Medium", "Low"];

const GOV_STATUSES = ["Under Review", "Implemented", "Pending Verification", "Resolved"];

const REGISTRATIONS = [
  "CAC Registration",
  "TIN (Tax Identification)",
  "VAT Registration",
  "PENCOM",
  "NSITF",
  "ITF Levy",
  "Factory License",
  "NAFDAC",
  "SON",
  "NESREA",
];

const BIZ_PROBLEM_STATUSES = [
  "REPORTED", "ANALYZING", "SOLUTION PROPOSED", "UNDER REVIEW", "APPROVED",
  "IN PROGRESS", "IMPLEMENTED", "VERIFICATION PENDING", "VERIFIED", "RESOLVED", "REOPENED",
];

const BIZ_EVIDENCE_TYPES = ["Photo", "Document", "Video", "Inspection"];

export default function metaRoutes(req, res, sub) {
  if (req.method !== "GET") return methodNotAllowed(res);
  if (sub[0] && sub[0] !== "options" && sub[0] !== "") return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Unknown meta endpoint." } });
  return ok(res, {
    auth: { roles: ROLES },
    government: {
      categories: GOV_CATEGORIES,
      locations: GOV_LOCATIONS,
      severities: GOV_SEVERITIES,
      statuses: GOV_STATUSES,
      lifecycle: GOV_LIFECYCLE,
      severityMeta: SEVERITY_META,
      statusMeta: STATUS_META,
      priorityMeta: PRIORITY_META,
      priorityFactors: PRIORITY_FACTORS,
    },
    business: {
      businessTypes: BUSINESS_TYPES,
      industries: INDUSTRIES,
      subIndustries: SUB_INDUSTRIES,
      operatingModels: OPERATING_MODELS,
      operationAreas: OPERATION_AREAS,
      employeeRanges: EMPLOYEE_RANGES,
      businessStages: BUSINESS_STAGES,
      revenueRanges: REVENUE_RANGES,
      environmentalProfiles: ENVIRONMENTAL_PROFILES,
      importExport: IMPORT_EXPORT,
      dataTechnology: DATA_TECHNOLOGY,
      states: NIGERIA_STATES,
      licenseStatuses: LICENSE_STATUSES,
      targetMarkets: TARGET_MARKETS,
      registrations: REGISTRATIONS,
      profileSections: PROFILE_SECTIONS,
      lifecycle: BIZ_LIFECYCLE,
      problemStatuses: BIZ_PROBLEM_STATUSES,
      evidenceTypes: BIZ_EVIDENCE_TYPES,
      expansionTimelines: ["In the next 3 months", "3–12 months", "1–2 years", "2–5 years", "Not yet decided"],
    },
  });
}