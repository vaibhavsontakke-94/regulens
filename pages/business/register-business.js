import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Building2, Eye, ShieldCheck, Truck, Scale3d, FileBadge2, Sprout, TrendingUp } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import Button from "@/components/ui/Button";
import RegistrationStepper from "@/components/business/registration/RegistrationStepper";
import { Field, TextInput, AreaInput, SelectInput, ChipInput } from "@/components/business/registration/fields";
import {
  EMPTY_BUSINESS_PROFILE,
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
  TARGET_MARKETS,
} from "@/lib/businessProfileData";
import { useBusinessProfile } from "@/components/business/BusinessProfileContext";

const DRAFT_KEY = "regulens-business-register-draft";

const STEPS = [
  { key: "identity", label: "Business", icon: Building2 },
  { key: "location", label: "Location", icon: Scale3d },
  { key: "operations", label: "Operations", icon: Truck },
  { key: "scale", label: "Scale", icon: TrendingUp },
  { key: "compliance", label: "Compliance / Licenses", icon: ShieldCheck },
  { key: "environmental", label: "Environmental & Growth", icon: Sprout },
  { key: "review", label: "Review", icon: Eye },
];

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

const LICENSE_STATUSES = ["Active", "Pending", "Expiring Soon", "Expired"];
const EXPANSION_TIMELINES = ["In the next 3 months", "3–12 months", "1–2 years", "2–5 years", "Not yet decided"];

function summaryRow(label, value) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="shrink-0 text-xs uppercase tracking-wide text-ink-faint">{label}</span>
      <span className="text-right text-sm font-medium text-ink">
        {Array.isArray(value) ? value.join(", ") : value}
      </span>
    </div>
  );
}

function LicenseRow({ item, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border border-line bg-white p-3 dark:bg-ink-soft md:grid-cols-4">
      <Field label="License">
        <TextInput placeholder="e.g. Factory License" value={item.name} onChange={(v) => onChange({ ...item, name: v })} />
      </Field>
      <Field label="Issuing Authority">
        <TextInput placeholder="e.g. Ministry of Environment" value={item.authority} onChange={(v) => onChange({ ...item, authority: v })} />
      </Field>
      <Field label="Status">
        <SelectInput options={LICENSE_STATUSES} value={item.status} onChange={(v) => onChange({ ...item, status: v })} placeholder="Status" />
      </Field>
      <div className="flex items-end gap-2">
        <Field label="Expiry" className="flex-1">
          <TextInput type="date" value={item.expiry} onChange={(v) => onChange({ ...item, expiry: v })} />
        </Field>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove license"
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-ink-faint transition-colors hover:border-danger/40 hover:text-danger"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StepBusinessIdentity({ draft, patch }) {
  const subOptions = SUB_INDUSTRIES[draft.identity.industry] || [];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="Business Name" required className="md:col-span-2">
        <TextInput placeholder="e.g. Nortex Textiles Ltd" value={draft.identity.businessName} onChange={(v) => patch("identity", "businessName", v)} />
      </Field>
      <Field label="Legal / Registered Name">
        <TextInput placeholder="Registered legal name" value={draft.identity.legalName} onChange={(v) => patch("identity", "legalName", v)} />
      </Field>
      <Field label="Year Established">
        <TextInput type="number" placeholder="e.g. 2015" value={draft.identity.yearEstablished} onChange={(v) => patch("identity", "yearEstablished", v)} />
      </Field>
      <Field label="Business Type" required>
        <SelectInput options={BUSINESS_TYPES} value={draft.identity.businessType} onChange={(v) => patch("identity", "businessType", v)} placeholder="Select business type" />
      </Field>
      <Field label="Industry" required>
        <SelectInput
          options={INDUSTRIES}
          value={draft.identity.industry}
          onChange={(v) => patch("identity", "industry", v)}
        />
      </Field>
      {subOptions.length > 0 && (
        <Field label="Sub-Industry">
          <SelectInput options={subOptions} value={draft.identity.subIndustry} onChange={(v) => patch("identity", "subIndustry", v)} placeholder="Select sub-industry" />
        </Field>
      )}
      <Field label="Business Description" className="md:col-span-2">
        <AreaInput
          rows={3}
          placeholder="Tell us what your business does"
          value={draft.identity.description}
          onChange={(v) => patch("identity", "description", v)}
        />
      </Field>
    </div>
  );
}

