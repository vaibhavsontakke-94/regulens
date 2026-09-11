import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import { getSession, clearSession } from "@/lib/authSession";
import { ROLES } from "@/components/auth/roles";

export default function ProtectedWorkspace({ role, icon: RoleIcon, cardText }) {
  const cfg = ROLES[role];
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const value = getSession();
    if (!value || value.role !== role) {
      router.replace(cfg.loginPath);
      return;
    }
    setSession(value);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  function handleSignOut() {
    clearSession();
    router.push(cfg.loginPath);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${cfg.eyebrow} — REGULENS`}</title>
      </Head>
      <div className="flex min-h-screen flex-col bg-surface-muted">
        <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
          <div className="u-container flex h-[68px] items-center justify-between gap-4">
            <Logo />
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-line bg-surface-muted px-3 py-1.5 text-sm font-medium text-content sm:flex">
                <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                {session.name}
              </span>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="u-container flex flex-1 flex-col items-center justify-center py-16">
          <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-card border border-line bg-surface p-10 text-center shadow-card">
            {RoleIcon && (
              <span className="flex h-14 w-14 items-center justify-center rounded-panel bg-primary-soft text-primary" aria-hidden="true">
                <RoleIcon className="h-7 w-7" />
              </span>
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-content sm:text-3xl">
              Welcome, {session.name}
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-content-secondary">
              You are signed in to the {cfg.eyebrow.toLowerCase()} workspace.
              {cardText}
            </p>
            <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
              Session active
            </span>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button href="/" variant="outline" size="md">
                Back to home
              </Button>
              <Button onClick={handleSignOut} size="md">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>
        </main>

        <footer className="border-t border-line bg-surface-muted">
          <div className="u-container py-6 text-center text-sm text-content-muted">
            © 2026 REGULENS. All rights reserved. · Demo session — frontend only, no real authentication.
          </div>
        </footer>
      </div>
    </>
  );
}