import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import { EXPANSION_READINESS } from "@/lib/businessData";

function ScoreRing({ score, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "var(--color-success)" : score >= 55 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle" className="fill-ink" fontSize="16" fontWeight="600">
        {score}
      </text>
    </svg>
  );
}

export default function ExpansionReadinessPage() {
  const data = EXPANSION_READINESS;
  const avg = Math.round(data.breakdown.reduce((s, f) => s + f.scoreTarget, 0) / data.breakdown.length);

  return (
    <>
      <BusinessPageHeader
        eyebrow="Growth"
        title="Expansion Readiness"
        description="Readiness assessment across 11 key expansion factors."
      />

      <div className="mb-6 rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
        <strong>Demo data.</strong> All readiness scores are illustrative and do not represent real assessments.
      </div>

      <SectionCard className="mb-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ScoreRing score={data.readiness} size={120} strokeWidth={8} />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-ink">Readiness Score: {data.readiness}%</h2>
            <p className="mt-1 text-sm font-medium text-success">{data.label}</p>
            <p className="mt-1 text-sm text-ink-subtle">{data.summary}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Factor Breakdown" description="Score for each expansion factor (target region)">
        <div className="space-y-4">
          {data.breakdown.map((f) => (
            <div key={f.factor} className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <span className="w-32 shrink-0 text-xs font-medium text-ink">{f.factor}</span>
              <div className="flex-1">
                <div className="relative h-2.5 rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      f.scoreTarget >= 75 ? "bg-success" : f.scoreTarget >= 55 ? "bg-warning" : "bg-danger"
                    }`}
                    style={{ width: `${f.scoreTarget}%` }}
                  />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-ink-faint">
                  <span>Current: {f.scoreCurrent}%</span>
                  <span>Target: {f.scoreTarget}%</span>
                  <span>Weight: {f.weight}%</span>
                </div>
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink">{f.scoreTarget}%</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

ExpansionReadinessPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};