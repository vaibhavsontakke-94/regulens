import {
  BadgeCheck,
  Banknote,
  Camera,
  ClipboardCheck,
  Flag,
  Home,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Radio,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const BUSINESS_NAV = [
  { label: "Dashboard", href: "/business", icon: LayoutDashboard, exact: true },
  { label: "Business Profile", href: "/business/profile", icon: Home },
  { label: "Compliance", href: "/business/compliance", icon: ClipboardCheck },
  { label: "Risk", href: "/business/regulatory-risk", icon: ShieldAlert },
  { label: "Growth", href: "/business/growth", icon: TrendingUp },
  { label: "Certification Readiness", href: "/business/certifications", icon: BadgeCheck },
  { label: "Regulatory Intelligence", href: "/business/regulatory-intelligence", icon: Radio },
  { label: "Compliance Management", href: "/business/compliance-management", icon: ListChecks },
  { label: "Financial Impact", href: "/business/financial-impact", icon: Banknote },
  { label: "Government Schemes", href: "/business/government-schemes", icon: Landmark },
  { label: "Report a Problem", href: "/business/report-problem", icon: Flag },
  { label: "Evidence", href: "/business/evidence", icon: Camera },
  { label: "REGULENS Copilot", href: "/business/copilot", icon: Sparkles },
];

export function isBizNavActive(pathname, item, exact) {
  if (exact) return pathname === item.href;
  return pathname.startsWith(item.href);
}