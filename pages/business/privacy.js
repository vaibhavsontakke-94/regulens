import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getSession, clearSession } from "@/lib/authSession";

export default function BusinessPrivacyPage() {
  const router = useRouter();
  const [session, setSession] = useState(() => getSession());

  useEffect(() => setSession(getSession()), []);

  const name = session?.name || "Demo User";
  const email = session?.email || "ops@nortextextiles.demo";

  return (
    <>
      <BusinessPageHeader
        eyebrow="Workspace"
        title="Privacy"
        description="Data preferences and privacy settings."
      />

      <SectionCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Data Privacy</h3>
          <p className="text-ink-subtle mb-4">
            This is a frontend demo. All data is stored locally in your browser's local
            storage and is not shared with any third parties.
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Data Preferences</dt>
              <dd className="text-ink">All business and regulatory data is stored locally</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Analytics Preference</dt>
              <dd className="text-ink">Usage analytics are disabled in demo mode</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Personalization</dt>
              <dd className="text-ink">Personalized recommendations based on saved data</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Session Preferences</dt>
              <dd className="text-ink">Session settings persisted in browser local storage</dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" onClick={() => clearSession()}>
            <Badge variant="danger" size="sm" />
            Clear All Data
          </Button>
        </div>
      </SectionCard>
    </>
  );
}

BusinessPrivacyPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};