function StepLocation({ draft, patch }) {
  const [newLoc, setNewLoc] = useState("");
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Field label="Primary City" required>
        <TextInput placeholder="e.g. Lagos" value={draft.location.primaryCity} onChange={(v) => patch("location", "primaryCity", v)} />
      </Field>
      <Field label="State" required>
        <SelectInput options={NIGERIA_STATES} value={draft.location.state} onChange={(v) => patch("location", "state", v)} placeholder="Select state" />
      </Field>
      <Field label="Country" required>
        <TextInput value={draft.location.country} onChange={(v) => patch("location", "country", v)} />
      </Field>
      <Field label="Additional Locations" className="md:col-span-3" hint="Add branches or operational sites.">
        <div className="flex items-center gap-2">
          <TextInput placeholder="e.g. Kano" value={newLoc} onChange={setNewLoc} />
          <Button
            variant="soft"
            size="sm"
            onClick={() => {
              if (newLoc.trim()) {
                patch("location", "additionalLocations", [...draft.location.additionalLocations, newLoc.trim()]);
                setNewLoc("");
              }
            }}
          >
            Add
          </Button>
        </div>
        {draft.location.additionalLocations.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {draft.location.additionalLocations.map((loc) => (
              <li key={loc} className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink">
                {loc}
              </li>
            ))}
          </ul>
        )}
      </Field>
    </div>
  );
}

function StepOperations({ draft, patch }) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <ChipInput
        label="Business Operations"
        options={OPERATION_AREAS}
        value={draft.operations.operations}
        onChange={(v) => patch("operations", "operations", v)}
        placeholder="eg. Manufacturing & Production"
      />
      <ChipInput
        label="Primary Products / Services"
        value={draft.operations.productsServices}
        onChange={(v) => patch("operations", "productsServices", v)}
        placeholder="e.g. Custom apparel, Uniforms"
      />
      <ChipInput
        label="Key Activities"
        value={draft.operations.primaryActivities}
        onChange={(v) => patch("operations", "primaryActivities", v)}
        placeholder="e.g. Fabric sourcing, Export processing"
      />
      <Field label="Operating Model">
        <SelectInput options={OPERATING_MODELS} value={draft.operations.operatingModel} onChange={(v) => patch("operations", "operatingModel", v)} placeholder="Select an operating model" />
      </Field>
    </div>
  );
}

function StepScale({ draft, patch }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Field label="Number of Employees" required>
        <SelectInput options={EMPLOYEE_RANGES} value={draft.scale.employees} onChange={(v) => patch("scale", "employees", v)} />
      </Field>
      <Field label="Business Stage" required>
        <SelectInput options={BUSINESS_STAGES} value={draft.scale.businessStage} onChange={(v) => patch("scale", "businessStage", v)} />
      </Field>
      <Field label="Annual Revenue Range">
        <SelectInput options={REVENUE_RANGES} value={draft.scale.revenueRange} onChange={(v) => patch("scale", "revenueRange", v)} />
      </Field>
    </div>
  );
}

function StepCompliance({ draft, patch }) {
  return (
    <div className="flex flex-col gap-5">
      <ChipInput
        label="Registrations Held"
        options={REGISTRATIONS}
        value={draft.compliance.registrations}
        onChange={(v) => patch("compliance", "registrations", v)}
        placeholder="Add your registrations"
      />
      <Field label="Licenses">
        <div className="flex flex-col gap-3">
          {draft.compliance.licenses.map((license) => (
            <LicenseRow
              key={license.id}
              item={license}
              onChange={(next) =>
                patch("compliance", "licenses", draft.compliance.licenses.map((l) => (l.id === license.id ? next : l)))
              }
              onRemove={() => patch("compliance", "licenses", draft.compliance.licenses.filter((l) => l.id !== license.id))}
            />
          ))}
          <Button
            variant="soft"
            size="sm"
            onClick={() =>
              patch("compliance", "licenses", [
                ...draft.compliance.licenses,
                { id: `lic-${Date.now()}`, name: "", authority: "", status: "", expiry: "" },
              ])
            }
          >
            + Add License
          </Button>
        </div>
      </Field>
    </div>
  );
}

function StepEnvironmentalGrowth({ draft, patch }) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Environmental Impact Profile">
          <SelectInput options={ENVIRONMENTAL_PROFILES} value={draft.environmental.environmentalProfile} onChange={(v) => patch("environmental", "environmentalProfile", v)} />
        </Field>
        <Field label="Import / Export">
          <SelectInput options={IMPORT_EXPORT} value={draft.environmental.importExport} onChange={(v) => patch("environmental", "importExport", v)} />
        </Field>
        <Field label="Data & Technology">
          <SelectInput options={DATA_TECHNOLOGY} value={draft.environmental.dataTechnology} onChange={(v) => patch("environmental", "dataTechnology", v)} />
        </Field>
      </div>
      <Field label="Special Requirements">
        <AreaInput rows={2} placeholder="e.g. Permits required, industrial zones, compliance obligations" value={draft.environmental.specialRequirements} onChange={(v) => patch("environmental", "specialRequirements", v)} />
      </Field>
      <div className="border-t border-line pt-4">
        <h3 className="mb-4 text-sm font-semibold text-ink">Growth & Expansion Plans</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Current Market">
            <TextInput placeholder="e.g. Lagos, Nigeria" value={draft.growth.currentMarket} onChange={(v) => patch("growth", "currentMarket", v)} />
          </Field>
          <Field label="Target Market">
            <SelectInput options={TARGET_MARKETS} value={draft.growth.targetMarket} onChange={(v) => patch("growth", "targetMarket", v)} placeholder="Select target market" />
          </Field>
          <Field label="Expansion Timeline">
            <SelectInput options={EXPANSION_TIMELINES} value={draft.growth.expansionTimeline} onChange={(v) => patch("growth", "expansionTimeline", v)} placeholder="Select timeline" />
          </Field>
        </div>
        <Field label="Expansion Plans" className="mt-4">
          <AreaInput rows={3} placeholder="Describe your expansion ambitions" value={draft.growth.expansionPlans} onChange={(v) => patch("growth", "expansionPlans", v)} />
        </Field>
      </div>
    </div>
  );
}

