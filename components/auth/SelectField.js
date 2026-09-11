import { AlertCircle, ChevronDown } from "lucide-react";
import { INPUT_BASE, inputStateClass } from "@/components/auth/FormField";
import { cx } from "@/lib/utils";

export default function SelectField({
  id,
  label,
  error,
  required = false,
  value,
  onChange,
  options,
  placeholder,
  hint,
  disabled,
}) {
  const showError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-content">
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
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? `${id}-error` : undefined}
          className={cx(INPUT_BASE, "appearance-none pr-10 truncate", !value && "text-content-muted")}
        >
          <option value="" disabled>
            {placeholder || "Select an option"}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-content">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-content-muted"
          aria-hidden="true"
        />
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