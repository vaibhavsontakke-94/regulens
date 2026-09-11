import { useRouter } from "next/router";
import {
  HeartPulse,
  ClipboardCheck,
  ShieldAlert,
  TrendingUp,
  BadgeCheck,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import ScoreCard from "@/components/business/ui/ScoreCard";
import Button from "@/components/ui/Button";
import { useBusinessProfile } from "@/components/business/BusinessProfileContext";
import { HEALTH_SCORES } from "@/lib/businessData";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const CARDS = [
  {
    label: "Business Health",
    score: HEALTH_SCORES.overall,
    status: HEALTH_SCORES.label || "On track",
    icon: HeartPulse,
    href: "/business/health",
  },
  {
    label: "Compliance",
    score: HEALTH_SCORES.compliance,
    status: "Compliant",
    icon: ClipboardCheck,
    href: "/business/compliance",
  },
  {
    label: "Regulatory Risk",
    score: HEALTH_SCORES.risk,
    status: "Stable",
    icon: ShieldAlert,
    href: "/business/regulatory-risk",
    risk: true,
  },
  {
    label: "Growth Readiness",
    score: HEALTH_SCORES.growthReadiness,
    status: "Expansion ready",
    icon: TrendingUp,
    href: "/business/growth",
  },
  {
    label: "Certification Readiness",
    score: 78,
    status: "3 of 6 active",
    icon: BadgeCheck,
    href: "/business/certifications",
  },
];

const QUICK_ACTIONS = [
  { label: "Business Profile", href: "/business/profile", icon: Building2 },
  { label: "Growth", href: "/business/growth", icon: TrendingUp },
  { label: "Compliance", href: "/business/compliance", icon: ClipboardCheck },
  { label: "Risk Analysis", href: "/business/risk-analysis", icon: ShieldAlert },
];

export default function BusinessDashboard() {
  const router = useRouter();
  const { display, completion, isRegistered } = useBusinessProfile();

  return (
    <>
      <BusinessPageHeader
        eyebrow="Business Intelligence"
        title={`${greeting()}, ${display?.name || "there"}`}
        description={
          isRegistered
            ? "Here's how your business is tracking across compliance, risk, health and growth."
            : "Set up your Business Profile to personalize your regulatory intelligence."
        }
      />

      <div className="mb-6 rounded-lg border border-warning/40 bg-warning-soft/30 px-4 py-3 text-sm text-warning">
        <strong>Demo workspace.</strong> All data, KPIs, scores and metrics are illustrative only. No real business information is presented.
      </div>

      {!isRegistered && (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4 rounded-lg border border-primary/30 bg-white p-6 dark:bg-ink-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-primary-soft/60 text-primary">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Create your Business Profile</h2>
              <p className="mt-1 max-w-md text-sm text-ink-subtle">
                A single profile powers every REGULENS module — compliance, risk, growth and certification intelligence. It takes about 2 minutes.
              </p>
            </div>
            <Button size="lg" onClick={() => router.push("/business/register-business")}>
              Create Business Profile <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-xs text-ink-faint">Profile completion: {completion}%</p>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 rounded-lg border border-line bg-white p-6 dark:bg-ink-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-soft text-success">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-ink">REGULENS Copilot</h2>
            <p className="text-sm text-ink-subtle">Check compliance, analyze documents, identify risks and explore expansion opportunities.</p>
            <Button variant="outline" size="sm" onClick={() => router.push("/business/copilot")}>
              Open Copilot
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                type="button"
                onClick={() => router.push(action.href)}
                className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 text-left text-sm font-medium text-ink shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-surface-muted text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CARDS.map((card) => (
          <ScoreCard
            key={card.label}
            label={card.label}
            score={card.score}
            status={card.status}
            icon={card.icon}
            href={card.href}
            risk={card.risk}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-faint">
        All KPIs, scores and metrics are illustrative demo data only.
      </p>
    </>
  );
}

BusinessDashboard.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};