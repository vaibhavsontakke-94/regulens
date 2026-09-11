const SEGMENT_TONES = {
  danger: "bg-danger",
  warning: "bg-warning",
  primary: "bg-primary",
  success: "bg-success",
  neutral: "bg-ink-faint",
};

export default function SegmentBar({ segments, className, showValues = true, height = "h-2.5" }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) {
    return (
      <div className={`flex w-full items-center gap-3 ${className}`}>
        <div
          role="img"
          aria-label="No data"
          className={`w-full rounded-full bg-surface-muted ${height}`}
        />
        <span className="shrink-0 text-xs text-ink-faint">—</span>
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      <div className="flex w-full overflow-hidden rounded-full" role="img" aria-label="Distribution bar">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div
              key={s.tone}
              className={`${SEGMENT_TONES[s.tone] || SEGMENT_TONES.neutral} ${height} transition-all`}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${s.value}`}
            />
          ))}
      </div>
      {showValues && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {segments.map((s) => (
            <span key={s.tone} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-sm ${SEGMENT_TONES[s.tone] || SEGMENT_TONES.neutral}`} />
              <span className="font-medium text-ink">{s.label}</span>
              <span className="text-ink-faint">{s.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}