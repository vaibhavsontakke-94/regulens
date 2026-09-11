import { cx } from "@/lib/utils";

export default function FeatureCard({ icon: Icon, title, description, className }) {
  return (
    <div
      className={cx(
        "flex flex-col gap-4 rounded-card border border-line bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover sm:p-7",
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-primary-soft text-primary" aria-hidden="true">
        <Icon className="h-[22px] w-[22px]" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[17px] font-semibold tracking-tight text-content">{title}</h3>
        <p className="text-[15px] leading-relaxed text-content-secondary">{description}</p>
      </div>
    </div>
  );
}