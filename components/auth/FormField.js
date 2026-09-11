import { AlertCircle } from "lucide-react";
import { cx } from "@/lib/utils";

export const INPUT_BASE =
  "h-11 w-full rounded-[10px] border bg-surface text-[15px] text-content placeholder:text-content-muted focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function inputStateClass(hasError) {
  return hasError
    ? "border-danger focus-within:border-danger"
    : "border-line focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20";
}

export default function FormField({
  id,
  label,
  hint,
  error,
  touched = true,
  required = false,
  leftIcon: Icon,
  trailing,
  className,
  fieldClassName,
  labelClass,
  ...props
}) {
  const showError = Boolean(error) && touched;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={cx("text-sm font-medium text-content", labelClass)}>
          {label}
          {required && (
            <span className="ml-0.5 text-primary" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {hint && <span className="text-xs text-content-muted">{hint}</span>}
      </div>

      <div className={cx("relative", inputStateClass(showError))}>
        {Icon && (
          <span className="pointer-events-none absolute top-0 bottom-0 left-3.5 flex items-center text-content-muted" aria-hidden="true">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <input
          id={id}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? `${id}-error` : undefined}
          required={required}
          className={cx(INPUT_BASE, "bg-transparent", Icon && "pl-10", trailing && "pr-11")}
          {...props}
        />
        {trailing && (
          <span className="absolute top-0 right-0 bottom-0 flex items-center pr-2">{trailing}</span>
        )}
      </div>

      {showError && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-[13px] font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}