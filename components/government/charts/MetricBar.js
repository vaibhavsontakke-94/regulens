import { PRIORITY_FACTORS } from "@/lib/mockData";
import { SectionCard } from "../ui/PageHeader";

function scoreColor(score) {
  if (score >= 7) return "bg-danger";
  if (score >= 5) return "bg-warning";
  if (score >= 3) return "bg-primary";
  return "bg-success";
}

function MetricBar({ label, score, weight }) {
  const width = Math.max((score / 10) * 100, 1);
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-xs font-medium text-ink sm:whitespace-nowrap">{label}</span>
      <div className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`${scoreColor(score)} h-full rounded-full transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-10 shrink-0 whitespace-nowrap text-right text-xs font-semibold text-ink">{score}/10</span>
      <span className="w-12 shrink-0 whitespace-nowrap text-right text-[11px] text-ink-faint">×{weight}%</span>
    </div>
  );
}

export default function PriorityBreakdown({ scores }) {
  const computed = PRIORITY_FACTORS.reduce((acc, f) => {
    const s = scores[f.key] || 0;
    acc.weighted += (s / 10) * f.weight;
    acc.raw += s;
    return acc;
  }, { weighted: 0, raw: 0 });

  const weighted = computed.weighted;
  const label = weighted >= 7.5 ? "P1 — Critical" : weighted >= 6 ? "P2 — High" : weighted >= 4.5 ? "P3 — Medium" : "P4 — Low";
  const color =
    weighted >= 7.5 ? "text-danger" : weighted >= 6 ? "text-warning" : weighted >= 4.5 ? "text-primary" : "text-success";
  const barColor =
    weighted >= 7.5 ? "bg-danger" : weighted >= 6 ? "bg-warning" : weighted >= 4.5 ? "bg-primary" : "bg-success";
  const barWidth = Math.min(Math.max(weighted, 2), 100);

  return (
    <SectionCard
      title="Priority Assessment"
      description="Component scores are illustrative estimates and should not be interpreted as definitive impact measurements."
    >
      <div className="mb-4 rounded-lg border border-line bg-surface-muted p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Priority Score</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight text-ink tabular-nums">{weighted.toFixed(2)}</span>
              <span className="text-sm font-medium text-ink-faint">/ 100</span>
            </div>
          </div>
          <span className={`inline-flex w-fit items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold ${color}`}>
            {label}
          </span>
        </div>
        <div className="mt-5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className={`${barColor} h-full rounded-full transition-all`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
          Score range: 0–100. Weights sum to 100%. For demo purposes only.
        </p>
      </div>

      <div className="space-y-3">
        {PRIORITY_FACTORS.map((f) => (
          <MetricBar key={f.key} label={f.label} score={scores[f.key] || 0} weight={f.weight} />
        ))}
      </div>
    </SectionCard>
  );
}