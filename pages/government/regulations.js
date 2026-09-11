import { useMemo, useState } from "react";
import { Scale, Search } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import ActiveProblemIntro from "@/components/government/ui/ActiveProblemIntro";
import Badge from "@/components/ui/Badge";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { REGULATIONS } from "@/lib/mockData";
import { fmtDate } from "@/lib/format";

export default function RegulationsPage() {
  const { problem } = useGovernmentProblem();
  const [search, setSearch] = useState("");
  const [impact, setImpact] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REGULATIONS.filter((r) => {
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.authority.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      return matchQ && (!impact || r.impact === impact);
    });
  }, [search, impact]);

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Regulations"
        description="Regulations tracked and linked to problems. Illustrative demo records."
      />
      {problem && <ActiveProblemIntro problem={problem} />}

      {problem && problem.regulations.length > 0 && (
        <div className="mb-6">
          <SectionCard
            title="Regulations relevant to this problem"
            description={`Illustrative mock regulations linked to the active problem (${problem.id}). Demo records only — not official instruments.`}
          >
            <ul className="space-y-3">
              {problem.regulations.map((reg) => (
                <li
                  key={reg.id}
                  className="flex flex-col gap-2 rounded-[10px] border border-line p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{reg.title}</p>
                      <Badge variant={reg.relevance === "High" ? "red" : "amber"} size="sm">
                        {reg.relevance} relevance
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{reg.description}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {reg.affectedSector} · {reg.jurisdiction} · {reg.id}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={reg.status === "Active" ? "green" : "blue"} size="sm">{reg.status}</Badge>
                    <span className="text-xs text-ink-faint">Illustrative</span>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      )}
      <div className="mb-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Tracked Regulations</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{REGULATIONS.length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">High Impact</p>
          <p className="mt-1 text-2xl font-semibold text-danger">{REGULATIONS.filter((r) => r.impact === "High").length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Active</p>
          <p className="mt-1 text-2xl font-semibold text-success">{REGULATIONS.filter((r) => r.status === "Active").length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Average Sections</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{Math.round(REGULATIONS.reduce((s, r) => s + r.sections, 0) / REGULATIONS.length)}</p>
        </div>
      </div>

      <SectionCard title="Regulation register">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 basis-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search regulations, authorities or IDs…"
              className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
            />
          </div>
          <select value={impact} onChange={(e) => setImpact(e.target.value)} className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink">
            <option value="">All impact levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <span className="text-xs text-ink-faint">{filtered.length} regulation(s)</span>
        </div>

        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold sm:px-5">Regulation</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Authority</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Jurisdiction</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Impact</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Effective</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-surface-muted text-primary">
                        <Scale className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <span className="block max-w-md font-medium leading-tight text-ink">{r.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">{r.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{r.authority}</td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{r.jurisdiction}</td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={r.impact === "High" ? "red" : r.impact === "Medium" ? "amber" : "green"} size="sm">{r.impact}</Badge>
                    </td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-faint">{fmtDate(r.effectiveDate)}</td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={r.status === "Active" ? "green" : "blue"} size="sm">{r.status}</Badge>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-ink-faint">No regulations match your filters.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

RegulationsPage.getLayout = (page) => <GovernmentLayout title="Regulations">{page}</GovernmentLayout>;