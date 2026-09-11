import Link from "next/link";
import { cx } from "@/lib/utils";

export function LogoMark({ className }) {
  return (
    <span
      className={cx(
        "flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-primary-text shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        className="h-[20px] w-[20px]"
      >
        <circle cx="12" cy="12" r="8.6" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.4v5.6M12 15v5.6M3.4 12H9M15 12h5.6" />
      </svg>
    </span>
  );
}

export default function Logo({ href = "/", showVersion = true, asLink = true, tone = "default" }) {
  const wordColor = tone === "light" ? "text-white" : "text-content";
  const metaColor = tone === "light" ? "text-white/50" : "text-content-muted";
  const content = (
    <>
      <LogoMark />
      <span className="flex flex-col items-start leading-none">
        <span className={cx("text-[17px] font-semibold tracking-[0.04em]", wordColor)}>REGULENS</span>
        {showVersion && (
          <span className={cx("mt-1 text-[10px] font-medium tracking-wide", metaColor)}>v1.0</span>
        )}
      </span>
    </>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="flex shrink-0 items-center gap-2.5 rounded-[10px] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        aria-label="REGULENS home"
      >
        {content}
      </Link>
    );
  }

  return <span className="flex shrink-0 items-center gap-2.5">{content}</span>;
}