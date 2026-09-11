import Link from "next/link";
import Logo, { LogoMark } from "@/components/Logo";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Product", href: "#product" },
      { label: "Intelligence", href: "#intelligence" },
      { label: "About", href: "#about" },
    ],
  },
  {
    heading: "Workspaces",
    links: [
      { label: "Government", href: "/government/login" },
      { label: "Business", href: "/business/login" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="u-container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="flex flex-col items-start gap-4">
            <Logo />
            <p className="max-w-xs text-[15px] leading-relaxed text-content-secondary">
              From Regulation to Resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h3 className="text-sm font-semibold tracking-wide text-content uppercase">
                  {column.heading}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[15px] text-content-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-content-muted">© 2026 REGULENS. All rights reserved.</p>
          <p className="flex items-center gap-2 text-sm text-content-muted">
            <LogoMark className="h-6 w-6" />
            Regulatory Intelligence Platform
          </p>
        </div>
      </div>
    </footer>
  );
}