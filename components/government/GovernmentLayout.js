import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import GovernmentProblemProvider from "./GovernmentProblemContext";
import { ROLES } from "@/components/auth/roles";
import { getSession, clearSession } from "@/lib/authSession";
import { authApi, govApi } from "@/lib/api";
import CopilotButton from "@/components/CopilotButton";
import CopilotPanel from "@/components/CopilotPanel";

export default function GovernmentLayout({ title, children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "government") {
      router.replace("/government/login");
      return;
    }
    let cancelled = false;
    authApi
      .session()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        clearSession();
        if (!cancelled) router.replace("/government/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title ? `${title} — REGULENS` : `${ROLES.government.eyebrow} — REGULENS`}</title>
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
          <GovernmentProblemProvider>
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </GovernmentProblemProvider>
          <CopilotButton onToggle={() => setCopilotOpen((v) => !v)} />
        </div>
      </div>
      <CopilotPanel
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onSend={(text) => govApi.copilot({ message: text }).then((res) => res?.reply)}
        suggestedPrompts={[
          "What compliance deadlines are coming up?",
          "Identify affected businesses",
          "Find related regulations",
          "Compare policy scenarios",
          "Evaluate solution",
        ]}
      />
    </>
  );
}