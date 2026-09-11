import { FileText, AlertTriangle, CalendarClock, CheckSquare, Percent, Link2, Sparkles, X } from "lucide-react";
import Badge from "@/components/ui/Badge";

function Block({ title, icon: Icon, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-lg border border-line bg-white p-4 dark:bg-ink-soft">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-subtle">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DocumentAnalysis({ doc, onClose }) {
  const a = doc.analysis;
  return (
    <div className="mt-6 rounded-lg border border-line bg-surface-muted/30 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-primary dark:bg-ink-soft">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-ink">{doc.name}</h2>
            <p className="text-xs text-ink-faint">Analysis result</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close analysis"
          className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-md bg-primary-soft/40 px-3 py-2 text-xs text-primary">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        This is an AI-generated analysis. It does not constitute legal or regulatory advice.
      </div>

      {a.confidence && (
        <div className="mb-4 flex items-center gap-2 text-sm text-ink-subtle">
          <Percent className="h-4 w-4 text-primary" aria-hidden="true" />
          Analysis confidence: <span className="font-semibold text-ink">{a.confidence}%</span>
        </div>
      )}

      <div className="mb-4 rounded-lg border border-line bg-white p-4 text-sm leading-relaxed text-ink dark:bg-ink-soft">
        <h3 className="mb-1.5 font-semibold text-ink">Summary</h3>
        <p>{a.summary}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Block title="Key Information" icon={FileText} items={a.keyInformation} />
        <Block title="Compliance Relevance" icon={CheckSquare} items={a.complianceRelevance} />
        <Block title="Potential Risks" icon={AlertTriangle} items={a.potentialRisks} />
        <Block title="Missing Information" icon={FileText} items={a.missingInformation} />
        <Block title="Important Dates" icon={CalendarClock} items={a.importantDates} />
        <Block title="Recommended Actions" icon={CheckSquare} items={a.recommendedActions} />
      </div>

      {a.sources && a.sources.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link2 className="h-4 w-4 text-ink-faint" aria-hidden="true" />
          Source: 
          {a.sources.map((src) => (
            <Badge key={src} variant="neutral" size="sm">{src}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}