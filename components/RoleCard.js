import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowRight, Check } from "lucide-react";

export default function RoleCard({
  badge,
  badgeVariant,
  icon: Icon,
  highlight,
  title,
  description,
  features,
  cta,
  href,
}) {
  return (
    <div className="group relative flex h-full flex-col rounded-card border border-line bg-surface p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-card-hover sm:p-9">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-panel ${
            highlight ? "bg-primary-soft text-primary" : "bg-surface-muted text-content-secondary"
          }`}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </span>
        <Badge variant={badgeVariant} size="sm">
          {badge}
        </Badge>
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-tight text-content">{title}</h3>
      <p className="mt-2.5 text-[15px] leading-relaxed text-content-secondary">{description}</p>

      <ul className="mt-6 flex flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-[15px] text-content">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
              aria-hidden="true"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-1 items-end">
        <Button
          href={href}
          size="lg"
          className="w-full whitespace-normal text-center leading-snug sm:whitespace-nowrap sm:text-center">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}