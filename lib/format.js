export function fmtNumber(value) {
  return new Intl.NumberFormat("en-NG", { notation: value >= 1000000 ? "compact" : "standard" }).format(value || 0);
}

export function fmtFullNumber(value) {
  return new Intl.NumberFormat("en-NG").format(value || 0);
}

export function fmtDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatCount(count) {
  return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(count || 0);
}