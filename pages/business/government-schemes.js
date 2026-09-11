import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { useWorkspace } from "@/components/business/WorkspaceContext";
import { fmtDate } from "@/lib/format";

const STATUS_VARIANTS = {
  Open: "green",
  Limited: "amber",
  Closed: "red",
};

export default function GovernmentSchemesPage() {
  const { data } = useWorkspace();
  const SCHEMES = data.schemes || [];

  return (
    <>
      <BusinessPageHeader
        eyebrow="Growth"
        title="Government Schemes"
        description="Government schemes, grants and incentives you may be eligible for."
      />

      <div className="mb-6 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Total Schemes</span>
          <span className="text-2xl font-semibold text-ink">{SCHEMES.length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Open</span>
          <span className="text-2xl font-semibold text-success">{SCHEMES.filter((s) => s.status === "Open").length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Limited</span>
          <span className="text-2xl font-semibold text-warning">{SCHEMES.filter((s) => s.status === "Limited").length}</span>
        </div>
      </div>

      <SectionCard title="Available Schemes" description={`${SCHEMES.length} schemes tracked`}>
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold sm:px-5">Scheme</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Authority</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Eligibility</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Benefit</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Deadline</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {SCHEMES.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-surface-muted">
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    <span className="font-medium text-ink">{s.scheme}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{s.authority}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{s.eligibility}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-subtle">{s.benefit}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-faint">{s.deadline === "Rolling" ? "Rolling" : fmtDate(s.deadline)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[s.status] || "neutral"} size="sm">{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

GovernmentSchemesPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};