import Link from "next/link";
import { Activity, ChevronDown, Scale, Target } from "lucide-react";

const STAGES = [
  { icon: Scale, label: "Regulation" },
  { icon: Activity, label: "Impact" },
  { icon: Target, label: "Action" },
];

export default function BrandVisual() {
  return (
    <div className="max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">
          Intelligence flow
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" style={{ animationDuration: "2.4s" }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Simulated
        </span>
      </div>

      <div className="mt-4 flex flex-col">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <div key={stage.label} className="relative flex gap-3.5 pl-5">
              <span
                className="absolute top-0 bottom-0 left-[13px] w-px bg-white/15"
                aria-hidden="true"
                style={{ display: index === STAGES.length - 1 ? "none" : "block" }}
              />
              <span
                className="absolute top-2 left-0 flex h-[27px] w-[27px] items-center justify-center rounded-[8px] bg-white/10 text-white"
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="-mb-px flex flex-1 items-center justify-between gap-3 border-b border-white/10 py-3">
                <span className="text-sm font-medium text-white/90">{stage.label}</span>
                <span className="flex items-center gap-1 text-[11px] text-white/45">
                  {index < STAGES.length - 1 ? (
                    <>
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                      Analyzed
                    </>
                  ) : (
                    "Planned"
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}