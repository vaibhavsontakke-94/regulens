import { FileText, Image as ImageIcon, FileSpreadsheet, FileArchive, AlertTriangle, CheckCircle2, RefreshCw, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cx } from "@/lib/utils";

const STATUS_META = {
  uploading: { label: "Uploading", variant: "amber", icon: Clock },
  analyzing: { label: "Analyzing", variant: "blue", icon: RefreshCw },
  complete: { label: "Analysis Complete", variant: "green", icon: CheckCircle2 },
  "needs-review": { label: "Needs Review", variant: "amber", icon: AlertTriangle },
  failed: { label: "Failed", variant: "red", icon: AlertTriangle },
};

function docIcon(type) {
  const ext = (type || "").toLowerCase();
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return FileSpreadsheet;
  if (ext === "jpg" || ext === "jpeg" || ext === "png") return ImageIcon;
  if (ext === "zip") return FileArchive;
  return FileText;
}

export default function DocumentCard({ doc, onOpen, onDelete, onRetry }) {
  const Icon = docIcon(doc.type);
  const meta = STATUS_META[doc.status] || STATUS_META.needsReview;
  const StatusIcon = meta.icon;
  const uploadingOrAnalyzing = doc.status === "uploading" || doc.status === "analyzing";

  return (
    <li
      className={cx(
        "group flex items-center gap-3 rounded-lg border border-line bg-white p-3.5 transition-colors dark:bg-ink-soft",
        doc.status === "needs-review" && "border-warning/40",
        doc.status === "failed" && "border-danger/40",
        doc.status === "complete" && "border-success/30"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(doc)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-surface-muted text-primary"
        aria-label={`Open ${doc.name}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>

      <button type="button" onClick={() => onOpen(doc)} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-ink">{doc.name}</span>
        <span className="block truncate text-xs text-ink-faint">
          {doc.type.toUpperCase()} · {doc.size} · {doc.date}
        </span>
        {uploadingOrAnalyzing && (
          <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-surface-muted">
            <span
              className={cx("block h-full", doc.status === "uploading" ? "bg-warning" : "bg-primary")}
              style={{ width: `${doc.progress || 0}%` }}
            />
          </span>
        )}
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={meta.variant} size="sm">
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {meta.label}
        </Badge>
        {doc.status === "failed" && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(doc)}
            className="rounded-md border border-line px-2 py-1 text-xs font-medium text-ink-subtle transition-colors hover:border-primary/40 hover:text-primary"
          >
            Retry
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(doc.id)}
            aria-label={`Delete ${doc.name}`}
            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}