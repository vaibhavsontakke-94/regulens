import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ShieldCheck, LogOut } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ThemeToggle";
import { getSession, clearSession } from "@/lib/authSession";

export default function GovernmentProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => setSession(getSession()), []);
  const handleSignOut = () => {
    clearSession();
    router.push("/government/login");
  };

  const name = session?.name || "Demo user";
  const email = session?.email || "analyst@regulens.gov.ng";
  const joined = session?.joined || "2026";
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Profile & Settings"
        description="Account context for this demo workspace."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Profile">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-text">
              {initials}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">{name}</h2>
              <p className="text-sm text-ink-faint">{email}</p>
              <p className="mt-1.5 text-xs text-ink-faint">{joined}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Account Settings">
          <div className="space-y-4">
            <ThemeToggle className="hidden sm:block" />
            <ThemeToggle className="sm:hidden" />
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Workspace</dt>
                <dd className="text-ink">Government Intelligence Platform</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Member since</dt>
                <dd className="text-ink">{joined}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Authentication</dt>
                <dd className="flex items-center gap-1.5 text-ink">
                  <ShieldCheck className="h-4 w-4 text-success" /> Demo (frontend only)
                </dd>
              </div>
            </dl>
            <Button variant="outline" size="sm" onClick={handleSignOut} mt-4>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

GovernmentProfilePage.getLayout = (page) => {
  return <GovernmentLayout title="Profile & Settings">{page}</GovernmentLayout>;
};