import { useRouter } from "next/router";
import { ArrowRight, Crosshair, ShieldAlert } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import CompactMetric from "@/components/business/ui/CompactMetric";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AiInsightCard from "@/components/business/ui/AiInsightCard";
import { RISK_CATEGORIES } from "@/lib/businessData";

const SEVERITY_VARIANTS = { High: "red", Medium: "amber", Low: "green" };
const STATUS_VARIANTS = { Elevated: "amber", Managed: "blue", Stable: "green" };

const TOP_CATEGORIES = ["RK-REG", "RK-OP", "RK-FIN", "RK-EXP"];

export default function RegulatoryRiskPage() {
  const router = useRouter();
  const elevated = RISK_CATEGORIES.filter((r) => r.status === "Elevated").length;
  const managed = RISK_CATEGORIES.filter((r) => r.status === "Managed").length;
  const stable = RISK_CATEGORIES.filter((r) => r.status === "Stable").length;
  const top = RISK_CATEGORIES.filter((r) => TOP_CATEGORIES.includes(r.id));

  return (
    <>
      <BusinessPageHeader
        eyebrow="Compliance & Risk"
        title="Regulatory Risk"
        description="Regulatory risk categories, severity and impact at a glance."
      />

      <AiInsightCard
        module="regulatory-risk"
        title="AI Regulatory Risk Brief"
        description="AI summary of elevated categories and recommended risk focus areas."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-lg border border-line bg-white p-5 dark:bg-ink-soft">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Risk Overview</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-warning tabular-nums">{elevated}</span>
            <span className="mb-1 text-xs text-ink-faint">elevated out of {RISK_CATEGORIES.length} categories</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="amber" size="sm">{elevated} Elevated</Badge>
            <Badge variant="blue" size="sm">{managed} Managed</Badge>
            <Badge variant="green" size="sm">{stable} Stable</Badge>
          </div>
        </div>
        <CompactMetric label="Elevated Categories" value={elevated} hint="Require active monitoring" icon={ShieldAlert} iconClassName="text-warning" />
        <CompactMetric label="Managed Risks" value={managed} hint="Controlled via existing measures" icon={Crosshair} iconClassName="text-primary" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {top.map((r) => (
          <div key={r.id} className="rounded-lg border border-line bg-white p-4 dark:bg-ink-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{r.category}</h3>
                  <Badge variant={STATUS_VARIANTS[r.status] || "neutral"} size="sm">{r.status}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink-subtle">{r.summary}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-faint">Severity <Badge variant={SEVERITY_VARIANTS[r.severity] || "neutral"} size="sm">{r.severity}</Badge></span>
              <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-faint">Probability <Badge variant={SEVERITY_VARIANTS[r.probability] || "neutral"} size="sm">{r.probability}</Badge></span>
              <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-faint">Impact <Badge variant={SEVERITY_VARIANTS[r.impact] || "neutral"} size="sm">{r.impact}</Badge></span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push("/business/risk-analysis")}>
          View Detailed Risk Analysis <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}

RegulatoryRiskPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};