import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import { FINANCIAL_IMPACT } from "@/lib/businessData";

const TONE_COLORS = {
  success: "bg-success",
  danger: "bg-danger",
  primary: "bg-primary",
  warning: "bg-warning",
  neutral: "bg-ink-faint",
};

const TONE_TEXT = {
  success: "text-success",
  danger: "text-danger",
  primary: "text-primary",
  warning: "text-warning",
  neutral: "text-ink-faint",
};

export default function FinancialImpactPage() {
  const data = FINANCIAL_IMPACT;
  const maxValue = Math.max(...data.bars.map((b) => b.value));

  return (
    <>
      <BusinessPageHeader
        eyebrow="Compliance & Risk"
        title="Financial Impact"
        description="Visual analysis of compliance costs, potential exposure, setup and expansion costs."
      />

      <div className="mb-6 rounded-lg border border-warning/40 bg-warning-soft/30 px-4 py-3 text-sm text-warning">
        <strong>Illustrative/demo data.</strong> {data.note}
      </div>

      <SectionCard title="Financial Overview" className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {data.bars.map((b) => (
            <div key={b.label} className="rounded-card border border-line bg-surface-muted p-3 text-center">
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">{b.label}</p>
              <p className={`mt-1 text-xl font-semibold ${TONE_TEXT[b.tone]}`}>NGN {b.value}M</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">{b.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Cost Comparison" description="Relative scale of financial items (illustrative)" className="mb-6">
        <div className="space-y-5">
          {data.bars.map((b) => (
            <div key={b.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <span className="w-40 shrink-0 text-xs font-medium text-ink">{b.label}</span>
              <div className="relative h-4 min-w-0 flex-1 rounded-full bg-surface-muted">
                <div
                  className={`${TONE_COLORS[b.tone]} h-full rounded-full transition-all`}
                  style={{ width: `${(b.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-semibold text-ink">NGN {b.value}M</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Risk vs Cost Analysis" description="Potential exposure vs compliance investment">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-center">
            <p className="text-xs font-semibold uppercase text-danger">Potential Exposure</p>
            <p className="mt-2 text-3xl font-bold text-danger">NGN 64M</p>
            <p className="mt-1 text-xs text-ink-faint">Duty, penalties, claims</p>
          </div>
          <div className="rounded-lg border border-success/30 bg-success-soft p-4 text-center">
            <p className="text-xs font-semibold uppercase text-success">Compliance Investment</p>
            <p className="mt-2 text-3xl font-bold text-success">NGN 18.5M</p>
            <p className="mt-1 text-xs text-ink-faint">Permits, audits, fees</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ink-faint">
          Investing NGN 18.5M in compliance could mitigate up to NGN 64M in potential exposure. Illustrative calculation.
        </p>
      </SectionCard>
    </>
  );
}

FinancialImpactPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};