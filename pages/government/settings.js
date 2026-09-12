import { useState } from "react";
import { useRouter } from "next/router";
import { Sun, Moon, Shield, Users, Mail, Phone, Settings, LogOut } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getSession, clearSession } from "@/lib/authSession";
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

export default function GovernmentSettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState(() => getSession());
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
  const [securitySection, setSecuritySection] = useState("change-password");

  useEffect(() => setSession(getSession()), []);
  const handleSignOut = () => {
    clearSession();
    router.push("/government/login");
  };

  function toggleNotification(key) {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Settings"
        description="Account and workspace configuration."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Appearance Section */}
        <SectionCard title="Appearance">
          <div className="grid gap-3 sm:grid-cols-2">
            {APPEARANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cx(
                  "rounded-lg border border-line px-4 py-2.5 text-sm font-medium transition-colors",
                  appearance === opt.value
                    ? "bg-primary-soft text-primary"
                    : "text-ink-subtle hover:bg-surface-hover hover:text-ink"
                )}
                onClick={() => setAppearance(opt.value)}
              >
                <span className="flex items-center gap-2">
                  {opt.icon && <opt.icon className="h-4 w-4" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            Density: {density === "comfortable" ? "Comfortable" : "Compact"}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cx(
                  "rounded-lg border border-line px-3.5 py-2 text-xs font-medium transition-colors",
                  density === opt.value
                    ? "bg-primary-soft text-primary"
                    : "text-ink-subtle hover:bg-surface-hover hover:text-ink"
                )}
                onClick={() => setDensity(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Notification Section */}
        <SectionCard title="Notifications">
          <div className="space-y-3">
            {NOTIFICATION_TOGGLES.map((n) => (
              <div key={n.key} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">{n.label}</span>
                  <span className="text-[10px] text-ink-faint">{n.description}</span>
                </div>
                <Badge
                  variant={notifications[n.key] ? "green" : "neutral"}
                  size="sm"
                  className="flex shrink-0"
                >
                  {notifications[n.key] ? "On" : "Off"}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Security Section */}
        <SectionCard title="Security">
          <div className="space-y-3">
            {SECURITY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className="w-full flex items-center justify-between rounded-lg border border-line px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-surface-muted hover:text-ink"
                onClick={() => setSecuritySection(opt.key)}
              >
                <span>{opt.label}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M5 12a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-4" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="12" y1="12" x2="20" y2="12" />
                </svg>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Account Section */}
        <SectionCard title="Account">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="text-sm font-medium text-ink">Workspace</span>
              <Badge variant="blue" size="sm">Government</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <span className="text-sm font-medium text-ink">Organization</span>
              <span className="text-ink-faint">Federal Republic of Nigeria</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

GovernmentSettingsPage.getLayout = (page) => {
  return <GovernmentLayout>{page}</GovernmentLayout>;
};