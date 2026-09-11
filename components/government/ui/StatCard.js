import { cx } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  iconTone = "text-primary",
  badge,
  className,
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">{label}</span>
        {Icon && (
          <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-surface-muted", iconTone)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-ink">{value}</span>
        {badge && <span className="text-sm">{badge}</span>}
        {trend && (
          <span
            className={cx(
              "text-xs font-semibold",
              trend.direction === "up" ? "text-warning" : "text-success"
            )}
          >
            {trend.direction === "up" ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {hint && <p className="text-xs leading-relaxed text-ink-faint">{hint}</p>}
    </div>
  );
}