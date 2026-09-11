export const BUSINESS_PROFILE_KEY = "regulens-business-profile";

export const EMPTY_BUSINESS_PROFILE = {
  identity: {
    businessName: "",
    legalName: "",
    businessType: "",
    industry: "",
    subIndustry: "",
    description: "",
    yearEstablished: "",
  },
  location: {
    primaryCity: "",
    state: "",
    country: "Nigeria",
    additionalLocations: [],
  },
  operations: {
    operations: [],
    productsServices: [],
    primaryActivities: [],
    operatingModel: "",
  },
  scale: {
    employees: "",
    businessStage: "",
    revenueRange: "",
  },
  compliance: {
    licenses: [],
    certifications: [],
    registrations: [],
  },
  environmental: {
    environmentalProfile: "",
    importExport: "",
    dataTechnology: "",
    specialRequirements: "",
  },
  growth: {
    currentMarket: "",
    targetMarket: "",
    expansionPlans: "",
    expansionTimeline: "",
  },
};

export const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Limited Liability Company (LLC)",
  "Private Limited Company",
  "Public Limited Company",
  "Partnership",
  "Small Business",
  "Startup",
  "Foreign-Owned Local Entity",
  "Joint Venture",
];

export const INDUSTRIES = [
  "Agriculture & Agro-Allied",
  "Construction & Real Estate",
  "Education",
  "Energy & Utilities",
  "Financial Services",
  "Healthcare",
  "Information Technology",
  "Manufacturing",
  "Media & Entertainment",
  "Professional Services",
  "Retail & Consumer",
  "Telecommunications",
  "Textiles & Apparel",
  "Transportation & Logistics",
];

export const SUB_INDUSTRIES = {
  "Agriculture & Agro-Allied": ["Crop Production", "Livestock & Poultry", "Food Processing", "Agrochemicals", "Fisheries"],
  "Construction & Real Estate": ["Real Estate Development", "Civil Construction", "Building Materials", "Architecture & Design"],
  Education: ["Private Schools", "Vocational Training", "EdTech", "Consultancy"],
  "Energy & Utilities": ["Renewable Energy", "Power Distribution", "Oil & Gas Downstream", "Water Utilities", "Solar Installation"],
  "Financial Services": ["Microfinance", "Fintech", "Insurance", "Investment Advisory", "Payments"],
  Healthcare: ["Private Clinics", "Pharmaceuticals", "Diagnostics", "Health Insurance"],
  "Information Technology": ["Software Development", "IT Services", "Cybersecurity", "Cloud Services", "Data Analytics"],
  Manufacturing: ["Consumer Goods", "Industrial Components", "Packaging", "Textiles"],
  "Media & Entertainment": ["Content Production", "Publishing", "Digital Media", "Event Management"],
  "Professional Services": ["Legal", "Accounting & Tax", "Management Consulting", "Market Research"],
  "Retail & Consumer": ["Retail Chains", "E-Commerce", "FMCG Distribution", "Fashion & Apparel"],
  Telecommunications: ["ISP / WISP", "Infrastructure Sharing", "Value-Added Services"],
  "Textiles & Apparel": ["Garment Manufacturing", "Textile Export", "Apparel Retail"],
  "Transportation & Logistics": ["Freight & Haulage", "Last-Mile Delivery", "Warehousing", "Ride-Hailing"],
};

export const OPERATING_MODELS = [
  "Owned Facilities",
  "Leased Facilities",
  "Franchised",
  "Licensed Production",
  "Third-Party Outsourced",
  "Hybrid",
];

export const OPERATION_AREAS = [
  "Manufacturing / Production",
  "Domestic Trade",
  "International Trade",
  "Distribution & Logistics",
  "Retail & E-Commerce",
  "Professional Services",
  "Facility Operations",
  "Research & Development",
];

export const EMPLOYEE_RANGES = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,000+"];

export const BUSINESS_STAGES = [
  "Pre-Launch",
  "Early Stage (0–2 years)",
  "Growth Stage (2–5 years)",
  "Established (5–10 years)",
  "Mature (10+ years)",
];

export const REVENUE_RANGES = [
  "Under ₦25 million",
  "₦25M – ₦100M",
  "₦100M – ₦500M",
  "₦500M – ₦1B",
  "₦1B – ₦5B",
  "Above ₦5B",
];

export const ENVIRONMENTAL_PROFILES = [
  "Nil / Minimal",
  "Low Impact",
  "Moderate",
  "Significant",
  "High Impact Industries",
];

export const IMPORT_EXPORT = ["None", "Importer", "Exporter", "Both Importer & Exporter"];

export const DATA_TECHNOLOGY = [
  "None / Manual",
  "Basic Digital / Accounting Software",
  "Moderate (ERP / CRM)",
  "Advanced (Integrated Systems)",
  "Data-Heavy / High-Tech",
];

export const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const LICENSE_STATUSES = ["Active", "Pending", "Expiring Soon", "Expired"];

export const TARGET_MARKETS = [
  "Domestic — Same State",
  "Domestic — Other States",
  "Economic Zone (e.g., Lekki Free Zone, Abuja SEZ)",
  "West Africa (ECOWAS)",
  "Sub-Saharan Africa",
  "Middle East & North Africa",
  "Europe",
  "North America",
  "Asia",
];

export const PROFILE_SECTIONS = [
  { key: "identity", label: "Business Identity", short: "Identity" },
  { key: "location", label: "Location", short: "Location" },
  { key: "operations", label: "Operations", short: "Operations" },
  { key: "scale", label: "Business Scale", short: "Scale" },
  { key: "compliance", label: "Compliance & Licenses", short: "Compliance" },
  { key: "environmental", label: "Environmental Profile", short: "Environmental" },
  { key: "growth", label: "Growth & Expansion", short: "Growth" },
];

export const REQUIRED_PROFILE_FIELDS = {
  identity: ["businessName", "businessType", "industry"],
  location: ["primaryCity", "state", "country"],
  operations: ["operations"],
  scale: ["employees", "businessStage"],
  compliance: ["registrations"],
  environmental: ["environmentalProfile", "importExport"],
  growth: ["currentMarket", "targetMarket"],
};

export function computeProfileCompletion(profile) {
  if (!profile) return 0;
  const sections = Object.keys(REQUIRED_PROFILE_FIELDS);
  let filledSections = 0;
  for (const section of sections) {
    const required = REQUIRED_PROFILE_FIELDS[section];
    const isFilled = required.every((field) => {
      const value = profile[section]?.[field];
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === "string" && value.trim() !== "";
    });
    if (isFilled) filledSections += 1;
  }
  return Math.round((filledSections / sections.length) * 100);
}