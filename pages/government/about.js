import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Globe } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";

export default function GovernmentAboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="About REGULENS"
        description="Product information and version."
      />

      <SectionCard>
        <div className="p-6 text-center">
          <div className="mb-4">
            <Globe className="mx-auto h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-ink mb-2">REGULENS</h2>
          <p className="text-ink-subtle mb-4">From Regulation to Resolution</p>
          <p className="text-sm text-ink-faint mb-8">A business intelligence platform for regulatory compliance, risk assessment and expansion readiness.</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="rounded-lg border border-line p-3 text-center">
              <p className="text-xs font-medium text-ink">Version</p>
              <p className="text-2xl font-semibold">v1.0</p>
            </div>
            <div className="rounded-lg border border-line p-3 text-center">
              <p className="text-xs font-medium text-ink">Status</p>
              <p className="text-2xl font-semibold">Live</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-ink-faint">
            REGULENS serves an AI-generated regulatory dataset through its API; analytics and recommendations are
            generated estimates from the workspace data.
          </p>
        </div>
      </SectionCard>
    </>
  );
}

GovernmentAboutPage.getLayout = (page) => {
  return <GovernmentLayout>{page}</GovernmentLayout>;
};