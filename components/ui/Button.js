import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cx } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-primary text-primary-text shadow-sm hover:bg-primary-hover hover:shadow-cta active:bg-primary-hover",
  soft: "bg-primary-soft text-primary hover:bg-primary-soft-strong",
  outline:
    "border border-line bg-surface text-content hover:border-line-strong hover:bg-surface-muted",
  ghost: "text-content-secondary hover:bg-surface-muted hover:text-content",
  white:
    "bg-white text-content shadow-card hover:bg-surface-muted",
  danger:
    "bg-danger text-white shadow-sm hover:bg-danger/90 active:bg-danger/90",
};

const SIZES = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-[15px] rounded-[12px]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-control transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

export default function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ariaLabel,
  loading = false,
  disabled = false,
  ...props
}) {
  const classes = cx(BASE, VARIANTS[variant], SIZES[size], className);

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );

  const isDisabled = disabled || loading;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel} aria-disabled={isDisabled} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} aria-label={ariaLabel} disabled={isDisabled} {...props}>
      {content}
    </button>
  );
}