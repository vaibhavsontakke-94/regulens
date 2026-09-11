import { useState } from "react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { COMPLIANCE_REQUIREMENTS } from "@/lib/businessData";
import { fmtDate } from "@/lib/format";

const STATUS_VARIANTS = {
  Compliant: "green",
  "Action Required": "red",
  "Under Review": "amber",
  Expired: "red",
};

const OWNERS = ["Compliance Lead", "Finance Lead", "Plant Manager", "HR Manager"];

export default function ComplianceManagementPage() {
  const [filter, setFilter] = useState("");

  const requirements = COMPLIANCE_REQUIREMENTS.map((r, i) => ({
    ...r,
    owner: OWNERS[i % OWNERS.length],
    documents: r.status === "Compliant" ? "Uploaded" : r.status === "Expired" ? "Overdue" : "Pending",
  }));

  const filtered = filter ? requirements.filter((r) => r.status === filter) : requirements;

  return (
    <>
      <BusinessPageHeader
        eyebrow="Compliance & Risk"
        title="Compliance Management"
        description="Manage compliance requirements, deadlines, documents, status and responsible owners."
      />

      <div className="mb-6 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Total</span>
          <span className="text-2xl font-semibold text-ink">{requirements.length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Compliant</span>
          <span className="text-2xl font-semibold text-success">{requirements.filter((r) => r.status === "Compliant").length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Action Required</span>
          <span className="text-2xl font-semibold text-danger">{requirements.filter((r) => r.status === "Action Required").length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Expired</span>
          <span className="text-2xl font-semibold text-danger">{requirements.filter((r) => r.status === "Expired").length}</span>
        </div>
      </div>

      <SectionCard
        title="Compliance Tracker"
        description="Requirements, deadlines, documents, status and responsible owner"
        action={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink"
          >
            <option value="">All Statuses</option>
            {["Compliant", "Action Required", "Under Review", "Expired"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      >
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold sm:px-5">Requirement</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Deadline</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Documents</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Status</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-muted">
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    <div>
                      <span className="font-medium text-ink">{r.requirement}</span>
                      <span className="ml-2 text-xs text-ink-faint">{r.authority}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-faint">{r.dueDate === "Monthly" ? "Monthly" : fmtDate(r.dueDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge
                      variant={r.documents === "Uploaded" ? "green" : r.documents === "Overdue" ? "red" : "amber"}
                      size="sm"
                    >
                      {r.documents}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[r.status] || "neutral"} size="sm">{r.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

ComplianceManagementPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};