function StepReview({ draft, setDraft }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-line bg-white px-4 dark:bg-ink-soft">
        <div className="flex flex-wrap gap-x-6 gap-y-1 divide-y divide-line">
          {[
            ["Identity", "identity"],
            ["Location", "location"],
            ["Operations", "operations"],
            ["Scale", "scale"],
            ["Compliance", "compliance"],
            ["Environmental", "environmental"],
            ["Growth", "growth"],
          ].map(([sectionLabel, sectionKey]) => (
            <div key={sectionKey} className="w-full py-1">
              <p className="py-1 text-xs font-semibold uppercase tracking-wide text-primary">{sectionLabel}</p>
              <div className="divide-y divide-line">
                {Object.entries(draft[sectionKey]).map(([field, value]) => (
                  <div key={field} className="grid grid-cols-[180px_1fr] gap-2 py-1.5 text-sm">
                    <span className="text-xs capitalize text-ink-faint">{field.replace(/([A-Z])/g, " $1")}</span>
                    <span className="truncate text-xs font-medium text-ink">
                      {Array.isArray(value)
                        ? value.map((v) => (typeof v === "object" ? v.name : v)).filter(Boolean).join(", ") || "—"
                        : value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="rounded-md bg-primary-soft/50 px-3 py-2 text-xs text-primary">
        After creating your Business Profile, your REGULENS business intelligence — Dashboard, Health, Compliance, Risk, Growth and more — will be personalized to your business.
      </p>
    </div>
  );
}

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { setProfile } = useBusinessProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      setDraft(raw ? { ...EMPTY_BUSINESS_PROFILE, ...JSON.parse(raw) } : { ...EMPTY_BUSINESS_PROFILE });
    } catch {
      setDraft({ ...EMPTY_BUSINESS_PROFILE });
    }
  }, []);

  if (!draft) return null;

  function patch(section, field, value) {
    setDraft((d) => {
      const next = { ...d, [section]: { ...d[section], [field]: value } };
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function validateStep(index) {
    const sections = Object.keys(EMPTY_BUSINESS_PROFILE);
    const required = {
      0: ["businessName", "businessType", "industry"],
      1: ["primaryCity", "state", "country"],
      3: ["employees", "businessStage"],
      5: ["environmentalProfile"],
    }[index];
    if (!required) return true;
    return required.every((field) => {
      const value = draft[sections[index]]?.[field];
      return typeof value === "string" && value.trim() !== "";
    });
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function createProfile() {
    setSaving(true);
    setTimeout(() => {
      setProfile(draft);
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push("/business");
    }, 600);
  }

  const StepContent = [StepBusinessIdentity, StepLocation, StepOperations, StepScale, StepCompliance, StepEnvironmentalGrowth, StepReview][step];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <BusinessPageHeader
        eyebrow="Business Onboarding"
        title="Create Your Business Profile"
        description="Step-by-step registration that powers your REGULENS business intelligence."
      />

      <RegistrationStepper steps={STEPS} currentIndex={step} />

      <div className="rounded-lg border border-line bg-white p-6 shadow-sm dark:bg-ink-soft md:p-8">
        <div className="mb-6 flex items-center gap-3">
          {(() => {
            const Icon = STEPS[step].icon;
            return (
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-primary-soft/60 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            );
          })()}
          <div>
            <h2 className="text-base font-semibold text-ink">
              {STEPS[step].label}{" "}
              <span className="text-xs font-medium text-ink-faint">· Step {String(step + 1).padStart(2, "0")} of 07</span>
            </h2>
            <p className="text-xs text-ink-subtle">
              {step === 6 ? "Confirm your information before creating your profile." : "Fill in the details below."}
            </p>
          </div>
        </div>

        <StepContent draft={draft} patch={patch} setDraft={setDraft} />

        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 border-t border-line pt-5 sm:flex-row">
          <Button variant="ghost" size="lg" onClick={() => router.push("/business")}>
            Save as Draft & Exit
          </Button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button variant="outline" size="lg" onClick={goBack}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button size="lg" onClick={goNext}>
                Save & Continue
              </Button>
            ) : (
              <Button size="lg" loading={saving} onClick={createProfile}>
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Create Business Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

RegisterBusinessPage.getLayout = (page) => <BusinessLayout>{page}</BusinessLayout>;