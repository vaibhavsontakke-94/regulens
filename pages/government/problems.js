import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Plus, Search } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SEVERITY_META, STATUS_META, PRIORITY_META, priorityFromScores } from "@/lib/mockData";
import { govApi, handleApiError } from "@/lib/api";
import { fmtFullNumber, fmtDate } from "@/lib/format";

export default function ProblemsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    govApi
      .listProblems({ q: search, severity, status })
      .then((data) => {
        if (!active) return;
        setProblems(data.problems || []);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(handleApiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, severity, status]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter((p) => {
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchS = !severity || p.severity === severity;
      const matchT = !status || p.status === status;
      return matchQ && matchS && matchT;
    });
  }, [problems, search, severity, status]);

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Problems"
        description="All tracked regulatory problems, from the live workspace database."
        actions={
          <Button size="sm" onClick={() => router.push("/government/problems/new")}>
            <Plus className="h-4 w-4" />
            Post a Problem
          </Button>
        }
      />
      <SectionCard>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 basis-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, category, location or problem ID…"
              className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
            />
          </div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink"
          >
            <option value="">All severity</option>
            {["Critical", "High", "Medium", "Low"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink"
          >
            <option value="">All statuses</option>
            {["Under Review", "Implemented", "Pending Verification", "Resolved"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-xs text-ink-faint">
            {loading ? "Loading…" : `${filtered.length} problem(s)`}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-[10px] border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" role="status" aria-label="Loading" />
          </div>
        ) : (

        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold sm:px-5">Problem</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Category</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Location</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Severity</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Businesses</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Status</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Priority</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => {
                const { priority } = priorityFromScores(p.scores);
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer transition-colors hover:bg-surface-muted"
                    onClick={() => router.push(`/government/problems/${p.id}`)}
                  >
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 sm:px-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-ink">{p.title}</span>
                        <span className="text-xs text-ink-faint">{p.id}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{p.category}</td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{p.location}</td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={SEVERITY_META[p.severity].variant} size="sm" dot>
                        {p.severity}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink">{fmtFullNumber(p.businessesAffected)}</td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={STATUS_META[p.status]?.variant || "neutral"} size="sm">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={PRIORITY_META[priority].variant} size="sm">{PRIORITY_META[priority].short}</Badge>
                    </td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-faint">{fmtDate(p.updated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-ink-faint">No problems match your filters.</div>
          )}
        </div>
        )}
      </SectionCard>
    </>
  );
}

ProblemsPage.getLayout = (page) => <GovernmentLayout title="Problems">{page}</GovernmentLayout>;