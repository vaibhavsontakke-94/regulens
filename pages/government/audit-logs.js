import { useMemo, useState } from "react";
import { FileSearch, History } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { AUDIT_LOGS } from "@/lib/mockData";
import { fmtDateTime } from "@/lib/format";

const OUTCOME_META = {
  Success: { variant: "green" },
  Warning: { variant: "amber" },
  Info: { variant: "blue" },
};

export default function AuditLogsPage() {
  const [actor, setActor] = useState("");
  const [outcome, setOutcome] = useState("");

  const actors = useMemo(() => [...new Set(AUDIT_LOGS.map((a) => a.actor))], []);
  const list = useMemo(() => {
    return AUDIT_LOGS.filter((a) => (!actor || a.actor === actor) && (!outcome || a.outcome === outcome));
  }, [actor, outcome]);

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Audit Logs"
        description="Trail of actions across the workspace. Illustrative demo entries."
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <FileSearch className="h-4 w-4" />
            Export log (demo)
          </button>
        }
      />
      <SectionCard title="Action history">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select value={actor} onChange={(e) => setActor(e.target.value)} className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink">
            <option value="">All actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink">
            <option value="">All outcomes</option>
            {["Success", "Warning", "Info"].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <span className="text-xs text-ink-faint">{list.length} record(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap min-w-0 py-2.5 pr-4 font-semibold">Time</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Actor</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Action</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Target</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((a, i) => (
                <tr key={i} className="transition-colors hover:bg-surface-muted">
                  <td className="whitespace-nowrap min-w-0 py-3 pr-4 text-ink-faint">{fmtDateTime(a.time)}</td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink">{a.actor}</td>
                  <td className="max-w-md min-w-0 px-4 py-3 text-ink-subtle">{a.action}</td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 font-mono text-xs text-ink-faint">{a.target}</td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3">
                    <Badge variant={OUTCOME_META[a.outcome]?.variant || "neutral"} size="sm">{a.outcome}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <History className="h-8 w-8 text-ink-faint" />
              <p className="text-sm text-ink-faint">No log entries match your filters.</p>
            </div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

AuditLogsPage.getLayout = (page) => <GovernmentLayout title="Audit Logs">{page}</GovernmentLayout>;