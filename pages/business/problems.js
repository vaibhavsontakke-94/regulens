import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { MY_PROBLEMS, PROBLEM_LIFECYCLE } from "@/lib/businessData";
import { fmtDate } from "@/lib/format";

const STATUS_VARIANTS = {
  REPORTED: "neutral",
  ANALYZING: "blue",
  "SOLUTION PROPOSED": "amber",
  "UNDER REVIEW": "amber",
  APPROVED: "green",
  "IN PROGRESS": "blue",
  IMPLEMENTED: "green",
  "VERIFICATION PENDING": "blue",
  VERIFIED: "green",
  RESOLVED: "green",
  REOPENED: "red",
};

const SEVERITY_VARIANTS = {
  High: "red",
  Medium: "amber",
  Low: "green",
};

function LifecycleBar({ currentStatus }) {
  const currentIndex = PROBLEM_LIFECYCLE.indexOf(currentStatus);

  return (
    <div className="mb-4 overflow-x-auto">
      <div className="flex items-center gap-0 min-w-[700px]">
        {PROBLEM_LIFECYCLE.map((step, i) => {
          const isPast = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? "bg-success text-white"
                      : isPast
                      ? "bg-success-soft text-success"
                      : "bg-surface-muted text-ink-faint"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`mt-1 text-center text-[9px] font-medium leading-tight max-w-[60px] ${isCurrent ? "text-success" : isPast ? "text-ink-subtle" : "text-ink-faint"}`}>
                  {step}
                </span>
              </div>
              {i < PROBLEM_LIFECYCLE.length - 1 && (
                <div className={`mx-0.5 h-px w-4 ${i < currentIndex ? "bg-success" : "bg-line"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyProblemsPage() {
  return (
    <>
      <BusinessPageHeader
        eyebrow="Reporting"
        title="My Problems"
        description="Track the lifecycle of your reported problems from submission to resolution."
      />

      <SectionCard title="Lifecycle Overview" description="Problem status flow" className="mb-6">
        <div className="overflow-x-auto">
          <LifecycleBar currentStatus={MY_PROBLEMS[0]?.status || "REPORTED"} />
        </div>
      </SectionCard>

      <SectionCard title="Problems" description={`${MY_PROBLEMS.length} problems tracked`}>
        <div className="space-y-3">
          {MY_PROBLEMS.map((p) => {
            const lifecycleIndex = PROBLEM_LIFECYCLE.indexOf(p.status);
            return (
              <div key={p.id} className="rounded-lg border border-line px-4 py-3.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{p.title}</h3>
                      <Badge variant={STATUS_VARIANTS[p.status] || "neutral"} size="sm">{p.status}</Badge>
                      <Badge variant={SEVERITY_VARIANTS[p.severity] || "neutral"} size="sm">{p.severity}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-ink-faint">
                      <span>{p.id}</span>
                      <span>{p.category}</span>
                      <span>Updated {fmtDate(p.updated)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1">
                  {PROBLEM_LIFECYCLE.map((step, i) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= lifecycleIndex ? "bg-success" : "bg-surface-muted"
                      }`}
                      title={step}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </>
  );
}

MyProblemsPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};