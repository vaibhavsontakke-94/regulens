import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ShieldCheck, LogOut } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getSession, clearSession } from "@/lib/authSession";

export default function GovernmentAccountPage() {
  const router = useRouter();
  const [session, setSession] = useState(() => getSession());

  useEffect(() => setSession(getSession()), []);
  const handleSignOut = () => {
    clearSession();
    router.push("/government/login");
  };

  const name = session?.name || "Demo user";
  const email = session?.email || "analyst@regulens.gov.ng";
  const joined = session?.joined || "2026";
  const lastActive = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Account"
        description="Account management and security settings."
      />

      <SectionCard>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-ink-faint mb-3">Account Status</h3>
            <dl className="space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Email</dt>
                <dd className="text-ink">{email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Member since</dt>
                <dd className="text-ink">{joined}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Last active</dt>
                <dd className="text-ink">{lastActive}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-ink-faint mb-3">Role</h3>
            <Badge variant="blue" size="sm">Government</Badge>
            <p className="mt-2 text-xs text-ink-faint">Administrator privileges</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Danger Zone">
        <div className="pt-4 border-t border-line">
          <Button variant="danger" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
          <Button variant="outline" size="sm" className="mt-2" disabled>
            <LogOut className="h-4 w-4" /> Delete account
          </Button>
          <p className="mt-3 text-xs text-danger">
            Delete account is irreversible and will remove all your data. This action is UI-only
            in the demo.
          </p>
        </div>
      </SectionCard>
    </>
  );
}

GovernmentAccountPage.getLayout = (page) => {
  return <GovernmentLayout>{page}</GovernmentLayout>;
};