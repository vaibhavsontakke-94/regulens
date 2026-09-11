import { cx } from "@/lib/utils";

const LANGUAGES = [
  { value: "english", label: "English", icon: "🇺🇸" },
  { value: "hindi", label: "Hindi", icon: "🇮🇳" },
  { value: "marathi", label: "Marathi", icon: "🇮🇳" },
];

export default function LanguageSelector({ onSelect, value }) {
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => {}}
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-label="Select language"
        className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        <span>{LANGUAGES.find((l) => l.value === value)?.icon || "🌐"}</span>
        <span className="font-medium text-ink truncate">English</span>
        <ChevronDown className="h-3 w-3 text-ink-faint ml-1" />
      </button>
      {value && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-panel border border-line bg-surface p-1 shadow-raised"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.value === value;
            return (
              <button
                key={lang.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(lang.value)}
                className={cx(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isSelected ? "bg-primary-soft text-primary" : "text-content-secondary hover:bg-surface-muted hover:text-content"
                )}
              >
                <span>{lang.icon}</span>
                <span className="font-medium truncate">{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}