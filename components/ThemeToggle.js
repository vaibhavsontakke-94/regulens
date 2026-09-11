import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cx } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = OPTIONS.find((o) => o.value === theme) || OPTIONS[0];
  const CurrentIcon = current.icon;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${current.label}. Open theme switcher`}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] text-content-secondary transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        <CurrentIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select theme"
          className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-panel border border-line bg-surface p-1 shadow-raised"
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = option.value === theme;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cx(
                  "flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-content-secondary hover:bg-surface-muted hover:text-content"
                )}
              >
                <Icon className={cx("h-4 w-4", active ? "text-primary" : "text-content-muted")} aria-hidden="true" />
                <span className="font-medium">{option.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}