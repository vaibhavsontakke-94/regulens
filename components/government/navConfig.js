import {
  BookOpenCheck,
  Building2,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  Map,
  Scale,
  Search,
  Sparkles,
} from "lucide-react";

export const GOVERNMENT_NAV = [
  {
    group: "Workspace",
    items: [
      { label: "Search Problem", href: "/government/search-problem", icon: Search },
      { label: "Command Center", href: "/government", icon: LayoutDashboard, exact: true },
      { label: "Businesses", href: "/government/businesses", icon: Building2 },
      { label: "Regulations", href: "/government/regulations", icon: Scale },
      { label: "Policies", href: "/government/policies", icon: BookOpenCheck },
      { label: "Solutions", href: "/government/solutions", icon: Lightbulb },
      { label: "Test & Scale", href: "/government/test-and-scale", icon: FlaskConical },
      { label: "Ground Intelligence", href: "/government/ground-intelligence", icon: Map },
    ],
  },
  {
    group: "Tools",
    items: [
      { label: "Government Copilot", href: "/government/copilot", icon: Sparkles },
    ],
  },
];

export const GOV_SYSTEM_LINKS = [
  { label: "Profile", href: "/government/profile", icon: Landmark },
  { label: "Settings", href: "/government/profile", icon: Landmark },
];

export function isGovNavActive(pathname, item, exact) {
  if (exact) return pathname === item.href;
  return pathname.startsWith(item.href);
}