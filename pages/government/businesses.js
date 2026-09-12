import { useEffect, useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { govApi } from "@/lib/api";

const IMPACT_META = {
  High: { variant: "red", label: "High" },
  Medium: { variant: "amber", label: "Medium" },
  Low: { variant: "green", label: "Low" },
};

const RISK_META = {
  High: { variant: "red" },
  Medium: { variant: "amber" },
  Low: { variant: "green" },
};

const STATUS_META = {
  Affected: { variant: "red" },
  "At Risk": { variant: "amber" },
  Monitored: { variant: "blue" },
};

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");

  useEffect(() => {
    let active = true;
    govApi
      .listBusinesses()
      .then((data) => {
        if (active) setBusinesses(data.businesses || []);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load businesses.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return businesses.filter((b) => {
      const matchQ =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchQ && (!risk || b.risk === risk);
    });
  }, [businesses, search, risk]);

  const affected = businesses.filter((b) => b.status === "Affected").length;

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Businesses"
        description="Businesses tracked in relation to regulatory problems, served from the live workspace database."
      />
      <div className="mb-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Tracked Businesses</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{businesses.length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Affected</p>
          <p className="mt-1 text-2xl font-semibold text-danger">{affected}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">At Risk</p>
          <p className="mt-1 text-2xl font-semibold text-warning">{businesses.filter((b) => b.status === "At Risk").length}</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Monitored</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{businesses.filter((b) => b.status === "Monitored").length}</p>
        </div>
      </div>

      <SectionCard title="Business registry">
        {error && (
          <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error} <button className="ml-2 font-medium underline" onClick={() => { setLoading(true); setError(""); govApi.listBusinesses().then((d) => setBusinesses(d.businesses || [])).catch((e) => setError(e?.message || "Unable to load businesses.")).finally(() => setLoading(false)); }}>Retry</button>
          </div>
        )}
        {loading && !error && <p className="mb-4 text-sm text-ink-faint">Loading businesses…</p>}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 basis-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name, industry, location or ID…"
              className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
            />
          </div>
          <select value={risk} onChange={(e) => setRisk(e.target.value)} className="h-10 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink">
            <option value="">All risk levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <span className="text-xs text-ink-faint">{filtered.length} business(es)</span>
        </div>

        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs uppercase tracking-wider text-ink-faint">
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold sm:px-5">Business</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Industry</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Location</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Impact</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Risk</th>
                <th className="whitespace-nowrap min-w-0 px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-surface-muted">
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-surface-muted text-primary">
                        <Building2 className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <span className="block font-medium text-ink">{b.name}</span>
                        <span className="block text-xs text-ink-faint">{b.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{b.industry}</td>
                  <td className="whitespace-nowrap min-w-0 px-4 py-3 text-ink-subtle">{b.location}</td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={IMPACT_META[b.impact].variant} size="sm">{b.impact}</Badge>
                    </td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={RISK_META[b.risk].variant} size="sm">{b.risk}</Badge>
                    </td>
<td className="whitespace-nowrap min-w-0 px-4 py-3">
                      <Badge variant={STATUS_META[b.status].variant} size="sm">{b.status}</Badge>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-ink-faint">No businesses match your filters.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

BusinessesPage.getLayout = (page) => <GovernmentLayout title="Businesses">{page}</GovernmentLayout>;