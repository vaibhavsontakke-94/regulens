import { useState } from "react";
import { useRouter } from "next/router";
import { Building2, MapPin, Truck, TrendingUp, ShieldCheck, Sprout, CloudSun, ArrowRight, BadgeCheck } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import BusinessProfileSection from "@/components/business/profile/BusinessProfileSection";
import ProgressBar from "@/components/business/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { useBusinessProfile } from "@/components/business/BusinessProfileContext";
import { Field, TextInput, AreaInput, SelectInput, ChipInput } from "@/components/business/registration/fields";
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
  TARGET_MARKETS,
  LICENSE_STATUSES,
} from "@/lib/businessProfileData";

function ProfileRow({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="shrink-0 text-xs uppercase tracking-wide text-ink-faint">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

function joinList(value) {
  if (!value || value.length === 0) return <span className="text-ink-faint">—</span>;
  return value.map((v) => (typeof v === "object" ? v.name : v)).filter(Boolean).join(", ") || <span className="text-ink-faint">—</span>;
}

function useSectionEditor(section) {
  const { profile, setProfile } = useBusinessProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  function start() {
    setForm(JSON.parse(JSON.stringify(profile[section] || {})));
    setEditing(true);
  }
  function save() {
    setProfile({ ...profile, [section]: form });
    setEditing(false);
    setForm(null);
  }
  function cancel() {
    setEditing(false);
    setForm(null);
  }

  return {
    editing,
    form: form || profile[section] || {},
    start,
    save,
    cancel,
    setForm,
    patch: (field, value) => setForm((prev) => ({ ...prev, [field]: value })),
  };
}

function IdentitySection() {
  const editor = useSectionEditor("identity");
  const value = editor.form;
  const options = SUB_INDUSTRIES[value.industry] || [];
  return (
    <BusinessProfileSection
      title="Business Identity"
      icon={Building2}
      editable
      editing={editor.editing}
      onStartEdit={editor.start}
      onSave={editor.save}
      onCancel={editor.cancel}
    >
      {editor.editing ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Business Name" required><TextInput value={value.businessName} onChange={(v) => editor.patch("businessName", v)} /></Field>
          <Field label="Legal / Registered Name"><TextInput value={value.legalName} onChange={(v) => editor.patch("legalName", v)} /></Field>
          <Field label="Business Type" required><SelectInput options={BUSINESS_TYPES} value={value.businessType} onChange={(v) => editor.patch("businessType", v)} /></Field>
          <Field label="Industry" required><SelectInput options={INDUSTRIES} value={value.industry} onChange={(v) => editor.patch("industry", v)} /></Field>
          {options.length > 0 && (
            <Field label="Sub-Industry"><SelectInput options={options} value={value.subIndustry} onChange={(v) => editor.patch("subIndustry", v)} /></Field>
          )}
          <Field label="Year Established"><TextInput value={value.yearEstablished} onChange={(v) => editor.patch("yearEstablished", v)} /></Field>
          <Field label="Description" className="md:col-span-2"><AreaInput rows={3} value={value.description} onChange={(v) => editor.patch("description", v)} /></Field>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <ProfileRow label="Business Name">{value.businessName || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Legal Name">{value.legalName || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Business Type">{value.businessType || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Industry">{value.industry || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Sub-Industry">{value.subIndustry || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Year Established">{value.yearEstablished || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Description">{value.description || <span className="text-ink-faint">—</span>}</ProfileRow>
        </div>
      )}
    </BusinessProfileSection>
  );
}

function LocationSection() {
  const editor = useSectionEditor("location");
  const value = editor.form;
  return (
    <BusinessProfileSection
      title="Location"
      icon={MapPin}
      editable
      editing={editor.editing}
      onStartEdit={editor.start}
      onSave={editor.save}
      onCancel={editor.cancel}
    >
      {editor.editing ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Primary City" required><TextInput value={value.primaryCity} onChange={(v) => editor.patch("primaryCity", v)} /></Field>
          <Field label="State" required><SelectInput options={NIGERIA_STATES} value={value.state} onChange={(v) => editor.patch("state", v)} /></Field>
          <Field label="Country" required><TextInput value={value.country} onChange={(v) => editor.patch("country", v)} /></Field>
          <Field label="Additional Locations" className="md:col-span-3">
            <ChipInput value={value.additionalLocations} onChange={(v) => editor.patch("additionalLocations", v)} placeholder="e.g. Kano" />
          </Field>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <ProfileRow label="Primary City">{value.primaryCity || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="State">{value.state || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Country">{value.country || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Additional Locations">{joinList(value.additionalLocations)}</ProfileRow>
        </div>
      )}
    </BusinessProfileSection>
  );
}

function OperationsSection() {
  const editor = useSectionEditor("operations");
  const value = editor.form;
  return (
    <BusinessProfileSection
      title="Operations"
      icon={Truck}
      editable
      editing={editor.editing}
      onStartEdit={editor.start}
      onSave={editor.save}
      onCancel={editor.cancel}
    >
      {editor.editing ? (
        <div className="grid grid-cols-1 gap-4">
          <ChipInput label="Business Operations" options={OPERATION_AREAS} value={value.operations} onChange={(v) => editor.patch("operations", v)} />
          <ChipInput label="Products / Services" value={value.productsServices} onChange={(v) => editor.patch("productsServices", v)} />
          <ChipInput label="Key Activities" value={value.primaryActivities} onChange={(v) => editor.patch("primaryActivities", v)} />
          <Field label="Operating Model"><SelectInput options={OPERATING_MODELS} value={value.operatingModel} onChange={(v) => editor.patch("operatingModel", v)} /></Field>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <ProfileRow label="Operations">{joinList(value.operations)}</ProfileRow>
          <ProfileRow label="Products / Services">{joinList(value.productsServices)}</ProfileRow>
          <ProfileRow label="Key Activities">{joinList(value.primaryActivities)}</ProfileRow>
          <ProfileRow label="Operating Model">{value.operatingModel || <span className="text-ink-faint">—</span>}</ProfileRow>
        </div>
      )}
    </BusinessProfileSection>
  );
}

function ScaleSection() {
  const editor = useSectionEditor("scale");
  const value = editor.form;
  return (
    <BusinessProfileSection
      title="Business Scale"
      icon={TrendingUp}
      editable
      editing={editor.editing}
      onStartEdit={editor.start}
      onSave={editor.save}
      onCancel={editor.cancel}
    >
      {editor.editing ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Employees" required><SelectInput options={EMPLOYEE_RANGES} value={value.employees} onChange={(v) => editor.patch("employees", v)} /></Field>
          <Field label="Stage" required><SelectInput options={BUSINESS_STAGES} value={value.businessStage} onChange={(v) => editor.patch("businessStage", v)} /></Field>
          <Field label="Revenue Range"><SelectInput options={REVENUE_RANGES} value={value.revenueRange} onChange={(v) => editor.patch("revenueRange", v)} /></Field>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <ProfileRow label="Employees">{value.employees || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Stage">{value.businessStage || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Revenue Range">{value.revenueRange || <span className="text-ink-faint">—</span>}</ProfileRow>
        </div>
      )}
    </BusinessProfileSection>
  );
}

function ComplianceSection() {
  const editor = useSectionEditor("compliance");
  const value = editor.form;
  const licenseNames = value.licenses?.map((l) => l.name).filter(Boolean) || [];
  return (
    <BusinessProfileSection
      title="Compliance & Licenses"
      icon={ShieldCheck}
      editable
      editing={editor.editing}
      onStartEdit={editor.start}
      onSave={editor.save}
      onCancel={editor.cancel}
    >
      {editor.editing ? (
        <div className="grid grid-cols-1 gap-4">
          <ChipInput label="Registrations" value={value.registrations} onChange={(v) => editor.patch("registrations", v)} placeholder="e.g. CAC Registration" />
          <Field label="Licenses">
            {value.licenses?.map((license) => (
              <div key={license.id} className="mb-2 flex flex-col gap-3 rounded-md border border-line bg-white p-3 dark:bg-ink-soft md:flex-row">
                <TextInput placeholder="License" value={license.name} onChange={(v) => editor.patch("licenses", value.licenses.map((l) => (l.id === license.id ? { ...l, name: v } : l)))} />
                <TextInput placeholder="Authority" value={license.authority} onChange={(v) => editor.patch("licenses", value.licenses.map((l) => (l.id === license.id ? { ...l, authority: v } : l)))} />
                <SelectInput options={LICENSE_STATUSES} value={license.status} onChange={(v) => editor.patch("licenses", value.licenses.map((l) => (l.id === license.id ? { ...l, status: v } : l)))} />
              </div>
            ))}
            <Button variant="soft" size="sm" onClick={() => editor.patch("licenses", [...(value.licenses || []), { id: `lic-${Date.now()}`, name: "", authority: "", status: "", expiry: "" }])}>+ Add License</Button>
          </Field>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <ProfileRow label="Registrations">{joinList(value.registrations)}</ProfileRow>
          <ProfileRow label="Licenses">
            {licenseNames.length > 0 ? licenseNames.join(", ") : <span className="text-ink-faint">—</span>}
          </ProfileRow>
        </div>
      )}
    </BusinessProfileSection>
  );
}

function EnvironmentalSection() {
  const editor = useSectionEditor("environmental");
  const value = editor.form;
  return (
    <BusinessProfileSection
      title="Environmental Profile"
      icon={CloudSun}
      editable
      editing={editor.editing}
      onStartEdit={editor.start}
      onSave={editor.save}
      onCancel={editor.cancel}
    >
      {editor.editing ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Impact Profile"><SelectInput options={ENVIRONMENTAL_PROFILES} value={value.environmentalProfile} onChange={(v) => editor.patch("environmentalProfile", v)} /></Field>
            <Field label="Import / Export"><SelectInput options={IMPORT_EXPORT} value={value.importExport} onChange={(v) => editor.patch("importExport", v)} /></Field>
            <Field label="Data & Technology"><SelectInput options={DATA_TECHNOLOGY} value={value.dataTechnology} onChange={(v) => editor.patch("dataTechnology", v)} /></Field>
          </div>
          <Field label="Special Requirements"><AreaInput rows={2} value={value.specialRequirements} onChange={(v) => editor.patch("specialRequirements", v)} /></Field>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <ProfileRow label="Impact Profile">{value.environmentalProfile || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Import / Export">{value.importExport || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Data & Technology">{value.dataTechnology || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Special Requirements">{value.specialRequirements || <span className="text-ink-faint">—</span>}</ProfileRow>
        </div>
      )}
    </BusinessProfileSection>
  );
}

function GrowthSection() {
  const editor = useSectionEditor("growth");
  const value = editor.form;
  return (
    <BusinessProfileSection
      title="Growth & Expansion"
      icon={Sprout}
      editable
      editing={editor.editing}
      onStartEdit={editor.start}
      onSave={editor.save}
      onCancel={editor.cancel}
    >
      {editor.editing ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Current Market"><TextInput value={value.currentMarket} onChange={(v) => editor.patch("currentMarket", v)} /></Field>
            <Field label="Target Market"><SelectInput options={TARGET_MARKETS} value={value.targetMarket} onChange={(v) => editor.patch("targetMarket", v)} /></Field>
            <Field label="Timeline"><TextInput value={value.expansionTimeline} onChange={(v) => editor.patch("expansionTimeline", v)} /></Field>
          </div>
          <Field label="Expansion Plans"><AreaInput rows={3} value={value.expansionPlans} onChange={(v) => editor.patch("expansionPlans", v)} /></Field>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <ProfileRow label="Current Market">{value.currentMarket || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Target Market">{value.targetMarket || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Timeline">{value.expansionTimeline || <span className="text-ink-faint">—</span>}</ProfileRow>
          <ProfileRow label="Expansion Plans">{value.expansionPlans || <span className="text-ink-faint">—</span>}</ProfileRow>
        </div>
      )}
    </BusinessProfileSection>
  );
}

export default function BusinessProfilePage() {
  const router = useRouter();
  const { profile, display, completion, isRegistered } = useBusinessProfile();

  return (
    <>
      <BusinessPageHeader
        eyebrow="Business Profile"
        title="Business Profile"
        description="Your business information powers REGULENS business intelligence."
      />

      {!isRegistered ? (
        <SectionCard className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-primary-soft/60 text-primary">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-ink">Complete your Business Registration</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-subtle">
              Create your Business Profile in a few steps to personalize your Dashboard, Health, Compliance, Risk and Growth intelligence.
            </p>
          </div>
          <Button size="lg" onClick={() => router.push("/business/register-business")}>
            Create Business Profile <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <p className="text-xs text-ink-faint">Profile completion: 0%</p>
        </SectionCard>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-line bg-white p-5 dark:bg-ink-soft lg:col-span-2">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-ink">{display.name}</h2>
                  <p className="truncate text-sm text-ink-subtle">
                    {[display.type, display.industry, [display.city, display.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <BadgeCheck className="h-4 w-4 text-success" aria-hidden="true" />
                <span className="text-xs text-ink-subtle">Profile saved locally and used across all REGULENS modules.</span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2 rounded-lg border border-line bg-white p-5 dark:bg-ink-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink">Profile completion</span>
                <span className="text-sm font-semibold text-ink">{completion}%</span>
              </div>
              <ProgressBar value={completion} />
              {completion >= 100 ? (
                <p className="text-xs text-success">All required sections are complete.</p>
              ) : (
                <p className="text-xs text-ink-subtle">Complete the remaining sections to unlock deeper intelligence.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <IdentitySection />
            <LocationSection />
            <OperationsSection />
            <ScaleSection />
            <ComplianceSection />
            <EnvironmentalSection />
            <GrowthSection />
          </div>
        </>
      )}
    </>
  );
}

BusinessProfilePage.getLayout = (page) => <BusinessLayout>{page}</BusinessLayout>;