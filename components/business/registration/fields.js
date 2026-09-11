import { useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { cx } from "@/lib/utils";

const inputClasses =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-transparent";

export function Field({ label, required, error, hint, children, className }) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-ink">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return <input className={inputClasses} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function AreaInput({ value, onChange, rows = 3, ...rest }) {
  return <textarea className={inputClasses} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function SelectInput({ value, onChange, options, placeholder = "Select…", ...rest }) {
  return (
    <div className="relative">
      <select className={cx(inputClasses, "appearance-none pr-9", !value && "text-ink-faint")} value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
    </div>
  );
}

export function ChipInput({ label, value, onChange, placeholder = "Type and press Enter", options, className }) {
  const [draft, setDraft] = useState("");

  function add(choice) {
    const item = String(choice || "").trim();
    if (!item) return;
    if (!value.includes(item)) onChange([...value, item]);
  }

  function remove(item) {
    onChange(value.filter((i) => i !== item));
  }

  return (
    <Field label={label} className={className}>
      {options && options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => (value.includes(option) ? remove(option) : add(option))}
              className={cx(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                value.includes(option)
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-white text-ink-subtle hover:border-primary/40 hover:text-primary dark:bg-transparent"
              )}
            >
              {value.includes(option) && <Check className="mr-1 inline h-3 w-3" aria-hidden="true" />}
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          className={inputClasses}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            add(draft);
            setDraft("");
          }}
          className="flex shrink-0 items-center gap-1 rounded-md border border-line px-3 py-2 text-xs font-medium text-ink-subtle transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink">
              {item}
              <button type="button" onClick={() => remove(item)} aria-label={`Remove ${item}`} className="text-ink-faint hover:text-danger">
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}