import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { REGULATORY_UPDATES } from "@/lib/businessData";
import { fmtDate } from "@/lib/format";

const IMPACT_VARIANTS = {
  High: "red",
  Medium: "amber",
  Low: "green",
};

const STATUS_VARIANTS = {
  Enacted: "green",
  Upcoming: "blue",
};

export default function RegulatoryIntelligencePage() {
  return (
    <>
      <BusinessPageHeader
        eyebrow="Intelligence"
        title="Regulatory Intelligence"
        description="Track regulatory updates, changes and their impact on your business areas."
      />

      <div className="mb-6 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
        <strong>Demo data.</strong> All regulatory updates are illustrative only.
      </div>

      <div className="mb-6 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Total Updates</span>
          <span className="text-2xl font-semibold text-ink">{REGULATORY_UPDATES.length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">High Impact</span>
          <span className="text-2xl font-semibold text-danger">{REGULATORY_UPDATES.filter((r) => r.impact === "High").length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Enacted</span>
          <span className="text-2xl font-semibold text-success">{REGULATORY_UPDATES.filter((r) => r.status === "Enacted").length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Upcoming</span>
          <span className="text-2xl font-semibold text-primary">{REGULATORY_UPDATES.filter((r) => r.status === "Upcoming").length}</span>
        </div>
      </div>

      <SectionCard title="Regulatory Updates" description={`${REGULATORY_UPDATES.length} updates tracked`}>
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold sm:px-5">Regulation</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Authority</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Jurisdiction</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Effective Date</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Impact</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Business Areas</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Action Required</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {REGULATORY_UPDATES.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-muted">
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    <span className="font-medium text-ink">{r.regulation}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{r.authority}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{r.jurisdiction}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-faint">{fmtDate(r.effectiveDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={IMPACT_VARIANTS[r.impact] || "neutral"} size="sm">{r.impact}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{r.businessAreas}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{r.actionRequired}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[r.status] || "neutral"} size="sm">{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

RegulatoryIntelligencePage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};