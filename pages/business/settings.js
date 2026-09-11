import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Sun, Moon, Shield, Mail, Lock, LifeBuoy, Info, LogOut, Building2, User } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getSession, clearSession } from "@/lib/authSession";
import { useBusinessProfile } from "@/components/business/BusinessProfileContext";
import { cx } from "@/lib/utils";

const APPEARANCE_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System" },
];

const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

const NOTIFICATION_TOGGLES = [
  { key: "email", label: "Email Notifications", description: "Receive email summaries and alerts" },
  { key: "problem-updates", label: "Problem Updates", description: "Status changes on reported problems" },
  { key: "regulatory-updates", label: "Regulatory Updates", description: "New and updated regulations" },
  { key: "compliance-alerts", label: "Compliance Alerts", description: "Deadline and requirement alerts" },
  { key: "policy-updates", label: "Policy Updates", description: "Policy change notifications" },
  { key: "ground-verification", label: "Ground Verification", description: "Evidence verification status" },
];

const SECURITY_OPTIONS = [
  { key: "change-password", label: "Change Password" },
  { key: "two-factor", label: "Two-Factor Authentication" },
  { key: "active-sessions", label: "Active Sessions" },
  { key: "login-activity", label: "Login Activity" },
];

const PRIVACY_TOGGLES = [
  { key: "analytics", label: "Product Analytics", description: "Help us improve REGULENS" },
  { key: "sharing", label: "Third-Party Sharing", description: "Never share data with third parties" },
  { key: "retention", label: "Extended Data Retention", description: "Store records beyond legal minimums" },
];

const HELP_LINKS = [
  { label: "Documentation", href: "/business/help" },
  { label: "Contact Support", href: "/business/help" },
  { label: "Report a Bug", href: "/business/report-problem" },
];

export default function BusinessSettingsPage() {
  const router = useRouter();
  const { display } = useBusinessProfile();
  const [session, setSession] = useState(null);
  const [appearance, setAppearance] = useState("light");
  const [density, setDensity] = useState("comfortable");
  const [notifications, setNotifications] = useState({
    email: true,
    "problem-updates": true,
    "regulatory-updates": true,
    "compliance-alerts": true,
    "policy-updates": true,
    "ground-verification": true,
  });
  const [privacy, setPrivacy] = useState({ analytics: true, sharing: false, retention: false });

  useEffect(() => setSession(getSession()), []);

  const handleSignOut = () => {
    clearSession();
    router.push("/business/login");
  };

  function toggle(setter, key) {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <BusinessPageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Account, appearance, notifications, security and preferences."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Account" description="Your workspace account details">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-ink"><User className="h-4 w-4 text-ink-faint" aria-hidden="true" /> Account Name</span>
              <span className="text-sm text-ink-subtle">{session?.name || "Business User"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-ink"><Mail className="h-4 w-4 text-ink-faint" aria-hidden="true" /> Email</span>
              <span className="truncate text-sm text-ink-subtle">{session?.email || "No email on file"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-ink"><Building2 className="h-4 w-4 text-ink-faint" aria-hidden="true" /> Organisation</span>
              <span className="truncate text-sm text-ink-subtle">{display?.name || "Your Business"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="text-sm font-medium text-ink">Workspace</span>
              <Badge variant="green" size="sm">Business</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Appearance" description="Theme and display density">
          <div className="grid gap-3 sm:grid-cols-3">
            {APPEARANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cx(
                  "rounded-lg border border-line px-4 py-2.5 text-sm font-medium transition-colors",
                  appearance === opt.value ? "bg-success-soft text-success" : "text-ink-subtle hover:bg-surface-hover hover:text-ink"
                )}
                onClick={() => setAppearance(opt.value)}
              >
                <span className="flex items-center justify-center gap-2">
                  {opt.icon && <opt.icon className="h-4 w-4" aria-hidden="true" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-faint">A compact theme toggle is also available in the top bar.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cx(
                  "rounded-lg border border-line px-3.5 py-2 text-xs font-medium transition-colors",
                  density === opt.value ? "bg-success-soft text-success" : "text-ink-subtle hover:bg-surface-hover hover:text-ink"
                )}
                onClick={() => setDensity(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notifications" description="Choose what you want to hear about">
          <div className="space-y-3">
            {NOTIFICATION_TOGGLES.map((n) => (
              <button key={n.key} type="button" onClick={() => toggle(setNotifications, n.key)} className="flex w-full items-center justify-between rounded-lg border border-line px-4 py-3 text-left transition-colors hover:bg-surface-muted">
                <span>
                  <span className="block text-sm font-medium text-ink">{n.label}</span>
                  <span className="block text-[11px] text-ink-faint">{n.description}</span>
                </span>
                <Badge variant={notifications[n.key] ? "green" : "neutral"} size="sm">{notifications[n.key] ? "On" : "Off"}</Badge>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security" description="Protect your account">
          <div className="space-y-3">
            {SECURITY_OPTIONS.map((opt) => (
              <button key={opt.key} type="button" className="flex w-full items-center justify-between rounded-lg border border-line px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-surface-muted hover:text-ink">
                <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-ink-faint" aria-hidden="true" />{opt.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M5 12a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-4" /></svg>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Privacy" description="How your data is handled">
          <div className="space-y-3">
            {PRIVACY_TOGGLES.map((p) => (
              <button key={p.key} type="button" onClick={() => toggle(setPrivacy, p.key)} className="flex w-full items-center justify-between rounded-lg border border-line px-4 py-3 text-left transition-colors hover:bg-surface-muted">
                <span>
                  <span className="block text-sm font-medium text-ink">{p.label}</span>
                  <span className="block text-[11px] text-ink-faint">{p.description}</span>
                </span>
                <Badge variant={privacy[p.key] ? "green" : "neutral"} size="sm">{privacy[p.key] ? "On" : "Off"}</Badge>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Help & Support" description="Get assistance">
          <div className="space-y-2">
            {HELP_LINKS.map((link) => (
              <button key={link.label} type="button" onClick={() => router.push(link.href)} className="flex w-full items-center justify-between rounded-lg border border-line px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-surface-muted hover:text-ink">
                <span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-ink-faint" aria-hidden="true" />{link.label}</span>
                <span className="text-xs text-ink-faint">↗</span>
              </button>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-ink"><Lock className="h-4 w-4 text-ink-faint" aria-hidden="true" /> Data protection</span>
              <Badge variant="green" size="sm">Enabled</Badge>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="About REGULENS" description="Version information">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Info className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold text-ink">REGULENS Business Portal</p>
              <p className="text-xs text-ink-faint">Version 1.0 · Live workspace</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
            REGULENS provides regulatory intelligence, compliance tracking, risk analysis and growth guidance powered by your business profile.
          </p>
        </SectionCard>
      </div>
    </>
  );
}

BusinessSettingsPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};