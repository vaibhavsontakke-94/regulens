import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Fingerprint,
  Gauge,
  Globe,
  Landmark,
  Scale,
  Target,
} from "lucide-react";
import Badge from "@/components/ui/Badge";

const STAGES = [
  {
    icon: Scale,
    label: "REGULATION",
    caption: "Applicable rules & changes",
    status: "Analyzed",
    tone: "blue",
  },
  {
    icon: Activity,
    label: "IMPACT",
    caption: "Affected businesses & problems",
    status: "Assessed",
    tone: "blue",
  },
  {
    icon: Target,
    label: "ACTION",
    caption: "Responses & policies",
    status: "Planned",
    tone: "blue",
  },
  {
    icon: CheckCircle2,
    label: "OUTCOME",
    caption: "Implementation verification",
    status: "In review",
    tone: "green",
  },
];

const META = [
  { icon: Globe, label: "Jurisdiction", value: "Illustrative" },
  { icon: Gauge, label: "Impact", value: "Assessed" },
  { icon: Fingerprint, label: "Confidence", value: "High" },
];

export default function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-[28px] bg-primary-soft/60 blur-2xl" aria-hidden="true" />

      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card-hover">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line bg-surface-muted/70 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary text-primary-text" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="8.6" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3.4v5.6M12 15v5.6M3.4 12H9M15 12h5.6" />
              </svg>
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-wide text-content">REGULENS INTELLIGENCE</span>
              <span className="text-[11px] text-content-muted">Analysis workspace</span>
            </div>
          </div>
          <Badge variant="green" size="sm" dot>
            Live analysis
          </Badge>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-col">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.label}>
                  <div className="flex items-center gap-3.5 rounded-panel border border-line bg-surface p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${
                        stage.tone === "green" ? "bg-success-soft text-success" : "bg-primary-soft text-primary"
                      }`}
                      aria-hidden="true"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[13px] font-semibold tracking-wide text-content">{stage.label}</span>
                      <span className="truncate text-[12px] text-content-muted">{stage.caption}</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
                        stage.tone === "green"
                          ? "bg-success-soft text-success"
                          : "bg-surface-muted text-content-secondary"
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>

                  {index < STAGES.length - 1 && (
                    <div className="flex flex-col items-center py-1.5" aria-hidden="true">
                      <span className="h-3.5 w-px bg-line-strong" />
                      <ChevronDown className="h-3.5 w-3.5 -mt-0.5 text-content-muted" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-line pt-4">
            {META.map((meta) => {
              const Icon = meta.icon;
              return (
                <div key={meta.label} className="flex min-w-0 flex-col gap-1">
                  <span className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-content-muted">
                    <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{meta.label}</span>
                  </span>
                  <span className="truncate text-xs font-semibold text-content">{meta.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}