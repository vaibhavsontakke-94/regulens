import { CheckCircle2 } from "lucide-react";
import { passwordRequirements, passwordStrength, STRENGTH_LABELS } from "@/lib/validators";
import { cx } from "@/lib/utils";

const RULES = [
  { key: "length", label: "8+ characters" },
  { key: "lower", label: "Lowercase letter" },
  { key: "upper", label: "Uppercase letter" },
  { key: "number", label: "Number" },
];

const SEGMENT_COLORS = ["bg-danger", "bg-warning", "bg-success", "bg-success"];
const SEGMENT_TEXT = ["text-danger", "text-warning", "text-success", "text-success"];

export default function PasswordStrength({ value }) {
  const v = String(value || "");
  if (!v) return null;

  const score = passwordStrength(v);
  const requirements = passwordRequirements(v);
  const label = STRENGTH_LABELS[score];

  return (
    <div className="flex flex-col gap-2" aria-hidden="false">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cx(
                "h-1 flex-1 rounded-full transition-colors",
                index < score ? SEGMENT_COLORS[index] : "bg-line"
              )}
            />
          ))}
        </div>
        <span className={cx("text-xs font-medium", SEGMENT_TEXT[Math.max(score - 1, 0)] ?? "text-content-muted")}>
          {label}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {RULES.map((rule) => {
          const met = requirements[rule.key];
          return (
            <li
              key={rule.key}
              className={cx(
                "flex items-center gap-1.5 text-[12px] font-medium transition-colors",
                met ? "text-success" : "text-content-muted"
              )}
            >
              <CheckCircle2 className={cx("h-3.5 w-3.5 shrink-0", met ? "text-success" : "text-line-strong")} aria-hidden="true" />
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}