import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { useWorkspace } from "@/components/business/WorkspaceContext";

function ComparisonBar({ factor, current, target }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink">{factor}</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-ink-faint">Current: {current}%</span>
          <span className="text-success font-semibold">Target: {target}%</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-surface-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/40"
          style={{ width: `${current}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-success"
          style={{ width: `${target}%` }}
        />
      </div>
    </div>
  );
}

export default function ExpansionAnalyzerPage() {
  const { data: workspace } = useWorkspace();
  const data = workspace.expansionAnalysis;
  const EXPANSION_FACTORS = workspace.expansionFactors || [];

  return (
    <>
      <BusinessPageHeader
        eyebrow="Growth"
        title="Expansion Analyzer"
        description="Compare your current region against a potential expansion target."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <SectionCard title="Current Region">
          <div className="text-center">
            <p className="text-lg font-semibold text-ink">{data.currentRegion}</p>
            <div className="mt-3 flex justify-center">
              <div className="flex flex-col items-center">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-line)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-primary)" strokeWidth="6"
                    strokeDasharray={`${(data.currentScore / 100) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" className="fill-ink" fontSize="16" fontWeight="600">
                    {data.currentScore}
                  </text>
                </svg>
                <span className="mt-1 text-xs text-ink-faint">Score</span>
              </div>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Target Region">
          <div className="text-center">
            <p className="text-lg font-semibold text-success">{data.targetRegion}</p>
            <div className="mt-3 flex justify-center">
              <div className="flex flex-col items-center">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-line)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-success)" strokeWidth="6"
                    strokeDasharray={`${(data.targetScore / 100) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" className="fill-ink" fontSize="16" fontWeight="600">
                    {data.targetScore}
                  </text>
                </svg>
                <span className="mt-1 text-xs text-ink-faint">Score</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Expansion Score" className="mb-6">
        <div className="rounded-lg border border-success/30 bg-success-soft p-4 text-center">
          <p className="text-sm text-ink-subtle">Target region scores</p>
          <p className="mt-1 text-3xl font-semibold text-success">{data.targetScore}/100</p>
          <p className="mt-1 text-xs text-ink-faint">vs {data.currentScore}/100 current</p>
        </div>
      </SectionCard>

      <SectionCard title="Factor Comparison" description="Score comparison across all factors" className="mb-6">
        <div className="space-y-4">
          {EXPANSION_FACTORS.map((f) => (
            <ComparisonBar key={f.factor} factor={f.factor} current={f.scoreCurrent} target={f.scoreTarget} />
          ))}
        </div>
      </SectionCard>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Advantages" description="Benefits of the target region">
          <ul className="space-y-2">
            {data.advantages.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {a}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Requirements" description="What you need to do">
          <ul className="space-y-2">
            {data.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Risks" description="Potential challenges">
          <ul className="space-y-2">
            {data.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                {r}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Recommended Actions" description="Suggested next steps">
          <ul className="space-y-2">
            {data.recommendedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {a}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Estimated Cost">
        <div className="rounded-lg border border-line bg-surface-muted p-4 text-center">
          <p className="text-sm text-ink-subtle">Estimated setup & compliance cost</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{data.estimatedCost}</p>
          <p className="mt-1 text-xs text-ink-faint">Estimated from your profile and target-market data</p>
        </div>
      </SectionCard>
    </>
  );
}

ExpansionAnalyzerPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};