import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import { cx } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Intelligence", href: "#intelligence" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <nav className="u-container flex h-[72px] items-center justify-between gap-4" aria-label="Main">
        <div className="flex items-center">
          <Logo />
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-[8px] px-3.5 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <Link
            href="/sign-in"
            className="rounded-[10px] px-3.5 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
          >
            Sign In
          </Link>
          <ThemeToggle />
          <Button href="#roles" size="md">
            Get Started
          </Button>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-content-secondary transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-background md:hidden">
          <div className="u-container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[10px] px-3 py-2.5 text-[15px] font-medium text-content-secondary transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2.5 border-t border-line pt-4">
              <Button href="/sign-in" variant="outline" onClick={() => setOpen(false)} className="w-full">
                Sign In
              </Button>
              <Button href="#roles" onClick={() => setOpen(false)} className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}