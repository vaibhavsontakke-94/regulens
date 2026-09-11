import { cx } from "@/lib/utils";

export default function Tabs({ items, value, onChange, className }) {
  return (
    <div className={cx("flex w-full items-center gap-1 overflow-x-auto border-b border-line", className)}>
      {items.map((item) => {
        const active = item.value === value;
        const ItemIcon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange?.(item.value)}
            className={cx(
              "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-ink-subtle hover:border-line hover:text-ink"
            )}
          >
            {ItemIcon && (
              <ItemIcon className={cx("h-4 w-4", active ? "text-primary" : "text-ink-faint")} aria-hidden="true" />
            )}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cx(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  active ? "bg-primary-soft text-primary" : "bg-surface-muted text-ink-faint"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}