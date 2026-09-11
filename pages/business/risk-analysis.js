import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import AiInsightCard from "@/components/business/ui/AiInsightCard";
import { RISK_ANALYSIS } from "@/lib/businessData";

const CATEGORY_COLORS = {
  Regulatory: "text-danger",
  Financial: "text-warning",
  Operational: "text-primary",
  Expansion: "text-success",
  Market: "text-ink-faint",
};

const CATEGORY_BG = {
  Regulatory: "bg-danger-soft",
  Financial: "bg-warning-soft",
  Operational: "bg-primary-soft",
  Expansion: "bg-success-soft",
  Market: "bg-surface-muted",
};

export default function RiskAnalysisPage() {
  const data = RISK_ANALYSIS;

  function getCellBg(prob, impact) {
    const score = prob * impact;
    if (score >= 12) return "bg-danger-soft border-danger/30";
    if (score >= 6) return "bg-warning-soft border-warning/30";
    return "bg-success-soft border-success/30";
  }

  return (
    <>
      <BusinessPageHeader
        eyebrow="Compliance & Risk"
        title="Risk Analysis"
        description="Risk matrix, categories, timeline and mitigation actions."
      />

      <div className="mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
        <strong>Demo data.</strong> All risk scores and mitigations are illustrative only.
      </div>

      <AiInsightCard
        module="risks"
        title="AI Risk Assessment"
        description="Top risks, drivers and mitigations recommended by AI from the current risk posture."
      />

      <SectionCard title="Risk Matrix" description="Probability vs Impact matrix with identified risks" className="mb-6">
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="mb-2 flex items-end">
              <div className="w-16" />
              <div className="flex-1 grid grid-cols-4 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                <div>Low (1-2)</div>
                <div>Medium (3)</div>
                <div>High (4)</div>
                <div>Critical (5)</div>
              </div>
            </div>
            {[5, 4, 3, 2, 1].map((impact) => (
              <div key={impact} className="mb-1 flex items-center">
                <div className="w-16 text-right pr-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {impact === 5 ? "Critical" : impact === 4 ? "High" : impact === 3 ? "Medium" : impact === 2 ? "Low" : "Negligible"}
                </div>
                <div className="flex-1 grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((prob) => {
                    const cellRisks = data.risks.filter((r) => r.probability <= prob && r.probability > prob - 1 && r.impact === impact);
                    const realRisks = data.risks.filter((r) => r.probability === prob && r.impact === impact);
                    return (
                      <div key={prob} className={`flex h-14 items-center justify-center rounded-lg border p-1 ${getCellBg(prob, impact)}`}>
                        {realRisks.length > 0 ? (
                          <div className="text-center">
                            {realRisks.map((r) => (
                              <span key={r.id} className="block text-[9px] font-medium text-ink leading-tight">{r.name}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-ink-faint">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Risk Categories" className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.risks.map((r) => (
            <div key={r.id} className="rounded-lg border border-line px-3 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-semibold uppercase ${CATEGORY_COLORS[r.category]}`}>{r.category}</span>
                <span className="text-[10px] text-ink-faint">P{r.probability} × I{r.impact} = {r.probability * r.impact}</span>
              </div>
              <h3 className="text-sm font-medium text-ink">{r.name}</h3>
              <p className="mt-1 text-xs text-ink-faint">{r.action}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Risk Timeline">
          <div className="space-y-4">
            {data.timeline.map((phase, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute left-0 top-0 h-full w-px bg-line" />
                <div className="absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-success" />
                <h3 className="text-sm font-semibold text-ink">{phase.phase}</h3>
                <ul className="mt-1.5 space-y-1">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-xs text-ink-subtle">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Mitigation Actions">
          <div className="space-y-3">
            {data.mitigations.map((m) => (
              <div key={m.id} className="rounded-lg border border-line px-3 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-ink">{m.risk}</h3>
                  <Badge variant={m.status === "Active" ? "green" : "blue"} size="sm">{m.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-subtle">{m.action}</p>
                <p className="mt-1 text-[11px] text-ink-faint">Owner: {m.owner}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

RiskAnalysisPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};