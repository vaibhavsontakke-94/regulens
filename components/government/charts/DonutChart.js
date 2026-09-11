import { useState } from "react";

const SEGMENT_COLORS = {
  danger: { light: "#ef4444", dark: "#f87171" },
  warning: { light: "#f59e0b", dark: "#fbbf24" },
  primary: { light: "#2563eb", dark: "#60a5fa" },
  success: { light: "#16a34a", dark: "#4ade80" },
  neutral: { light: "#64748b", dark: "#94a3b8" },
};

export default function DonutChart({
  segments,
  centerLabel,
  centerValue,
  innerRadius = 0.72,
  emptyFallback = "No data",
}) {
  const [active, setActive] = useState(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total <= 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: 180 }}>
        <RingProgress empty />
        <p className="text-sm text-ink-faint">{emptyFallback}</p>
      </div>
    );
  }

  const radius = 80;
  const thickness = 22;
  const circumference = 2 * Math.PI * radius;
  const gap = 1.5;

  let offset = 0;
  const arcs = segments
    .map((s) => {
      const frac = s.value / total;
      const arc = {
        ...s,
        color: SEGMENT_COLORS[s.tone] || SEGMENT_COLORS.neutral,
        frac: Math.max(frac, 0.001),
        start: offset,
        sweep: Math.max(frac * circumference - gap, 0.001),
      };
      offset += frac * circumference;
      return arc;
    })
    .filter((s) => s.value > 0);

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 180 }}
    >
      <svg viewBox="0 0 200 200" className="w-full max-w-[220px]" role="img" aria-label={centerLabel}>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-line)" strokeWidth={thickness} />
        {arcs.map((arc) => {
          const color = `var(--color-${arc.tone === "primary" ? "primary" : arc.tone})`;
          return (
            <circle
              key={arc.tone || arc.label}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={active === arc.tone ? color : color}
              strokeWidth={active === arc.tone ? thickness + 2 : thickness}
              strokeDasharray={`${arc.sweep} ${circumference - arc.sweep}`}
              strokeDashoffset={-arc.start}
              transform="rotate(-90 100 100)"
              strokeLinecap="butt"
              style={{ cursor: "pointer", opacity: active && active !== arc.tone ? 0.25 : 1 }}
              onMouseEnter={() => setActive(arc.tone)}
              onMouseLeave={() => setActive(null)}
            />
          );
        })}
        <text
          x="100"
          y="92"
          textAnchor="middle"
          className="fill-ink text-xl"
          fontSize="22"
          fontWeight="600"
        >
          {centerValue}
        </text>
        <text
          x="100"
          y="110"
          textAnchor="middle"
          className="fill-ink-faint"
          fontSize="10"
          fontWeight="500"
        >
          {centerLabel}
        </text>
      </svg>
      <Legend segments={segments} active={active} onHover={setActive} />
    </div>
  );
}

function RingProgress({ empty }) {
  return (
    <svg viewBox="0 0 200 200" className="w-28" role="img" aria-label="No data">
      <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-line)" strokeWidth="22" />
    </svg>
  );
}

function Legend({ segments, active, onHover }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      {segments.map((s) => (
        <div
          key={s.tone}
          className="flex items-center gap-1.5 text-xs"
          style={{ opacity: active && active !== s.tone ? 0.4 : 1 }}
          onMouseEnter={() => onHover?.(s.tone)}
          onMouseLeave={() => onHover?.(null)}
        >
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: `var(--color-${s.tone === "primary" ? "primary" : s.tone})` }}
          />
          <span className="font-medium text-ink">{s.label}</span>
          <span className="text-ink-faint">{s.value}</span>
        </div>
      ))}
    </div>
  );
}