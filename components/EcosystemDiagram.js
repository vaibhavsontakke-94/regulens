import {
  Building2,
  FileCheck2,
  Landmark,
  Lightbulb,
  Scale,
  TriangleAlert,
} from "lucide-react";

const NODES = [
  { label: "Regulations", caption: "Rules & obligations", icon: Scale, x: 50, y: 15 },
  { label: "Government", caption: "Policy & decisions", icon: Landmark, x: 18, y: 38 },
  { label: "Businesses", caption: "Operations & compliance", icon: Building2, x: 82, y: 38 },
  { label: "Problems", caption: "Real-world impact", icon: TriangleAlert, x: 32, y: 66 },
  { label: "Solutions", caption: "Responses & actions", icon: Lightbulb, x: 68, y: 66 },
  { label: "Evidence", caption: "Verified ground truth", icon: FileCheck2, x: 50, y: 86 },
];

const LINES = [
  [50, 15, 50, 38],
  [18, 38, 50, 38],
  [82, 38, 50, 38],
  [18, 38, 32, 66],
  [82, 38, 68, 66],
  [32, 66, 68, 66],
  [32, 66, 50, 86],
  [68, 66, 50, 86],
];

export function MobileEcosystem() {
  return (
    <ul className="flex flex-col">
      {NODES.map((node, index) => {
        const Icon = node.icon;
        const isLast = index === NODES.length - 1;
        return (
          <li key={node.label} className="relative flex gap-4 pl-8">
            <span
              className="absolute top-1 bottom-0 left-[13px] w-px bg-line"
              aria-hidden="true"
              style={{ display: isLast ? "none" : "block" }}
            />
            <span className="absolute top-1 left-0 z-10 flex h-[27px] w-[27px] items-center justify-center rounded-[8px] bg-primary-soft text-primary" aria-hidden="true">
              <Icon className="h-4 w-4" />
            </span>
            <div className="-mb-px flex flex-1 flex-col gap-0.5 border-b border-line py-4">
              <span className="text-[15px] font-semibold text-content">{node.label}</span>
              <span className="text-sm text-content-muted">{node.caption}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function EcosystemDiagram() {
  return (
    <div className="relative mx-auto hidden h-[400px] w-full max-w-3xl lg:block xl:max-w-4xl">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {LINES.map(([x1, y1, x2, y2], index) => (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--c-border-strong)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeDasharray={index < 3 ? "0" : "1 3"}
          />
        ))}
      </svg>

      {NODES.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="flex min-w-[160px] items-center gap-3 rounded-panel border border-line bg-surface px-4 py-3 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-primary-soft text-primary" aria-hidden="true">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-content">{node.label}</span>
                <span className="text-xs text-content-muted">{node.caption}</span>
              </div>
            </div>
          </div>
        );
      })}

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: "50%", top: "38%" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-surface shadow-card">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}