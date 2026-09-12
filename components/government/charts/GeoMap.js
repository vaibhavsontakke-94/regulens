import Badge from "@/components/ui/Badge";
import { SEVERITY_META } from "@/lib/mockData";

const AREA_POSITIONS = {
  "India": { x: 46, y: 45 },
  "National": { x: 46, y: 45 },
  "Federal": { x: 46, y: 45 },
  "Delhi NCR": { x: 44, y: 17 },
  "Delhi": { x: 45, y: 16 },
  "Rajasthan": { x: 34, y: 28 },
  "Jaipur": { x: 36, y: 26 },
  "Punjab": { x: 40, y: 14 },
  "Haryana": { x: 42, y: 19 },
  "Gujarat": { x: 27, y: 38 },
  "Ahmedabad": { x: 28, y: 36 },
  "Madhya Pradesh": { x: 40, y: 37 },
  "Uttar Pradesh": { x: 55, y: 30 },
  "Lucknow": { x: 58, y: 28 },
  "Bihar": { x: 62, y: 30 },
  "West Bengal": { x: 66, y: 42 },
  "Kolkata": { x: 67, y: 44 },
  "Odisha": { x: 62, y: 52 },
  "Jharkhand": { x: 60, y: 38 },
  "Chhattisgarh": { x: 52, y: 46 },
  "Maharashtra": { x: 37, y: 46 },
  "Mumbai": { x: 29, y: 42 },
  "Pune": { x: 35, y: 47 },
  "Telangana": { x: 48, y: 53 },
  "Hyderabad": { x: 49, y: 52 },
  "Andhra Pradesh": { x: 54, y: 58 },
  "Karnataka": { x: 41, y: 58 },
  "Bengaluru": { x: 42, y: 56 },
  "Tamil Nadu": { x: 54, y: 64 },
  "Chennai": { x: 57, y: 62 },
  "Kerala": { x: 44, y: 68 },
  "Kochi": { x: 43, y: 67 },
  "Himachal Pradesh": { x: 46, y: 10 },
  "Uttarakhand": { x: 50, y: 14 },
  "Assam": { x: 72, y: 30 },
  "Goa": { x: 34, y: 60 },
  "Odisha": { x: 62, y: 52 },
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
        {/* Abstract India outline */}
        <path
          d="M22 30 L28 22 L38 12 L50 8 L62 12 L72 22 L78 34 L80 46 L76 58 L70 68 L62 76 L52 82 L44 80 L38 76 L32 68 L28 58 L24 46 L21 38 Z"
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