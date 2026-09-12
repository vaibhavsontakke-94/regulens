import { useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle2, Send } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Button from "@/components/ui/Button";
import { isEmail, isEmpty, requiredError } from "@/lib/validators";
import { govApi, handleApiError } from "@/lib/api";

const CATEGORIES = [
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

const LOCATIONS = [
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

const SEVERITIES = ["Critical", "High", "Medium", "Low"];

const FIELD_BASE =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60";

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-ink-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export default function NewProblemPage() {
  const router = useRouter();
  const [values, setValues] = useState({
    title: "",
    category: CATEGORIES[0],
    location: LOCATIONS[0],
    severity: "Medium",
    reporterEmail: "",
    summary: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdProblem, setCreatedProblem] = useState(null);

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function validate() {
    const next = {};
    if (isEmpty(values.title)) next.title = requiredError("title");
    if (!isEmail(values.reporterEmail)) next.reporterEmail = "Enter a valid email address.";
    if (isEmpty(values.summary)) next.summary = requiredError("summary");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setFormError("");
    try {
      const data = await govApi.createProblem(values);
      setCreatedProblem(data.problem);
      setSubmitted(true);
    } catch (err) {
      setFormError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <>
        <PageHeader
          eyebrow="Government Intelligence"
          title="Post a Problem"
          description="The submitted problem enters the ANALYSIS pipeline for prioritisation."
        />
        <SectionCard>
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink">Problem submitted</h2>
              <p className="mt-1 max-w-md text-sm text-ink-subtle">
                &quot;{values.title}&quot; has been recorded as{" "}
                <span className="font-semibold text-ink">{createdProblem?.id}</span> against the {values.category} category
                in {values.location}. It has entered the ANALYSIS pipeline for prioritisation.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                Submit another
              </Button>
              <Button size="sm" onClick={() => router.push(`/government/problems/${createdProblem?.id}`)}>
                View problem
              </Button>
            </div>
          </div>
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Post a Problem"
        description="Register a regulatory problem for prioritisation analysis."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Problem details" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Problem title" error={errors.title}>
              <input
                type="text"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Retail price transparency for essential goods"
                className={FIELD_BASE}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select value={values.category} onChange={(e) => set("category", e.target.value)} className={FIELD_BASE}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Primary location">
                <select value={values.location} onChange={(e) => set("location", e.target.value)} className={FIELD_BASE}>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Initial severity" hint="Initial estimate, refined during analysis">
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("severity", s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      values.severity === s
                        ? "border-primary bg-primary text-primary-text"
                        : "border-line bg-surface text-ink-subtle hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Reporter email" hint="For verification workflows" error={errors.reporterEmail}>
              <input
                type="email"
                value={values.reporterEmail}
                onChange={(e) => set("reporterEmail", e.target.value)}
                placeholder="you@{authority}.gov.ng"
                className={FIELD_BASE}
              />
            </Field>

            <Field label="Summary" hint="Description of the problem" error={errors.summary}>
              <textarea
                value={values.summary}
                onChange={(e) => set("summary", e.target.value)}
                rows={4}
                placeholder="Describe the problem, affected groups and any known impact…"
                className={`${FIELD_BASE} resize-y`}
              />
            </Field>

            {formError && (
              <p role="alert" className="rounded-[10px] border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
              <Button variant="outline" size="md" onClick={() => router.push("/government/problems")}>
                Cancel
              </Button>
              <Button type="submit" size="md" loading={loading}>
                <Send className="h-4 w-4" />
                Submit problem
              </Button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="What happens next">
            <ol className="list-decimal space-y-2 pl-4 text-sm text-ink-subtle">
              <li>Problem is recorded against its category and location.</li>
              <li>Severity and business-matching signals are applied.</li>
              <li>A priority score is computed from the recorded factors.</li>
              <li>Recommended regulations, policies and solutions are associated.</li>
              <li>The problem enters the verification pipeline.</li>
            </ol>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

NewProblemPage.getLayout = (page) => <GovernmentLayout title="Post a Problem">{page}</GovernmentLayout>;