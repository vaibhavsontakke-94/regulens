import { useEffect, useMemo, useState } from "react";
import { FileDown, FileText, Search } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import ActiveProblemIntro from "@/components/government/ui/ActiveProblemIntro";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { govApi } from "@/lib/api";
import { fmtDate } from "@/lib/format";

const TYPE_ICONS = { Investigation: "🔍", Verification: "✅", Analysis: "📊", "Quarterly Digest": "📑", "Policy Appraisal": "⚖️", Baseline: "📈" };

export default function ReportsPage() {
  const { problem } = useGovernmentProblem();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    govApi
      .reports()
      .then((data) => {
        if (active) setReports(data.reports || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
      return matchQ && (!status || r.status === status);
    });
  }, [reports, search, status]);

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Reports"
        description="Intelligence outputs ready for review or drafting, from the live workspace."
      />
      {problem && <ActiveProblemIntro problem={problem} />}

      {problem && problem.reports.length > 0 && (
        <div className="mb-6">
          <SectionCard title="Problem Intelligence Report" description="Draft report contextualized to the active problem.">
            {problem.reports.map((rep) => (
              <div key={rep.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{rep.title}</h3>
                  <Badge variant="neutral" size="sm">{rep.id}</Badge>
                  <Badge variant={rep.status === "Ready" ? "green" : "amber"} size="sm">{rep.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  Problem: {problem.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-subtle">{rep.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rep.sections.map((section) => (
                    <span key={section} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-subtle">
                      {section}
                    </span>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" href="/government/reports">
                    <FileText className="h-3.5 w-3.5" />
                    Open in report library
                  </Button>
                </div>
              </div>
            ))}
          </SectionCard>
        </div>
      )}
      <SectionCard title="Report library">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 basis-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports…"
              className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink">
            <option value="">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {list.map((r) => (
            <div key={r.id} className="flex flex-col rounded-[12px] border border-line p-4 transition-shadow hover:shadow-card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-surface-muted text-sm" aria-hidden="true">
                    {TYPE_ICONS[r.type] || <FileText className="h-5 w-5 text-ink-faint" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{r.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-faint">{r.type} · {r.id} · {fmtDate(r.date)}</p>
                  </div>
                </div>
                <Badge variant={r.status === "Ready" ? "green" : "amber"} size="sm">{r.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-subtle">{r.summary}</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-hover"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
          {!loading && list.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
              <FileText className="h-8 w-8 text-ink-faint" />
              <p className="text-sm text-ink-faint">No reports match your filters.</p>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-ink-faint">Report downloads are not yet wired to the report service.</p>
      </SectionCard>
    </>
  );
}

ReportsPage.getLayout = (page) => <GovernmentLayout title="Reports">{page}</GovernmentLayout>;