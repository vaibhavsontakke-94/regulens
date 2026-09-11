import { ArrowRight, CheckCircle2, HeartPulse } from "lucide-react";
import { useRouter } from "next/router";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import CompactMetric from "@/components/business/ui/CompactMetric";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/business/ui/ProgressBar";
import { useWorkspace } from "@/components/business/WorkspaceContext";
import { cx } from "@/lib/utils";

const HEALTH_AREAS = [
  { key: "compliance", label: "Compliance", description: "Adherence to regulatory requirements." },
  { key: "risk", label: "Risk", description: "Current risk exposure level." },
  { key: "operations", label: "Operations", description: "Operational efficiency and readiness." },
  { key: "financialExposure", label: "Financial Exposure", description: "Financial risk and exposure level." },
  { key: "growthReadiness", label: "Growth Readiness", description: "Readiness for expansion and growth." },
];

function tone(score) {
  if (score >= 75) return { text: "text-success", label: "Strong" };
  if (score >= 55) return { text: "text-warning", label: "Moderate" };
  return { text: "text-danger", label: "Attention" };
}

export default function BusinessHealthPage() {
  const router = useRouter();
  const { data } = useWorkspace();
  const HEALTH_SCORES = data.healthScores;
  const overall = HEALTH_SCORES.overall;
  const t = tone(overall);

  return (
    <>
      <BusinessPageHeader
        eyebrow="Intelligence"
        title="Business Health"
        description="Composite health across compliance, risk, operations, financial and growth dimensions, generated from your registered business profile."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col justify-center gap-2 rounded-lg border border-line bg-white p-5 dark:bg-ink-soft">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Overall Health</span>
          <div className="flex items-end gap-2">
            <span className={cx("text-3xl font-semibold tabular-nums", t.text)}>{overall}%</span>
            <span className={cx("mb-1 text-sm font-medium", t.text)}>{HEALTH_SCORES.label}</span>
          </div>
          <ProgressBar value={overall} />
          <p className="mt-2 text-xs leading-relaxed text-ink-subtle">{HEALTH_SCORES.summary}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <CompactMetric label="Compliant" value={`${HEALTH_SCORES.compliance}%`} hint="Compliance score" icon={CheckCircle2} />
          <CompactMetric label="Ready to Grow" value={`${HEALTH_SCORES.growthReadiness}%`} hint="Growth readiness score" icon={ArrowRight} />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white dark:bg-ink-soft">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Score Breakdown</h2>
          <p className="mt-0.5 text-xs text-ink-subtle">How your business performs across each dimension.</p>
        </div>
        <ul className="divide-y divide-line">
          {HEALTH_AREAS.map((area) => {
            const score = HEALTH_SCORES[area.key];
            const areaTone = tone(score);
            return (
              <li key={area.key} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-muted text-primary">
                      <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-ink">{area.label}</span>
                  </div>
                  <span className="flex items-center gap-2">
                    <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-semibold", areaTone.label === "Strong" ? "bg-success-soft text-success" : areaTone.label === "Moderate" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger")}>
                      {areaTone.label}
                    </span>
                    <span className={cx("w-10 text-right text-sm font-semibold tabular-nums", areaTone.text)}>{score}%</span>
                  </span>
                </div>
                <ProgressBar value={score} className="mt-2" />
                <p className="mt-1.5 text-xs text-ink-faint">{area.description}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => router.push("/business/compliance")}>
          View Compliance Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}

BusinessHealthPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};