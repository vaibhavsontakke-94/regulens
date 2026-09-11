import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Shield, HelpCircle, Phone, Mail } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Button from "@/components/ui/Button";

export default function GovernmentHelpPage() {
  const router = useRouter();

  const faqItems = [
    { question: "How do I report a problem?", answer: "Use the 'Report a Problem' section in the workspace." },
    { question: "How do I find a business?", answer: "Use the ground intelligence or businesses section." },
    { question: "What are regulatory updates?", answer: "Notifications about new or changed regulations." },
  ];

  const contactItems = [
    { label: "Email Support", href: "mailto:support@regulens.gov.ng", icon: Mail },
    { label: "Phone", href: "tel:+234123456789", icon: Phone },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Help & Support"
        description="Get help, contact support, and find answers."
      />

      <SectionCard title="FAQ">
        <div className="space-y-3">
          {faqItems.map((f, i) => (
            <div key={i} className="rounded-lg border border-line p-4 transition-colors hover:bg-surface-muted">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl">{i + 1}</span>
                <div>
                  <h3 className="font-medium text-ink">{f.question}</h3>
                  <p className="mt-1 text-[11px] text-ink-subtle">{f.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Contact Support">
        <div className="space-y-4">
          {contactItems.map((c, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 transition-colors hover:bg-surface-muted">
              <c.icon className="h-4 w-4 text-primary" />
              <span>
                <a href={c.href} className="text-ink underline underline-offset-2 hover:text-primary">
                  {c.label}
                </a>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-8">
        <Button variant="outline" size="sm" onClick={() => router.push("/government/login")}>
          <Shield className="h-4 w-4" /> Login to access support tools
        </Button>
      </div>
    </>
  );
}

GovernmentHelpPage.getLayout = (page) => {
  return <GovernmentLayout>{page}</GovernmentLayout>;
};