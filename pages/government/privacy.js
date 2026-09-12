import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getSession, clearSession } from "@/lib/authSession";

export default function GovernmentPrivacyPage() {
  const router = useRouter();
  const [session, setSession] = useState(() => getSession());

  useEffect(() => setSession(getSession()), []);

  const name = session?.name || "Guest";
  const email = session?.email || "analyst@regulens.gov.ng";

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Privacy"
        description="Data preferences and privacy settings."
      />

      <SectionCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Data Privacy</h3>
          <p className="text-ink-subtle mb-4">
            REGULENS stores workspace data in its persistence layer (server-side store and the
            configured Supabase mirror). Your session is held in the browser and is not shared
            with third parties.
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Data Preferences</dt>
              <dd className="text-ink">Workspace data persisted server-side</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Analytics Preference</dt>
              <dd className="text-ink">Usage analytics are disabled</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Personalization</dt>
              <dd className="text-ink">Personalized recommendations based on saved data</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Session Preferences</dt>
              <dd className="text-ink">Session settings persisted in the browser session</dd>
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

GovernmentPrivacyPage.getLayout = (page) => {
  return <GovernmentLayout>{page}</GovernmentLayout>;
};