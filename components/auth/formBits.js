import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function FormCard({ children }) {
  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">{children}</div>
  );
}

export function FormTitle({ title, subtitle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-xl font-semibold tracking-tight text-content sm:text-2xl">{title}</h2>
      {subtitle && (
        <p className="text-[15px] leading-relaxed text-content-secondary">{subtitle}</p>
      )}
    </div>
  );
}

export function BackLink({ href = "/sign-in", label = "Back to role selection" }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-[8px] text-sm font-medium text-content-muted transition-colors hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function DemoNote({ children }) {
  return (
    <p className="rounded-[10px] border border-dashed border-line bg-surface-muted px-3.5 py-2.5 text-xs leading-relaxed text-content-muted">
      {children}
    </p>
  );
}

export function SectionLabel({ children }) {
  return (
    <h3 className="border-t border-line pt-5 text-[11px] font-semibold tracking-[0.12em] text-content-muted uppercase">
      {children}
    </h3>
  );
}

export function SuccessPanel({ icon: Icon, title, children, className }) {
  return (
    <div className={`flex flex-col items-center gap-4 py-2 text-center ${className || ""}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success" aria-hidden="true">
        <Icon className="h-7 w-7" />
      </span>
      <div className="flex flex-col items-center gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-content sm:text-2xl">{title}</h2>
        {children}
      </div>
    </div>
  );
}