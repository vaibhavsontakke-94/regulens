import Head from "next/head";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import BrandVisual from "@/components/auth/BrandVisual";

export default function AuthLayout({ roleLabel, headline, tagline, eyebrow, title, children }) {
  return (
    <>
      <Head>
        <title>{`${title || headline} — REGULENS`}</title>
      </Head>
      <div className="flex min-h-screen flex-col bg-surface-muted lg:flex-row">
        <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#0b1322] p-10 text-white lg:flex xl:w-[44%] xl:p-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 60% at 85% 0%, rgba(37,99,235,0.28) 0%, rgba(37,99,235,0) 65%), radial-gradient(60% 50% at 0% 100%, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0) 60%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start gap-12">
            <Logo tone="light" />

            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-sky-300 uppercase">
                {eyebrow}
              </span>
              <h1 className="max-w-md text-4xl leading-[1.15] font-semibold tracking-tight xl:text-[42px]">
                {headline}
              </h1>
              <p className="max-w-md text-[17px] leading-relaxed text-white/70">{tagline}</p>
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-4">
            <BrandVisual />
            <p className="text-xs tracking-wide text-white/40">© 2026 REGULENS. All rights reserved.</p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-end px-5 py-4 sm:px-8 lg:px-10">
            <ThemeToggle />
          </header>

          <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:py-10">
            <div className="w-full max-w-md">
              <div className="mb-8 flex flex-col items-start gap-3 lg:hidden">
                <Logo />
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
                  {eyebrow}
                </span>
                <h1 className="text-2xl font-semibold tracking-tight text-content">{headline}</h1>
                <p className="text-[15px] leading-relaxed text-content-secondary">{tagline}</p>
              </div>

              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}