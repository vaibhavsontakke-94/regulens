import { Sparkles } from "lucide-react";
import { cx } from "@/lib/utils";

export default function CopilotButton({ onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Open REGULENS Copilot"
      className={cx(
        "fixed bottom-4 right-4 z-50 flex items-center justify-center rounded-full bg-success text-white shadow-sm hover:bg-success/90 transition-colors",
        "h-14 w-14",
        "flex-shrink-0"
      )}
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );
}