import { cx } from "@/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-semibold tracking-[0.08em] text-primary uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-[26px] leading-tight font-semibold tracking-tight text-content sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-base leading-relaxed text-content-secondary sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}