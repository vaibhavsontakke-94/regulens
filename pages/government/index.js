import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  AlertTriangle,
  Building2,
  FileText,
  Map,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import StatCard from "@/components/government/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PriorityScoreViz } from "@/components/government/ui/ActiveProblemIntro";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import DonutChart from "@/components/government/charts/DonutChart";
import SegmentBar from "@/components/government/charts/SegmentBar";
import GeoMap from "@/components/government/charts/GeoMap";
import {
  STATUS_META,
  PRIORITY_META,
  priorityFromScores,
} from "@/lib/mockData";
import { govApi } from "@/lib/api";
import { fmtFullNumber, fmtDate } from "@/lib/format";

const PAGE_SIZE = 6;

const QUICK_ACTIONS = [
  { label: "Post & Analyze Problem", href: "/government/problems/new", icon: AlertTriangle, color: "text-danger" },
  { label: "Find Affected Businesses", href: "/government/businesses", icon: Building2, color: "text-primary" },
  { label: "Review Policies", href: "/government/policies", icon: FileText, color: "text-warning" },
  { label: "View Ground Evidence", href: "/government/ground-intelligence", icon: Map, color: "text-success" },
];

export default function CommandCenterPage() {
  const router = useRouter();
  const { problem } = useGovernmentProblem();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortKey, setSortKey] = useState("updated");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [problems, setProblems] = useState([]);

  async function loadProblems() {
    try {
      const data = await govApi.listProblems({});
      setProblems(data.problems || []);
    } catch {
      // keep the current list if a refresh fails
    }
  }

  useEffect(() => {
    loadProblems();
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { "Under Review": 0, Implemented: 0, "Pending Verification": 0, Resolved: 0 };
    problems.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status] += 1;
    });
    return counts;
  }, [problems]);

  const priorityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    problems.forEach((p) => {
      const { priority } = priorityFromScores(p.scores);
      if (counts[priority] !== undefined) counts[priority] += 1;
    });
    return counts;
  }, [problems]);

  const topProblem = useMemo(() => {
    return [...problems].sort((a, b) => {
      const { score: sa } = priorityFromScores(a.scores);
      const { score: sb } = priorityFromScores(b.scores);
      return sb - sa;
    })[0];
  }, [problems]);

  const filtered = useMemo(() => {
    let list = [...problems];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (severityFilter) list = list.filter((p) => p.severity === severityFilter);
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (priorityFilter) {
      list = list.filter((p) => {
        const { priority } = priorityFromScores(p.scores);
        return PRIORITY_META[priority].category === priorityFilter;
      });
    }
    list.sort((a, b) => {
      if (sortKey === "updated") {
        const diff = new Date(a.updated) - new Date(b.updated);
        return sortAsc ? diff : -diff;
      }
      if (sortKey === "businesses") return sortAsc ? a.businessesAffected - b.businessesAffected : b.businessesAffected - a.businessesAffected;
      if (sortKey === "population") return sortAsc ? a.populationImpact - b.populationImpact : b.populationImpact - a.populationImpact;
      const { score: sa } = priorityFromScores(a.scores);
      const { score: sb } = priorityFromScores(b.scores);
      return sortAsc ? sa - sb : sb - sa;
    });
    return list;
  }, [search, severityFilter, statusFilter, priorityFilter, sortKey, sortAsc, problems]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(key) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Command Center"
        description="Overview of the problems, regulations, policies and businesses tracked by REGULENS, served from the live workspace database."
        actions={
          <Button variant="outline" size="sm" onClick={loadProblems}>
            Refresh
          </Button>
        }
      />

      {/* Data disclaimer */}
      <div className="mb-6 rounded-lg border border-warning/40 bg-warning-soft/30 px-4 py-3 text-sm text-warning">
        <strong>Workspace data.</strong> All entries are generated by the REGULENS AI engine from recorded workspace intelligence. No real government or business information is presented.
      </div>

      {/* Active Problem — connected intelligence summary */}
      {problem ? (
        <div className="mb-8">
          <SectionCard
            title="Active Problem"
            description="Connected Government intelligence for the problem currently in context."
            action={
              <Button variant="outline" size="sm" onClick={() => router.push("/government/search-problem")}>
                Change Problem
              </Button>
            }
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-faint">{problem.id} · {problem.sector}</p>
                <h2 className="mt-1 text-lg font-semibold leading-snug text-ink">{problem.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <PriorityScoreViz score={problem.priorityScore} label={problem.priorityLevel} variant={problem.priorityVariant} size="lg" />
                  <Badge variant="amber" size="sm">{problem.status}</Badge>
                </div>
              </div>

              <dl className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[440px]">
                {[
                  { label: "Businesses Affected", unit: "", value: fmtFullNumber(problem.overview.businessesAffected) },
                  { label: "Population Impact", unit: "", value: fmtFullNumber(problem.overview.populationImpact) },
                  { label: "Economic Impact", unit: "", value: problem.overview.economicImpact },
                  { label: "Regulatory Risk", unit: "", value: problem.overview.regulatoryRisk },
                  { label: "Urgency", unit: "", value: problem.overview.urgency },
                  { label: "Sector", unit: "", value: problem.sector },
                ].map((s) => (
                  <div key={s.label} className="rounded-[10px] bg-surface-muted p-3">
                    <dt className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">{s.label}</dt>
                    <dd className="mt-1 text-sm font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-5 grid gap-2 border-t border-line pt-4 sm:grid-cols-3">
              <div className="rounded-[10px] border border-line p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Matching Solutions</p>
                <p className="mt-1 text-xl font-semibold text-ink">{problem.solutions.length}</p>
              </div>
              <div className="rounded-[10px] border border-line p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">High Priority Businesses</p>
                <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">
                  {problem.solutions.filter((s) => s.priorityScore >= 80).length}
                </p>
              </div>
              <div className="rounded-[10px] border border-line p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Pilot Candidates</p>
                <p className="mt-1 text-xl font-semibold text-primary">
                  {problem.solutions.filter((s) => s.pilotSuitable).length}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : (
        <div className="mb-8">
          <SectionCard title="Active Problem">
            <div className="flex flex-col items-start gap-3 rounded-[10px] border border-dashed border-line bg-surface-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">No active problem selected.</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Search a government problem to view connected business, regulatory, policy and impact intelligence.
                </p>
              </div>
              <Button variant="soft" size="sm" onClick={() => router.push("/government/search-problem")}>
                Search Problem
              </Button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                type="button"
                onClick={() => router.push(action.href)}
                className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 text-left text-sm font-medium text-ink shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-surface-muted ${action.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        <StatCard
          label="Total Problems"
          value={problems.length}
          icon={SlidersHorizontal}
          hint="Active regulatory issues in the system"
        />
        <StatCard
          label="Critical"
          value={priorityCounts.Critical}
          iconTone="text-danger"
          hint="Problems with the highest severity and impact"
        />
        <StatCard
          label="High Priority"
          value={priorityCounts.High}
          iconTone="text-warning"
          hint="High severity or wide impact"
        />
        <StatCard
          label="Under Review"
          value={statusCounts["Under Review"]}
          icon={Search}
          iconTone="text-primary"
          hint="Currently being analyzed"
        />
        <StatCard
          label="Implemented"
          value={statusCounts.Implemented}
          iconTone="text-success"
          hint="Solutions deployed"
        />
        <StatCard
          label="Pending Verification"
          value={statusCounts["Pending Verification"]}
          iconTone="text-primary"
          hint="Awaiting field or data verification"
        />
        <StatCard
          label="Resolved"
          value={statusCounts.Resolved}
          iconTone="text-success"
          hint="Addressed and closed"
        />
      </div>

      {/* Priority Overview */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Priority Overview"
          description="Distribution of problems by priority category."
        >
          <DonutChart
            segments={[
              { label: "Critical", value: priorityCounts.Critical, tone: "danger" },
              { label: "High", value: priorityCounts.High, tone: "warning" },
              { label: "Medium", value: priorityCounts.Medium, tone: "primary" },
              { label: "Low", value: priorityCounts.Low, tone: "success" },
            ]}
            centerLabel="Problems"
            centerValue={problems.length}
          />
        </SectionCard>

        <SectionCard
          title="Priority Methodology"
          description="Weights used to compute the priority score. Component weights sum to 100%."
        >
          <SegmentBar
            height="h-3"
            segments={[
              { label: "Severity", value: 20, tone: "danger" },
              { label: "Businesses Affected", value: 15, tone: "warning" },
              { label: "Population Impact", value: 15, tone: "primary" },
              { label: "Economic Impact", value: 15, tone: "primary" },
              { label: "Regulatory Risk", value: 15, tone: "warning" },
              { label: "Urgency", value: 10, tone: "danger" },
              { label: "Geographic", value: 10, tone: "neutral" },
            ]}
          />
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            Weights reflect the REGULENS priority scoring model applied across the workspace.
          </p>
        </SectionCard>
      </div>

      {/* Problem Intelligence */}
      <SectionCard
        title="Problem Intelligence"
        description={`Showing ${filtered.length} problem${filtered.length !== 1 ? "s" : ""}. Data served from the live workspace.`}
        action={
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="h-8 w-40 rounded-md border border-line bg-surface px-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
            />
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink"
            >
              <option value="">Severity</option>
              {["Critical", "High", "Medium", "Low"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink"
            >
              <option value="">Status</option>
              {["Under Review", "Implemented", "Pending Verification", "Resolved"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="hidden h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink sm:block"
            >
              <option value="">Priority</option>
              {["Critical", "High", "Medium", "Low"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold sm:px-5">Problem</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Location</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Severity</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Businesses</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Population</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Status</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort("priority")}
                    className="flex items-center gap-1 hover:text-ink"
                  >
                    Priority
                    {sortKey === "priority" && <span className="text-primary">{sortAsc ? "↑" : "↓"}</span>}
                  </button>
                </th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort("updated")}
                    className="flex items-center gap-1 hover:text-ink"
                  >
                    Updated
                    {sortKey === "updated" && <span className="text-primary">{sortAsc ? "↑" : "↓"}</span>}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paginated.map((p) => {
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
                        <span className="text-xs text-ink-faint">{p.id} · {p.category}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{p.location}</td>
<td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{p.severity}</td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink">{fmtFullNumber(p.businessesAffected)}</td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink">{fmtFullNumber(p.populationImpact)}</td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={STATUS_META[p.status]?.variant || "neutral"} size="sm">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={PRIORITY_META[priority].variant} size="sm">
                        {PRIORITY_META[priority].short}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-faint">{fmtDate(p.updated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-ink-faint">No problems match the current filters.</div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs text-ink-faint">
              Page {currentPage} of {totalPages} ({filtered.length} result{filtered.length !== 1 ? "s" : ""})
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <p className="mt-8 text-center text-xs text-ink-faint">
        All KPIs, problem intelligence, maps and scores are derived from the workspace database and the REGULENS analysis engine.
      </p>
    </>
  );
}

CommandCenterPage.getLayout = (page) => {
  return <GovernmentLayout>{page}</GovernmentLayout>;
};