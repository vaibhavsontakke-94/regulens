import { Check } from "lucide-react";
import { cx } from "@/lib/utils";

export default function RegistrationStepper({ steps, currentIndex }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={step.key} className="flex shrink-0 items-center gap-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={cx(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                    isDone && "border-success bg-success text-white",
                    isCurrent && "border-primary bg-primary-soft text-primary",
                    !isDone && !isCurrent && "border-line text-ink-faint"
                  )}
                >
                  {isDone ? <Check className="h-3 w-3" aria-hidden="true" /> : String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cx(
                    "hidden whitespace-nowrap text-[11px] font-medium sm:block",
                    isCurrent ? "text-ink" : isDone ? "text-ink-subtle" : "text-ink-faint"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && <span className={cx("mx-1 h-px w-4 sm:w-8", index < currentIndex ? "bg-success" : "bg-line")} />}
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.round(((currentIndex + 1) / steps.length) * 100)}%` }}
        />
      </div>
    </div>
  );
}