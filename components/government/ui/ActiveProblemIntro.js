import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cx } from "@/lib/utils";

const BAR_COLORS = {
  amber: "bg-warning",
  blue: "bg-primary",
  neutral: "bg-surface-muted",
  red: "bg-danger",
};

export function PriorityScoreViz({ score, label, variant = "amber", size = "md", showBar = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-baseline gap-1">
        <span className={cx("font-semibold tracking-tight text-ink", size === "lg" ? "text-3xl" : "text-xl")}>{score}</span>
        <span className="text-xs text-ink-faint">/ 100</span>
      </div>
      {showBar && (
        <div className={cx("w-16 overflow-hidden rounded-full bg-surface-muted", size === "lg" ? "h-2" : "h-1.5")}>
          <div className={cx("h-full rounded-full", BAR_COLORS[variant])} style={{ width: `${score}%` }} />
        </div>
      )}
      {label && (
        <Badge variant={variant} size="sm">
          {label} Priority
        </Badge>
      )}
    </div>
  );
}

export default function ActiveProblemIntro({ problem, showLink = true, action }) {
  if (!problem) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      <Badge variant="blue" size="sm">Active Problem</Badge>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
        {problem.id} · {problem.title}
      </p>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs text-ink-faint">
          Priority <span className="font-semibold text-ink">{problem.priorityScore}/100</span> · {problem.priorityLevel}
        </span>
        <Badge variant="amber" size="sm">{problem.status}</Badge>
        {showLink && (action ? action : <Button variant="outline" size="sm" href="/government/search-problem">Change Problem</Button>)}
      </div>
    </div>
  );
}