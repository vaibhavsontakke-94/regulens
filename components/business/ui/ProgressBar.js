import { cx } from "@/lib/utils";

function toneClasses(tone) {
  if (tone === "success") return "bg-success";
  if (tone === "warning") return "bg-warning";
  if (tone === "danger") return "bg-danger";
  return "bg-primary";
}

export default function ProgressBar({ value, tone, className, showLabel }) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted dark:bg-surface-muted">
        <div
          className={cx("h-full rounded-full transition-all duration-500", toneClasses(tone))}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-semibold text-ink-subtle">{clamped}%</span>}
    </div>
  );
}