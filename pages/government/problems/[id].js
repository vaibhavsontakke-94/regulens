import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PriorityBreakdown from "@/components/government/charts/MetricBar";
import GeoMap from "@/components/government/charts/GeoMap";
import {
  SEVERITY_META,
  STATUS_META,
  PRIORITY_META,
  priorityFromScores,
} from "@/lib/mockData";
import { govApi } from "@/lib/api";
import { db } from "../../../server/store.js";
import { fmtFullNumber, fmtDate, fmtDateTime } from "@/lib/format";

const EVIDENCE_TYPE_ICON = {
  Photo: "📷",
  Document: "📄",
  Inspection: "🔎",
};

function StatLine({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0">
      <span className="text-ink-faint">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

export default function ProblemDetailPage({ problem }) {
  const [relations, setRelations] = useState({ businesses: [], regulations: [], policies: [], solutions: [], evidence: [] });
  const [relLoading, setRelLoading] = useState(true);

  useEffect(() => {
    if (!problem) return;
    let active = true;
    setRelLoading(true);
    Promise.all([
      govApi.problemBusinesses(problem.id),
      govApi.problemRegulations(problem.id),
      govApi.problemPolicies(problem.id),
      govApi.problemSolutions(problem.id),
      govApi.problemEvidence(problem.id),
    ])
      .then(([b, r, pol, sol, ev]) => {
        if (!active) return;
        setRelations({
          businesses: b.businesses || [],
          regulations: r.regulations || [],
          policies: pol.policies || [],
          solutions: sol.solutions || [],
          evidence: ev.evidence || [],
        });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setRelLoading(false);
      });
    return () => {
      active = false;
    };
  }, [problem]);

  if (!problem) {
    return (
      <SectionCard title="Problem not found">
        <p className="text-sm text-ink-faint">This problem record does not exist. <Link className="text-primary hover:underline" href="/government/problems">Back to problems</Link></p>
      </SectionCard>
    );
  }

  const { priority, score } = priorityFromScores(problem.scores);
  const businesses = relations.businesses;
  const regulations = relations.regulations;
  const policies = relations.policies;
  const solutions = relations.solutions;
  const evidence = relations.evidence;
  const firstAudit = problem.audits[problem.audits.length - 1];

  return (
    <>
      <Link
        href="/government/problems"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to problems
      </Link>

      <PageHeader
        eyebrow={problem.id}
        title={problem.title}
        description={`${problem.category} · ${problem.location} · last updated ${fmtDate(problem.updated)}`}
        actions={
          <>
            <Button variant="soft" size="sm" href={`/government/test-and-scale?problemId=${problem.id}`}>
              Test & Scale
            </Button>
            <Badge variant={SEVERITY_META[problem.severity].variant} dot>{problem.severity}</Badge>
            <Badge variant={PRIORITY_META[priority].variant}>{PRIORITY_META[priority].short} · {score.toFixed(2)}</Badge>
            <Badge variant={STATUS_META[problem.status]?.variant || "neutral"}>{problem.status}</Badge>
          </>
        }
      />

      <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft/20 px-4 py-3 text-xs leading-relaxed text-primary">
        Live workspace record — this problem, its linked businesses, regulations, policies, solutions and evidence come
        from the REGULENS dataset.
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard title="Problem Overview" description="Recorded summary of the issue.">
            <p className="text-[15px] leading-relaxed text-ink-subtle">{problem.summary}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[10px] border border-line bg-surface-muted p-3.5">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Businesses Affected</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{fmtFullNumber(problem.businessesAffected)}</p>
              </div>
              <div className="rounded-[10px] border border-line bg-surface-muted p-3.5">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Population Impact</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{fmtFullNumber(problem.populationImpact)}</p>
              </div>
              <div className="rounded-[10px] border border-line bg-surface-muted p-3.5">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Priority Score</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{score.toFixed(2)}<span className="text-sm text-ink-faint"> / 10</span></p>
              </div>
            </div>
          </SectionCard>

          <PriorityBreakdown scores={problem.scores} />

          <SectionCard title="Affected Businesses" description="Businesses identified as affected by this problem.">
            {businesses.length === 0 ? (
              <p className="text-sm text-ink-faint">No businesses recorded against this problem.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                      <th className="py-2 pr-4 font-semibold">Business</th>
                      <th className="px-4 py-2 font-semibold">Industry</th>
                      <th className="px-4 py-2 font-semibold">Location</th>
                      <th className="px-4 py-2 font-semibold">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {businesses.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 pr-4"><span className="font-medium text-ink">{b.name}</span><div className="text-xs text-ink-faint">{b.id}</div></td>
                        <td className="px-4 py-3 text-ink-subtle">{b.industry}</td>
                        <td className="px-4 py-3 text-ink-subtle">{b.location}</td>
                        <td className="px-4 py-3">
                          <Badge variant={b.risk === "High" ? "red" : b.risk === "Medium" ? "amber" : "green"} size="sm">{b.risk}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Affected Population" description="Recorded population-level impact narrative.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[10px] bg-surface-muted p-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Population Impact</p>
                <p className="mt-1 text-xl font-semibold text-ink">{fmtFullNumber(problem.populationImpact)}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                  Estimated residents exposed to the direct effects of this problem.
                </p>
              </div>
              <div className="rounded-[10px] bg-surface-muted p-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Economic Impact</p>
                <p className="mt-1 text-xl font-semibold text-ink">{problem.scores.economic >= 7 ? "High" : problem.scores.economic >= 4 ? "Medium" : "Low"}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                  Upper-bound consumer-cost exposure associated with the problem and its resolution cost.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <SectionCard title="Economic Impact" noBorder>
                <StatLine label="Impact state">Pending resolution</StatLine>
                <StatLine label="Primary channel">{problem.category}</StatLine>
                <StatLine label="Population at risk">{fmtFullNumber(problem.populationImpact)}</StatLine>
                <StatLine label="Businesses at risk">{fmtFullNumber(problem.businessesAffected)}</StatLine>
              </SectionCard>
            </div>
          </SectionCard>

          <SectionCard title="Regulatory Context" description="Regulations linked to this problem.">
            {regulations.length === 0 ? (
              <p className="text-sm text-ink-faint">No regulations linked.</p>
            ) : (
              <ul className="space-y-3">
                {regulations.map((r) => (
                  <li key={r.id} className="rounded-[10px] border border-line p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{r.title}</span>
                      <Badge variant={r.impact === "High" ? "red" : "amber"} size="sm">{r.impact}</Badge>
                      <span className="ml-auto text-xs text-ink-faint">{r.id}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink-faint">{r.description}. {r.authority} · effective {fmtDate(r.effectiveDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Root Cause" description="Analytical notes on the drivers of this problem.">
            <ul className="space-y-2">
              {problem.rootCauses.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-subtle">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {cause}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Recommended Solutions" description="Solutions associated with this problem.">
            {solutions.length === 0 ? (
              <p className="text-sm text-ink-faint">No solutions recommended yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                      <th className="py-2 pr-4 font-semibold">Solution</th>
                      <th className="px-4 py-2 font-semibold">Cost</th>
                      <th className="px-4 py-2 font-semibold">Time</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {solutions.map((s) => (
                      <tr key={s.id}>
                        <td className="py-3 pr-4"><span className="font-medium text-ink">{s.title}</span><div className="text-xs text-ink-faint">{s.owner}</div></td>
                        <td className="px-4 py-3 text-ink-subtle">{s.cost}</td>
                        <td className="px-4 py-3 text-ink-subtle">{s.time}</td>
                        <td className="px-4 py-3">
                          <Badge variant={s.status === "Implemented" ? "green" : s.status === "In Implementation" ? "blue" : "amber"} size="sm">{s.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Policy Impact" description="Policies proposed to address this problem.">
            {policies.length === 0 ? (
              <p className="text-sm text-ink-faint">No policies proposed.</p>
            ) : (
              <ul className="space-y-3">
                {policies.map((p) => (
                  <li key={p.id} className="rounded-[10px] border border-line p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-ink">{p.title}</span>
                      <Badge variant={p.status === "In Implementation" ? "blue" : "amber"} size="sm">{p.status}</Badge>
                    </div>
                    <dl className="mt-2 space-y-1 text-xs text-ink-faint sm:grid sm:grid-cols-2 sm:gap-x-4">
                      <div className="flex justify-between gap-2"><dt className="shrink-0">Current state</dt><dd className="text-right">{p.currentState}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="shrink-0">Proposed</dt><dd className="text-right">{p.scenario}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="shrink-0">Economic effect</dt><dd className="text-right">{p.economicEffect}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="shrink-0">Regulatory effect</dt><dd className="text-right">{p.regulatoryEffect}</dd></div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Implementation" description="Status of the resolution pipeline for this problem.">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">Stage</span>
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">{problem.implementation.stage}</span>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-ink-faint">Progress</span>
                  <span className="font-semibold text-ink">{problem.implementation.progress}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full ${problem.implementation.progress >= 80 ? "bg-success" : problem.implementation.progress >= 40 ? "bg-primary" : "bg-warning"}`}
                    style={{ width: `${problem.implementation.progress}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatLine label="Owner">{problem.implementation.owner}</StatLine>
                <StatLine label="Next milestone">{problem.implementation.nextMilestone}</StatLine>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ground Evidence" description="Evidence recorded during investigation.">
            {evidence.length === 0 ? (
              <p className="text-sm text-ink-faint">No evidence recorded.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {evidence.map((e) => (
                  <div key={e.id} className="rounded-[10px] border border-line p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                        <span aria-hidden="true">{EVIDENCE_TYPE_ICON[e.type] || "📄"}</span>
                        {e.title}
                      </span>
                      <Badge variant={e.status === "Verified" ? "green" : "amber"} size="sm">{e.status}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-faint">{e.type} · {fmtDate(e.date)}</p>
                    <div className="mt-2 rounded-[8px] bg-surface-muted px-2.5 py-1.5 text-xs text-ink-faint">
                      <span className="font-semibold text-ink-faint">Before:</span> {e.before}
                    </div>
                    <div className="mt-1 rounded-[8px] bg-surface-muted px-2.5 py-1.5 text-xs text-ink-faint">
                      <span className="font-semibold text-ink-faint">After:</span> {e.after}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Audit Timeline" description="Historical actions recorded on this problem.">
            <ol className="relative space-y-4 border-l border-line pl-5">
              {problem.audits.slice().reverse().map((a, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" />
                  <p className="text-sm font-medium text-ink">{a.action}</p>
                  <p className="text-xs text-ink-faint">{a.actor} · {fmtDateTime(a.time)}</p>
                </li>
              ))}
            </ol>
            {firstAudit && (
              <p className="mt-4 text-xs text-ink-faint">Created: {fmtDateTime(firstAudit.time)} by {firstAudit.actor}.</p>
            )}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SectionCard title="Key facts">
            <StatLine label="Problem ID">{problem.id}</StatLine>
            <StatLine label="Category">{problem.category}</StatLine>
            <StatLine label="Location">{problem.location}</StatLine>
            <StatLine label="Severity">{problem.severity}</StatLine>
            <StatLine label="Status">{problem.status}</StatLine>
            <StatLine label="Priority">{PRIORITY_META[priority].label}</StatLine>
            <StatLine label="Last updated">{fmtDate(problem.updated)}</StatLine>
          </SectionCard>

          <SectionCard title="Geographic concentration" description="Recorded concentration across the affected areas.">
            <GeoMap
              regions={problem.geographic.areas}
              severityByArea={problem.geographic.severityByArea}
              businessConcentration={problem.geographic.businessConcentration}
            />
          </SectionCard>

          <SectionCard title="Impact indicators">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-ink">Businesses affected</p>
                <div className="mt-1.5 h-2.5 w-full rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((problem.businessesAffected / 960) * 100, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">{fmtFullNumber(problem.businessesAffected)} businesses · recorded</p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink">Population impact</p>
                <div className="mt-1.5 h-2.5 w-full rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min((problem.populationImpact / 8400000) * 100, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">{fmtFullNumber(problem.populationImpact)} people · recorded</p>
              </div>
              <div className="flex items-center gap-2 rounded-[10px] bg-success-soft px-3 py-2.5 text-xs font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" />
                Verification status: {problem.status !== "Resolved" ? "In progress" : "Complete"}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const problem = db.getProblem(params?.id);
  return {
    props: { problem: problem ? JSON.parse(JSON.stringify(problem)) : null },
  };
}

ProblemDetailPage.getLayout = (page) => <GovernmentLayout title="Problem Detail">{page}</GovernmentLayout>;