import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Shield, HelpCircle, Phone, Mail } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Button from "@/components/ui/Button";

export default function BusinessHelpPage() {
  const router = useRouter();

  const faqItems = [
    { question: "How do I report a problem?", answer: "Use the 'Report a Problem' section in the workspace." },
    { question: "How do I find a business?", answer: "Use the Business Profile or expansion sections." },
    { question: "What are regulatory updates?", answer: "Notifications about new or changed regulations." },
  ];

  const contactItems = [
    { label: "Email Support", href: "mailto:support@nortextextiles.demo", icon: Mail },
    { label: "Company", href: "/business/about", icon: Shield },
  ];

  return (
    <>
      <BusinessPageHeader
        eyebrow="Workspace"
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
              <c.icon className="h-4 w-4 text-success" />
              <span>
                <a href={c.href} className="text-ink underline underline-offset-2 hover:text-success">
                  {c.label}
                </a>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/business/login")}>
          <Shield className="h-4 w-4" /> Login to access support tools
        </Button>
      </div>
    </>
  );
}

BusinessHelpPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};