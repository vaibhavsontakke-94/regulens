import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Building2, Landmark } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignIn() {
  return (
    <>
      <Head>
        <title>Sign In — REGULENS</title>
      </Head>
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-line bg-background">
          <div className="u-container flex h-[72px] items-center justify-between">
            <Logo />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-5 py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-content">Sign In</h1>
          <p className="mt-3 max-w-md text-center text-base leading-relaxed text-content-secondary">
            Choose your intelligence workspace to continue.
          </p>

          <div className="mt-10 grid w-full max-w-xl gap-5 sm:grid-cols-2">
            <Link
              href="/government/login"
              className="group rounded-card border border-line bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-primary-soft text-primary" aria-hidden="true">
                <Landmark className="h-[22px] w-[22px]" />
              </span>
              <span className="mt-5 block text-lg font-semibold text-content">Government Officer</span>
              <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>

            <Link
              href="/business/login"
              className="group rounded-card border border-line bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-surface-muted text-content-secondary" aria-hidden="true">
                <Building2 className="h-[22px] w-[22px]" />
              </span>
              <span className="mt-5 block text-lg font-semibold text-content">Business</span>
              <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <Link
            href="/"
            className="mt-10 rounded-control px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
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