import { useState } from "react";
import { Upload, Camera, Film, FileText, MapPin } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Button from "@/components/ui/Button";
import { bizApi } from "@/lib/api";

const CATEGORIES = [
  "Consumer Protection & Pricing",
  "Trade & Customs",
  "Environment",
  "Labour & Workplace",
  "Financial Systems",
  "Tax & Revenue",
  "Health & Safety",
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

export default function ReportProblemPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    severity: "",
    affectedPeople: "",
    affectedBusinesses: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    bizApi
      .createProblem({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        category: form.category || "General",
        severity: form.severity || "Medium",
      })
      .then(() => {
        setForm({ title: "", description: "", location: "", category: "", severity: "", affectedPeople: "", affectedBusinesses: "" });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      })
      .catch(() => {
        setError("Could not submit the problem. Please try again.");
        setTimeout(() => setError(""), 4000);
      });
  }

  return (
    <>
      <BusinessPageHeader
        eyebrow="Reporting"
        title="Report a Problem"
        description="Submit a regulatory problem with details, severity and evidence."
      />

      {submitted && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
          Problem submitted successfully. It has been added to My Problems.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Problem Details" className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Brief description of the problem"
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed description of the issue"
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Severity</label>
                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
                  >
                    <option value="">Select severity</option>
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Affected People</label>
                  <input
                    name="affectedPeople"
                    value={form.affectedPeople}
                    onChange={handleChange}
                    placeholder="Estimated count"
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Affected Businesses</label>
                  <input
                    name="affectedBusinesses"
                    value={form.affectedBusinesses}
                    onChange={handleChange}
                    placeholder="Estimated count"
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="Evidence">
              <div className="space-y-3">
                {[
                  { icon: Camera, label: "Photo", accept: "image/*" },
                  { icon: Film, label: "Video", accept: "video/*" },
                  { icon: FileText, label: "Document", accept: ".pdf,.doc,.docx" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.label}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line px-3 py-3 text-sm text-ink-subtle transition-colors hover:border-success/50 hover:bg-success-soft/30"
                    >
                      <Icon className="h-4 w-4 text-ink-faint" />
                      <span>{item.label}</span>
                      <input type="file" accept={item.accept} className="hidden" onChange={(e) => e.target.files} />
                      <Upload className="ml-auto h-3.5 w-3.5 text-ink-faint" />
                    </label>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="GPS Location">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-line px-3 py-3 text-sm text-ink-subtle transition-colors hover:border-success/50 hover:bg-success-soft/30"
              >
                <MapPin className="h-4 w-4 text-ink-faint" />
                <span>Capture GPS location</span>
              </button>
              <p className="mt-2 text-[11px] text-ink-faint">Attach current-generation GPS coordinates from your device.</p>
            </SectionCard>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" size="md">Cancel</Button>
          <Button type="submit" variant="primary" size="md">Submit Report</Button>
        </div>
      </form>
    </>
  );
}

ReportProblemPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};