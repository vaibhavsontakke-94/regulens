import { cx } from "@/lib/utils";

export default function ProcessStep({ index, icon: Icon, title, description, isLast = false }) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className="flex flex-col items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-panel border border-line bg-surface shadow-card" aria-hidden="true">
          <Icon className="h-6 w-6 text-primary" />
        </span>
        <span className="mt-3 text-xs font-semibold tracking-widest text-content-muted">
          {index}
        </span>
        <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-content">{title}</h3>
        <p className="mt-1.5 max-w-[240px] text-sm leading-relaxed text-content-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}