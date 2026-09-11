import { useRouter } from "next/router";
import { ArrowRight, Target, TrendingUp, Coins, Crosshair, Scale } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import CompactMetric from "@/components/business/ui/CompactMetric";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { EXPANSION_READINESS, HEALTH_SCORES } from "@/lib/businessData";

const CURRENT = {
  region: "Maharashtra, India",
  market: "Established operations",
  infrastructure: "Existing manufacturing facility",
  compliance: "Comprehensive compliance framework",
};

const TARGET = {
  region: "Abuja SEZ, Nigeria",
  market: "Large and growing domestic demand",
  infrastructure: "SEZ infrastructure with incentives",
  compliance: "Requires local regulatory navigation",
};

const STRATEGIC_NEEDS = [
  { label: "Market Analysis", status: "Essential", variant: "red" },
  { label: "Legal & Regulatory", status: "Essential", variant: "red" },
  { label: "Market Entry Structure", status: "Important", variant: "amber" },
  { label: "Supply Chain", status: "Important", variant: "amber" },
  { label: "Financial Resources", status: "Important", variant: "amber" },
];

export default function GrowthPage() {
  const router = useRouter();
  return (
    <>
      <BusinessPageHeader
        eyebrow="Growth"
        title="Growth Readiness"
        description="Current growth posture and expansion strategy assessment."
      />

      <div className="mb-6 rounded-lg border border-success/40 bg-success-soft/30 px-4 py-3 text-sm text-success">
        <strong>Demo data.</strong> Growth scores, costs and requirements are illustrative only.
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-white p-6 dark:bg-ink-soft">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-primary-soft/40">
            <span className="text-2xl font-bold text-primary tabular-nums">{EXPANSION_READINESS.readiness}%</span>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-ink">{EXPANSION_READINESS.label}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-subtle">{EXPANSION_READINESS.summary}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:col-span-2">
          <CompactMetric label="Growth Readiness" value={`${HEALTH_SCORES.growthReadiness}%`} hint="Overall growth readiness score" icon={TrendingUp} />
          <CompactMetric label="Strategic Initiatives" value="4" hint="Active strategic plans" icon={Target} />
        </div>
      </div>

      <SectionCard title="Current vs Target" description="How your current capabilities compare with the target expansion profile">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Region", current: CURRENT.region, target: TARGET.region, icon: Target },
            { label: "Market", current: CURRENT.market, target: TARGET.market, icon: TrendingUp },
            { label: "Infrastructure", current: CURRENT.infrastructure, target: TARGET.infrastructure, icon: Coins },
            { label: "Compliance", current: CURRENT.compliance, target: TARGET.compliance, icon: Scale },
          ].map((row) => (
            <div key={row.label} className="rounded-lg border border-line bg-white p-4 dark:bg-ink-soft">
              <div className="flex items-center gap-2">
                <row.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{row.label}</span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="rounded-md bg-success-soft/40 px-3 py-2">
                  <span className="block text-[10px] font-semibold uppercase text-success">Current</span>
                  <span className="text-sm font-medium text-ink">{row.current}</span>
                </div>
                <div className="rounded-md bg-primary-soft/40 px-3 py-2">
                  <span className="block text-[10px] font-semibold uppercase text-primary">Target</span>
                  <span className="text-sm font-medium text-ink">{row.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CompactMetric label="Readiness" value={`${EXPANSION_READINESS.readiness}%`} hint="Expansion readiness score" icon={Target} />
        <CompactMetric label="Estimated Cost" value="₦340M" hint="Total expansion investment" icon={Coins} />
        <CompactMetric label="Top Risk" value="Regulatory" hint="Local regulatory complexity" icon={Crosshair} iconClassName="text-danger" />
      </div>

      <SectionCard className="mt-6" title="Key Strategic Requirements" description="Core initiatives required for growth">
        <div className="flex flex-col gap-3">
          {STRATEGIC_NEEDS.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <Badge variant={item.variant} size="sm">{item.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => router.push("/business/expansion")}>
          Analyze Expansion <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}

GrowthPage.getLayout = (page) => <BusinessLayout>{page}</BusinessLayout>;