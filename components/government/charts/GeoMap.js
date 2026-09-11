import Badge from "@/components/ui/Badge";
import { SEVERITY_META } from "@/lib/mockData";

const AREA_POSITIONS = {
  "Lagos": { x: 56, y: 68 },
  "Abuja": { x: 50, y: 50 },
  "Kano": { x: 48, y: 22 },
  "Kaduna": { x: 46, y: 32 },
  "Port Harcourt": { x: 62, y: 62 },
  "Onne": { x: 63, y: 64 },
  "Ibadan": { x: 50, y: 62 },
  "Ogun": { x: 48, y: 66 },
  "Enugu": { x: 60, y: 52 },
  "Plateau": { x: 54, y: 42 },
  "Rivers": { x: 63, y: 60 },
  "Federal": { x: 50, y: 48 },
  "National": { x: 50, y: 48 },
};

const SEVERITY_DOT = {
  Critical: "bg-danger",
  High: "bg-warning",
  Medium: "bg-primary",
  Low: "bg-success",
};

export default function GeoMap({ regions = [], severityByArea = {}, businessConcentration }) {
  return (
    <div className="relative rounded-card border border-line bg-surface p-4 shadow-card">
      <svg
        viewBox="0 0 100 90"
        className="w-full"
        role="img"
        aria-label="Illustrative geographic map"
      >
        <title>Illustrative geographic map</title>
        {/* Abstract Nigeria outline */}
        <path
          d="M25 20 L28 12 L38 8 L48 10 L58 8 L65 12 L75 20 L82 30 L85 45 L82 60 L78 68 L68 75 L56 82 L42 82 L34 76 L28 65 L25 52 L22 38 Z"
          fill="var(--color-surface-muted)"
          stroke="var(--color-line)"
          strokeWidth="0.8"
        />
        {/* Region dots */}
        {regions.map((area) => {
          const pos = AREA_POSITIONS[area];
          if (!pos) return null;
          const sev = severityByArea[area] || "Low";
          const dotClass = SEVERITY_DOT[sev] || SEVERITY_DOT.Low;
          return (
            <g key={area}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="1.8"
                className={dotClass}
                style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,.25))" }}
              />
              <text
                x={pos.x}
                y={pos.y + 4.2}
                textAnchor="middle"
                className="fill-ink text-[2.2px]"
                fontWeight="500"
              >
                {area}
              </text>
            </g>
          );
        })}
      </svg>

      {regions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-ink-faint">No geographic data</span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-4">
          {Object.entries(SEVERITY_DOT).map(([sev, cls]) => (
            <span key={sev} className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
              <span className={`h-2 w-2 rounded-full ${cls}`} />
              {sev}
            </span>
          ))}
        </div>
        <span className="rounded bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-faint">
          Illustrative geographic view
        </span>
      </div>
      {businessConcentration && (
        <p className="mt-2 text-xs text-ink-faint">{businessConcentration}</p>
      )}
    </div>
  );
}