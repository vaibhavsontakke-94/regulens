import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cx } from "@/lib/utils";
import ProgressBar from "@/components/business/ui/ProgressBar";

function swipeColor(score) {
  if (score >= 75) return "bg-success";
  if (score >= 55) return "bg-warning";
  return "bg-danger";
}

function textColor(score) {
  if (score >= 75) return "text-success";
  if (score >= 55) return "text-warning";
  return "text-danger";
}

export default function ScoreCard({ label, score, status, icon: Icon, href, risk, className }) {
  const displayScore = risk ? 100 - Math.max(0, Math.min(100, score)) : score;
  return (
    <Link
      href={href || "#"}
      className={cx(
        "group flex flex-col gap-4 rounded-lg border border-line bg-white p-4 transition-all",
        "hover:border-primary/40 hover:shadow-sm dark:bg-ink-soft dark:hover:border-primary/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && <span className={cx("flex h-8 w-8 items-center justify-center rounded-md border border-line bg-primary-soft/60", textColor(displayScore))}><Icon className="h-4 w-4" aria-hidden="true" /></span>}
          <span className="text-sm font-semibold text-ink">{label}</span>
        </div>
        <span className={cx("text-2xl font-semibold tabular-nums", textColor(displayScore))}>{score}</span>
      </div>

      <ProgressBar value={displayScore} tone={swipeColor(displayScore)} />

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-ink-subtle">{status || "On track"}</span>
        {href && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
      </div>
    </Link>
  );
}