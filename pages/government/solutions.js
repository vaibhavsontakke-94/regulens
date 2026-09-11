import { useMemo, useState } from "react";
import { Lightbulb, Search } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import ActiveProblemIntro from "@/components/government/ui/ActiveProblemIntro";
import Badge from "@/components/ui/Badge";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { SOLUTIONS } from "@/lib/mockData";

const COST_META = { Low: { variant: "green" }, Medium: { variant: "amber" }, High: { variant: "red" } };
const STATUS_META = {
  Proposed: { variant: "amber" },
  "In Design": { variant: "blue" },
  "In Implementation": { variant: "blue" },
  Implemented: { variant: "green" },
};
const IMPACT_META = { Low: { variant: "green" }, Medium: { variant: "amber" }, High: { variant: "red" } };
const FEASIBILITY_META = { Low: { variant: "red" }, Medium: { variant: "amber" }, High: { variant: "green" } };

export default function SolutionsPage() {
  const { problem } = useGovernmentProblem();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SOLUTIONS.filter((s) => {
      const matchQ = !q || s.title.toLowerCase().includes(q) || s.owner.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      return matchQ && (!status || s.status === status);
    });
  }, [search, status]);

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Solutions"
        description="Recommended solutions associated with problems. Illustrative demo records."
      />
      {problem && <ActiveProblemIntro problem={problem} />}

      {problem && problem.solutions.length > 0 && (
        <div className="mb-6">
          <SectionCard
            title="Potential solutions for the active problem"
            description={`Ranked by priority score for problem ${problem.id}. Illustrative mock matches.`}
          >
            <ul className="space-y-3">
              {problem.solutions.map((s, i) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 rounded-[10px] border border-line p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold text-ink">{s.name}</p>
                      <Badge variant={s.priorityScore >= 80 ? "amber" : "blue"} size="sm">
                        Priority {s.priorityScore} / 100
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">{s.technology} · {s.description}</p>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-x-5 gap-y-1.5 text-xs sm:grid-cols-3 lg:grid-cols-6">
                    {[
                      ["Problem match", s.problemMatch],
                      ["Expected impact", s.expectedImpact],
                      ["Est. cost", s.estimatedCost],
                      ["Scalability", s.scalability],
                      ["Pilot risk", s.pilotRisk],
                      ["Pilot", s.pilotSuitable ? "Suitable" : "Not yet"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
                        <p className="mt-0.5 font-medium text-ink">{value}</p>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-faint">Illustrative mock solution matching only — not connected to a live scoring engine.</p>
          </SectionCard>
        </div>
      )}
      <div className="mb-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Total Solutions</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{SOLUTIONS.length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Implemented</p>
          <p className="mt-1 text-2xl font-semibold text-success">{SOLUTIONS.filter((s) => s.status === "Implemented").length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">In Design</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{SOLUTIONS.filter((s) => s.status === "In Design").length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">In Implementation</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{SOLUTIONS.filter((s) => s.status === "In Implementation").length}</p>
        </div>
      </div>

      <SectionCard title="Solutions workspace">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 basis-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search solutions, owners or IDs…"
              className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink">
            <option value="">All statuses</option>
            {["Proposed", "In Design", "In Implementation", "Implemented"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-xs text-ink-faint">{filtered.length} solution(s)</span>
        </div>

        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold sm:px-5">Solution</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Est. Cost</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Time</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Impact</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Feasibility</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Reg. Compatibility</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-surface-muted">
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-surface-muted text-amber-600 dark:text-amber-400">
                        <Lightbulb className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <span className="block font-medium text-ink">{s.title}</span>
                        <span className="block text-xs text-ink-faint">{s.id} · {s.owner}</span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{s.cost}</td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{s.time}</td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={IMPACT_META[s.impact].variant} size="sm">{s.impact}</Badge>
                    </td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={FEASIBILITY_META[s.feasibility].variant} size="sm">{s.feasibility}</Badge>
                    </td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={s.compatibility === "High" ? "green" : s.compatibility === "Medium" ? "amber" : "red"} size="sm">{s.compatibility}</Badge>
                    </td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3">
                    <Badge variant={STATUS_META[s.status].variant} size="sm">{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-ink-faint">No solutions match your filters.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

SolutionsPage.getLayout = (page) => <GovernmentLayout title="Solutions">{page}</GovernmentLayout>;