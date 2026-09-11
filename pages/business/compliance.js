import { useRouter } from "next/router";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, Clock, FileText } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import CompactMetric from "@/components/business/ui/CompactMetric";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AiInsightCard from "@/components/business/ui/AiInsightCard";
import { COMPLIANCE_REQUIREMENTS } from "@/lib/businessData";
import { fmtDate } from "@/lib/format";

const STATUS_VARIANTS = {
  Compliant: "green",
  "Action Required": "red",
  "Under Review": "amber",
  Expired: "red",
};

function isExpiringSoon(dueDate) {
  if (!dueDate || typeof dueDate !== "string" || dueDate === "Monthly" || Number.isNaN(Date.parse(dueDate))) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 60;
}

export default function CompliancePage() {
  const router = useRouter();
  const compliant = COMPLIANCE_REQUIREMENTS.filter((r) => r.status === "Compliant").length;
  const actionRequired = COMPLIANCE_REQUIREMENTS.filter((r) => r.status === "Action Required").length;
  const expiringSoon = COMPLIANCE_REQUIREMENTS.filter((r) => r.status !== "Compliant" || isExpiringSoon(r.dueDate)).length;
  const underReview = COMPLIANCE_REQUIREMENTS.filter((r) => r.status === "Under Review").length;
  const score = Math.round((compliant / COMPLIANCE_REQUIREMENTS.length) * 100);

  const priorities = COMPLIANCE_REQUIREMENTS.filter(
    (r) => r.status === "Action Required" || r.status === "Expired" || isExpiringSoon(r.dueDate)
  ).slice(0, 5);

  return (
    <>
      <BusinessPageHeader
        eyebrow="Compliance & Risk"
        title="Compliance"
        description="Track compliance requirements, deadlines, and risk across all regulatory areas."
      />

      <AiInsightCard
        module="compliance"
        title="AI Compliance Analysis"
        description="Priorities and recommendations generated from the current compliance posture."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col justify-center gap-1 rounded-lg border border-line bg-white p-5 dark:bg-ink-soft">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Compliance Score</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-success tabular-nums">{score}%</span>
            <span className="mb-1 text-xs text-ink-faint">{compliant} of {COMPLIANCE_REQUIREMENTS.length} compliant</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="green" size="sm"><CheckCircle2 className="h-3 w-3" /> {compliant} Compliant</Badge>
            <Badge variant="red" size="sm"><AlertTriangle className="h-3 w-3" /> {actionRequired} Action</Badge>
            <Badge variant="amber" size="sm"><Clock className="h-3 w-3" /> {expiringSoon} Expiring soon</Badge>
            <Badge variant="blue" size="sm"><FileText className="h-3 w-3" /> {underReview} In review</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
          <CompactMetric label="Requirements" value={COMPLIANCE_REQUIREMENTS.length} hint="Active requirements" icon={ClipboardCheck} />
          <CompactMetric label="Action Required" value={actionRequired} hint="Need immediate attention" icon={AlertTriangle} iconClassName="text-danger" />
          <CompactMetric label="Expiring Soon" value={expiringSoon} hint="Within 60 days" icon={CalendarClock} iconClassName="text-warning" />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white dark:bg-ink-soft">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Priority Items</h2>
            <p className="mt-0.5 text-xs text-ink-subtle">Require action, are expiring soon, or are expired.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/business/compliance-management")}>
            View All Requirements <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
        <ul className="divide-y divide-line">
          {priorities.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{r.requirement}</p>
                <p className="truncate text-xs text-ink-faint">{r.authority} · {r.jurisdiction}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs text-ink-faint sm:block">
                  {r.dueDate === "Monthly" ? "Monthly" : fmtDate(r.dueDate)}
                </span>
                <Badge variant={STATUS_VARIANTS[r.status] || "neutral"} size="sm">{r.status}</Badge>
              </div>
            </li>
          ))}
          {priorities.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-ink-faint">Everything is up to date. No priority items.</li>
          )}
        </ul>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white dark:bg-ink-soft">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Recent Compliant Items</h2>
            <p className="mt-0.5 text-xs text-ink-subtle">Fulfilled obligations.</p>
          </div>
        </div>
        <ul className="divide-y divide-line">
          {COMPLIANCE_REQUIREMENTS.filter((r) => r.status === "Compliant")
            .slice(0, 4)
            .map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{r.requirement}</p>
                  <p className="truncate text-xs text-ink-faint">{r.authority}</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}

CompliancePage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};