import { cx } from "@/lib/utils";

export default function CompactMetric({ label, value, hint, icon: Icon, iconClassName, className }) {
  return (
    <div className={cx("flex items-start gap-3 rounded-lg border border-line bg-white p-3.5 dark:bg-ink-soft", className)}>
      {Icon && (
        <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-primary-soft/60 text-primary", iconClassName)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="mt-0.5 truncate text-lg font-semibold text-ink">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-ink-subtle">{hint}</p>}
      </div>
    </div>
  );
}