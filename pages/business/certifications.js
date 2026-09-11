import { useRouter } from "next/router";
import { ArrowRight, BadgeCheck, FileCheck2, ListTodo } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import CompactMetric from "@/components/business/ui/CompactMetric";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/business/ui/ProgressBar";
import { CERTIFICATIONS } from "@/lib/businessData";

const STATUS_VARIANTS = {
  Active: "green",
  "Not Started": "neutral",
  Planned: "blue",
};

export default function CertificationReadinessPage() {
  const router = useRouter();
  const active = CERTIFICATIONS.filter((c) => c.status === "Active").length;
  const score = Math.round((active / CERTIFICATIONS.length) * 100);

  return (
    <>
      <BusinessPageHeader
        eyebrow="Growth"
        title="Certification Readiness"
        description="Track mandatory and optional certifications, eligibility, documents, cost and timeline."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col justify-center gap-2 rounded-lg border border-line bg-white p-5 dark:bg-ink-soft">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Certification Readiness</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-primary tabular-nums">{score}%</span>
            <span className="mb-1 text-xs text-ink-faint">{active} of {CERTIFICATIONS.length} active</span>
          </div>
          <ProgressBar value={score} />
          <p className="mt-2 text-xs leading-relaxed text-ink-subtle">
            Readiness reflects the share of certifications that are active. Mandatory certifications take priority.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
          <CompactMetric label="Total" value={CERTIFICATIONS.length} hint="Tracked certifications" icon={BadgeCheck} />
          <CompactMetric label="Mandatory" value={CERTIFICATIONS.filter((c) => c.mandatory).length} hint="Required to operate" icon={ListTodo} iconClassName="text-danger" />
          <CompactMetric label="Active" value={active} hint="Currently in good standing" icon={FileCheck2} iconClassName="text-success" />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white dark:bg-ink-soft">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Certifications</h2>
            <p className="mt-0.5 text-xs text-ink-subtle">Eligibility, status and next step for each certification.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/business/certification-intelligence")}>
            Certification Intelligence <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
        <ul className="divide-y divide-line">
          {CERTIFICATIONS.map((c) => (
            <li key={c.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{c.name}</span>
                    <Badge variant={c.mandatory ? "red" : "blue"} size="sm">{c.mandatory ? "Mandatory" : "Optional"}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">
                    {c.authority} · Eligibility: {c.eligibility}
                    {c.documents ? ` · Docs: ${c.documents}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-ink-faint sm:block">Timeline: {c.timeline}</span>
                  <Badge variant={STATUS_VARIANTS[c.status] || "neutral"} size="sm">{c.status}</Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

CertificationReadinessPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};