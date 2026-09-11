import { Pencil, Check, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cx } from "@/lib/utils";

export default function BusinessProfileSection({ title, description, icon: Icon, children, editable, editing, onStartEdit, onSave, onCancel, footer }) {
  return (
    <section className="rounded-lg border border-line bg-white dark:bg-ink-soft">
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-primary-soft/60 text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink-subtle">{description}</p>}
          </div>
        </div>
        {editable && !editing && (
          <Button variant="ghost" size="sm" onClick={onStartEdit}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
        )}
        {editable && editing && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Cancel
            </Button>
            <Button size="sm" onClick={onSave}>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Save
            </Button>
          </div>
        )}
      </header>

      <div className={cx("px-5 py-4", editing && "bg-surface-muted/40")}>{children}</div>
      {footer && <footer className="border-t border-line px-5 py-3">{footer}</footer>}
    </section>
  );
}