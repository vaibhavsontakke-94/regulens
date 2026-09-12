import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import ActiveProblemIntro from "@/components/government/ui/ActiveProblemIntro";
import Badge from "@/components/ui/Badge";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { govApi } from "@/lib/api";
import { fmtFullNumber } from "@/lib/format";

const TYPE_META = {
  Proposed: { variant: "amber", label: "Proposed" },
  Active: { variant: "green", label: "Active" },
};

export default function PoliciesPage() {
  const { problem } = useGovernmentProblem();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    govApi
      .policies()
      .then((data) => {
        if (active) setPolicies(data.policies || []);
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
    return status ? policies.filter((p) => p.status === status) : policies;
  }, [policies, status]);

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Policies"
        description="Policy options produced from problem analysis, served from the live workspace database."
      />
      {problem && <ActiveProblemIntro problem={problem} />}

      {problem && problem.policies.length > 0 && (
        <div className="mb-6">
          <SectionCard
            title="Policy impact — active problem"
            description={`Policy context linked to the active problem (${problem.id}).`}
          >
            {problem.policies.map((pc) => (
              <div key={pc.id} className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Current policy</p>
                  <p className="mt-1 text-sm font-medium text-ink">{pc.currentPolicy}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-ink-faint">Potential impact:</span>
                    <Badge variant={pc.potentialImpact === "High" ? "red" : "amber"} size="sm">
                      {pc.potentialImpact}
                    </Badge>
                    <Badge variant="amber" size="sm">{pc.status}</Badge>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {pc.options.map((o) => (
                      <li key={o} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-subtle">
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid w-full shrink-0 grid-cols-2 gap-2 lg:w-72">
                  <div className="rounded-[10px] bg-surface-muted p-3">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Affected businesses</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{fmtFullNumber(pc.affectedBusinesses)}</p>
                  </div>
                  <div className="rounded-[10px] bg-surface-muted p-3">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Affected population</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{fmtFullNumber(pc.affectedPopulation)}</p>
                  </div>
                </div>
              </div>
            ))}
          </SectionCard>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-[10px] border border-line bg-surface p-1">
          {["", "Draft", "Under Consultation", "In Implementation"].map((s) => (
            <button
              key={s || "all"}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors ${
                status === s ? "bg-primary text-primary-text" : "text-ink-subtle hover:text-ink"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <span className="text-xs text-ink-faint">{list.length} policy(ies)</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((p) => (
          <SectionCard key={p.id} title={p.title} description={`${p.type} · ${p.id}`}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={TYPE_META[p.type].variant} size="sm">{p.type}</Badge>
              <Badge variant={p.status === "In Implementation" ? "blue" : "amber"} size="sm">{p.status}</Badge>
            </div>

            <dl className="space-y-2.5 text-sm">
              <div className="grid gap-1 sm:grid-cols-[130px_1fr]">
                <dt className="text-ink-faint">Current state</dt>
                <dd className="text-ink">{p.currentState}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[130px_1fr]">
                <dt className="text-ink-faint">Proposed scenario</dt>
                <dd className="text-ink">{p.scenario}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[130px_1fr]">
                <dt className="text-ink-faint">Affected groups</dt>
                <dd className="text-ink">{p.affectedGroups}</dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-[10px] bg-surface-muted p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Economic effect</p>
                <p className="mt-1 text-sm font-medium text-ink">{p.economicEffect}</p>
              </div>
              <div className="rounded-[10px] bg-surface-muted p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Operational effect</p>
                <p className="mt-1 text-sm font-medium text-ink">{p.operationalEffect}</p>
              </div>
              <div className="rounded-[10px] bg-surface-muted p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Regulatory effect</p>
                <p className="mt-1 text-sm font-medium text-ink">{p.regulatoryEffect}</p>
              </div>
            </div>
          </SectionCard>
        ))}
        {!loading && list.length === 0 && (
          <SectionCard className="lg:col-span-2">
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <FileText className="h-8 w-8 text-ink-faint" />
              <p className="text-sm text-ink-faint">No policies in this status.</p>
            </div>
          </SectionCard>
        )}
      </div>
    </>
  );
}

PoliciesPage.getLayout = (page) => <GovernmentLayout title="Policies">{page}</GovernmentLayout>;