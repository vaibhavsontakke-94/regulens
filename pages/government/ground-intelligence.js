import { useMemo, useState } from "react";
import { Camera, FileText, SearchCheck, Info } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import ActiveProblemIntro from "@/components/government/ui/ActiveProblemIntro";
import Badge from "@/components/ui/Badge";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { EVIDENCE } from "@/lib/mockData";
import { fmtDate, fmtFullNumber } from "@/lib/format";

const TYPE_META = {
  Photo: { label: "Photo", icon: Camera, variant: "blue" },
  Document: { label: "Document", icon: FileText, variant: "amber" },
  Inspection: { label: "Inspection Record", icon: SearchCheck, variant: "green" },
};

export default function GroundIntelligencePage() {
  const { problem } = useGovernmentProblem();
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const list = useMemo(() => {
    return EVIDENCE.filter((e) => (!type || e.type === type) && (!status || e.status === status));
  }, [type, status]);

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Ground Intelligence"
        description="Photographs, documents and inspection records collected on the ground. Illustrative demo entries — no real uploads."
      />
      {problem && <ActiveProblemIntro problem={problem} />}

      {problem && (
        <div className="mb-6">
          <SectionCard
            title="Field signals — active problem"
            description={`Illustrative mock field context for problem ${problem.id}.`}
          >
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {[
                ["Affected businesses", fmtFullNumber(problem.groundIntelligence.fieldSignals.affectedBusinesses)],
                ["Population affected", fmtFullNumber(problem.groundIntelligence.fieldSignals.populationAffected)],
                ["Reported severity", problem.groundIntelligence.fieldSignals.reportedSeverity],
                ["Geographic concentration", problem.groundIntelligence.fieldSignals.geographicConcentration],
                ["Current status", problem.groundIntelligence.fieldSignals.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[10px] bg-surface-muted p-3">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {problem.groundIntelligence.affectedLocations.map((loc) => (
                <div key={loc.district} className="rounded-[10px] border border-line p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{loc.district}</p>
                    <Badge variant={loc.status === "Under Review" ? "amber" : "blue"} size="sm">{loc.status}</Badge>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-faint">Affected businesses</dt>
                      <dd className="font-medium text-ink">{fmtFullNumber(loc.affectedBusinesses)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-faint">Population affected</dt>
                      <dd className="font-medium text-ink">{fmtFullNumber(loc.populationAffected)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-faint">Reported severity</dt>
                      <dd className="font-medium text-ink">{loc.severity}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-faint">Concentration</dt>
                      <dd className="font-medium text-ink">{loc.concentration}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-faint">Illustrative mock field signals only — no real ground verification data is shown.</p>
          </SectionCard>
        </div>
      )}
      <div className="mb-4 rounded-lg border border-warning/40 bg-warning-soft/30 px-4 py-3 text-xs leading-relaxed text-warning">
        Demo workspace — evidence shown here is mock content. No files are actually uploaded, stored or verified.
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-[10px] border border-line bg-surface p-1">
          {["", "Photo", "Document", "Inspection"].map((t) => (
            <button
              key={t || "all"}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors ${
                type === t ? "bg-primary text-primary-text" : "text-ink-subtle hover:text-ink"
              }`}
            >
              {t ? TYPE_META[t].label : "All types"}
            </button>
          ))}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink">
          <option value="">All verification statuses</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
        </select>
        <span className="text-xs text-ink-faint">{list.length} item(s)</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => {
          const meta = TYPE_META[e.type];
          const Icon = meta.icon;
          return (
            <div key={e.id} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface-muted ${e.type === "Photo" ? "text-primary" : e.type === "Document" ? "text-warning" : "text-success"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={e.status === "Verified" ? "green" : "amber"} size="sm">{e.status}</Badge>
                  <span className="text-[11px] text-ink-faint">{e.type} · {fmtDate(e.date)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold leading-tight text-ink">{e.title}</h3>
                <p className="mt-0.5 text-xs text-ink-faint">{e.id} · Linked to {e.problemId}</p>
              </div>

              {/* Before / After */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[10px] bg-surface-muted p-3">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Before</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-subtle">{e.before}</p>
                </div>
                <div className="rounded-[10px] bg-success-soft/40 p-3">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-success">After</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-subtle">{e.after}</p>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-xs text-ink-faint">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Illustrative record — attachments are not stored.
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-card border border-line bg-surface py-12 text-center">
            <Camera className="h-8 w-8 text-ink-faint" />
            <p className="text-sm text-ink-faint">No evidence matches the current filters.</p>
          </div>
        )}
      </div>
    </>
  );
}

GroundIntelligencePage.getLayout = (page) => <GovernmentLayout title="Ground Intelligence">{page}</GovernmentLayout>;