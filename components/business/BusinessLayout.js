import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { BusinessProfileProvider } from "./BusinessProfileContext";
import { ROLES } from "@/components/auth/roles";
import { getSession } from "@/lib/authSession";
import CopilotButton from "@/components/CopilotButton";
import CopilotPanel from "@/components/CopilotPanel";

const BUSINESS_SUGGESTED_PROMPTS = [
  "Check my compliance status",
  "Analyze a document",
  "Identify regulatory risks",
  "Check certification requirements",
  "Analyze an expansion opportunity",
  "Find government schemes",
  "Analyze a business problem",
];

export default function BusinessLayout({ title, children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "business") {
      router.replace("/business/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-success"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <BusinessProfileProvider>
      <Head>
        <title>{title ? `${title} — REGULENS` : `${ROLES.business.eyebrow} — REGULENS`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex min-h-screen bg-surface-muted">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <CopilotButton onToggle={() => setCopilotOpen((v) => !v)} />
        </div>
      </div>
      <CopilotPanel
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onSend={(text) => {
          console.log("Copilot message:", text);
        }}
        context="Business Portal"
        suggestedPrompts={BUSINESS_SUGGESTED_PROMPTS}
      />
    </BusinessProfileProvider>
  );
}