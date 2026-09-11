import Head from "next/head";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function PlaceholderLayout({ title, eyebrow, icon: Icon, children }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} — REGULENS` : "REGULENS"}</title>
      </Head>
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-line bg-background">
          <div className="u-container flex h-[72px] items-center justify-between">
            <Logo />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-5 py-16">
          {Icon && (
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-panel bg-primary-soft text-primary" aria-hidden="true">
              <Icon className="h-7 w-7" />
            </span>
          )}
          {eyebrow && (
            <span className="rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-semibold tracking-[0.08em] text-primary uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight text-content">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-center text-base leading-relaxed text-content-secondary">
            {children}
          </p>
          <Link
            href="/"
            className="mt-8 rounded-control px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring"
          >
            ← Back to home
          </Link>
        </main>

        <footer className="border-t border-line bg-surface-muted">
          <div className="u-container py-6 text-center text-sm text-content-muted">
            © 2026 REGULENS. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}