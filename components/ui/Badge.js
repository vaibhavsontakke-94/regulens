import { cx } from "@/lib/utils";

const VARIANTS = {
  neutral: "bg-surface-muted text-content-secondary",
  blue: "bg-primary-soft text-primary",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  outline: "border border-line bg-transparent text-content-secondary",
  white: "bg-white text-content border border-line",
};

const SIZES = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full font-semibold tracking-wide uppercase",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50"
            style={{ animationDuration: "2.4s" }}
          />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}