import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { useWorkspace } from "@/components/business/WorkspaceContext";
import { fmtDate } from "@/lib/format";

const STATUS_VARIANTS = {
  Ready: "green",
  Draft: "amber",
};

const TYPE_VARIANTS = {
  Readiness: "blue",
  Intelligence: "green",
  Expansion: "amber",
  Risk: "red",
  Schemes: "blue",
};

export default function ReportsPage() {
  const { data } = useWorkspace();
  const BIZ_REPORTS = data.reports || [];
  const ready = BIZ_REPORTS.filter((r) => r.status === "Ready").length;

  return (
    <>
      <BusinessPageHeader
        eyebrow="Reporting"
        title="Reports"
        description="View, preview and download regulatory and compliance reports."
      />

      <div className="mb-6 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Total</span>
          <span className="text-2xl font-semibold text-ink">{BIZ_REPORTS.length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Ready</span>
          <span className="text-2xl font-semibold text-success">{ready}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Draft</span>
          <span className="text-2xl font-semibold text-warning">{BIZ_REPORTS.length - ready}</span>
        </div>
      </div>

      <SectionCard title="Reports" description={`${BIZ_REPORTS.length} reports available`}>
        <div className="space-y-3">
          {BIZ_REPORTS.map((r) => (
            <div key={r.id} className="rounded-lg border border-line px-4 py-3.5 transition-colors hover:bg-surface-muted">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{r.title}</h3>
                    <Badge variant={STATUS_VARIANTS[r.status] || "neutral"} size="sm">{r.status}</Badge>
                    <Badge variant={TYPE_VARIANTS[r.type] || "neutral"} size="sm">{r.type}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">{r.summary}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">Generated {fmtDate(r.date)} · {r.id}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Report Preview" description="Select a report above to preview" className="mt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-card bg-surface-muted text-ink-faint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm text-ink-faint">No report selected for preview</p>
          <p className="mt-1 text-xs text-ink-faint">Click "Preview" on any report to see it here</p>
        </div>
      </SectionCard>
    </>
  );
}

ReportsPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};