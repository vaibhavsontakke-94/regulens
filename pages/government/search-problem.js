import { useRef, useState } from "react";
import { CheckCircle2, Cpu, Search } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import ActiveProblemIntro from "@/components/government/ui/ActiveProblemIntro";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { buildProblemIntelligence } from "@/lib/problemIntelligence";
import { govApi, handleApiError } from "@/lib/api";
import { cx } from "@/lib/utils";

// ---------------------------------------------------------------
// MOCK MATCHING — FRONTEND ONLY
// `fetchProblemMatches` is a stand-in for the future backend/AI matcher.
// Replace it with a GET/POST to the API and keep the same return shape
// so the UI and problem-context do not need to change.
// ---------------------------------------------------------------

const MOCK_SOLUTION_PROVIDERS = [
  {
    id: "SP-01",
    name: "AgriSense IoT Solutions",
    description:
      "Precision irrigation monitoring and crop-yield analytics for smallholder farming clusters.",
    technology: "AI + IoT sensor networks",
    reasons: ["Technology Match", "Problem Relevance", "Cost Fit", "Expected Impact"],
    baseScore: 78,
    expectedImpact: "High",
    costFit: "Good",
    experience: "Similar projects in irrigation districts",
    keywords: ["irrigation", "water", "farm", "farming", "farmer", "agriculture", "crop", "monitor", "sensor", "hunger", "yield", "affordable"],
  },
  {
    id: "SP-02",
    name: "ComplyDesk Analytics",
    description:
      "Automated regulatory compliance reporting and filing workflows for SMEs across sectors.",
    technology: "Data Analytics + Workflow Automation",
    reasons: ["Technology Match", "Previous Projects", "Eligibility"],
    baseScore: 74,
    expectedImpact: "Medium",
    costFit: "Good",
    experience: "SME compliance filing rollout",
    keywords: ["compliance", "report", "reporting", "regulatory", "audit", "filing", "disclosure", "regulation", "paperwork", "license"],
  },
  {
    id: "SP-03",
    name: "RetailRadar Technologies",
    description:
      "Real-time retail pricing intelligence that surfaces unexplained price variance for essential goods.",
    technology: "Data Analytics + Price Intelligence",
    reasons: ["Technology Match", "Problem Relevance", "Expected Impact"],
    baseScore: 80,
    expectedImpact: "High",
    costFit: "Moderate",
    experience: "Retail price monitoring pilots",
    keywords: ["price", "pricing", "retail", "transparency", "consumer", "goods", "inflation", "essential", "cost", "variation", "affordable"],
  },
  {
    id: "SP-04",
    name: "GridClear Energy",
    description:
      "Metering and billing verification that reconciles tariff bands for residential and SME customers.",
    technology: "AI + IoT Metering",
    reasons: ["Previous Projects", "Technology Match", "Expected Impact"],
    baseScore: 76,
    expectedImpact: "High",
    costFit: "Moderate",
    experience: "District metering reconciliation",
    keywords: ["tariff", "billing", "meter", "electricity", "energy", "overbilling", "utility", "power", "bill", "supply"],
  },
  {
    id: "SP-05",
    name: "CustomsFlow Systems",
    description:
      "Single-window export documentation and border clearance for perishable and manufactured goods.",
    technology: "Digital Documents + Integrations",
    reasons: ["Previous Projects", "Technology Match", "Eligibility"],
    baseScore: 72,
    expectedImpact: "High",
    costFit: "Moderate",
    experience: "Port clearance digitisation",
    keywords: ["export", "border", "clearance", "consignment", "document", "documentation", "trade", "customs", "shipment", "port", "logistics"],
  },
  {
    id: "SP-06",
    name: "PayrollTrust",
    description:
      "Payroll and statutory remittance compliance covering pension contributions and employee benefits.",
    technology: "Data Analytics + Payroll Engine",
    reasons: ["Cost Fit", "Eligibility", "Previous Projects"],
    baseScore: 71,
    expectedImpact: "Medium",
    costFit: "Good",
    experience: "SME remittance compliance",
    keywords: ["pension", "remittance", "payroll", "employee", "benefits", "salary", "contribution", "workers", "labour", "wages"],
  },
];

const SCORE_BANDS = [
  { min: 80, label: "High", variant: "amber" },
  { min: 65, label: "Medium", variant: "blue" },
  { min: 0, label: "Low", variant: "neutral" },
];

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function bandForScore(score) {
  return SCORE_BANDS.find((b) => score >= b.min);
}

function computeScore(provider, matchedKeywords) {
  const score = clamp(provider.baseScore + matchedKeywords * 4, 40, 99);
  const band = bandForScore(score);
  return { score, label: band.label, variant: band.variant };
}

async function fetchProblemMatches(problem) {
  // Simulated latency so the loading state is visible. Replace this body
  // with a real API call: await fetch("/api/problem-matches", { method: "POST", body: JSON.stringify({ problem }) })
  await new Promise((resolve) => setTimeout(resolve, 700));

  const q = problem.trim().toLowerCase();
  if (!q) return [];

  return MOCK_SOLUTION_PROVIDERS.map((provider) => {
    const matchedKeywords = provider.keywords.filter((kw) => q.includes(kw)).length;
    const { score, label, variant } = computeScore(provider, matchedKeywords);
    return {
      id: provider.id,
      name: provider.name,
      description: provider.description,
      technology: provider.technology,
      reasons: matchedKeywords > 0 ? provider.reasons : ["Eligibility"],
      priorityScore: score,
      priorityLabel: label,
      priorityVariant: variant,
      expectedImpact: provider.expectedImpact,
      costFit: provider.costFit,
      experience: provider.experience,
    };
  })
    .filter((r) => r.priorityScore >= 40)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4);
}

function ResultMeta({ label, value }) {
  return (
    <div>
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

export default function SearchProblemPage() {
  const { problem, setProblem } = useGovernmentProblem();
  const inputRef = useRef(null);
  const [problemInput, setProblemInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    const value = problemInput.trim();
    if (!value) {
      setError(true);
      return;
    }
    setError(false);
    setSearching(true);
    setResults(null);

    const matches = await fetchProblemMatches(value);

    if (matches.length > 0) {
      const id = `PRB-${String(Date.now()).slice(-6)}`;
      try {
        const data = await govApi.buildIntelligence({ id, title: value, businesses: matches });
        setProblem(data.intelligence);
      } catch (err) {
        console.warn("Intelligence API unavailable, using local builder:", handleApiError(err));
        setProblem(buildProblemIntelligence({ id, title: value, businesses: matches }));
      }
    }
    setResults(matches);
    setSearching(false);
  }

  function handleClear() {
    setProblemInput("");
    setError(false);
    setResults(null);
    setSearching(false);
    inputRef.current?.focus();
  }

  function handleChangeProblem() {
    handleClear();
  }

  const showInitial = !searching && results === null;
  const showNoResults = !searching && results !== null && results.length === 0;
  const hasResults = !searching && results !== null && results.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Search Problem"
        description="Describe a government problem to find businesses and solutions, and set it as the active problem for the Government Portal."
      />

      {problem && (
        <ActiveProblemIntro
          problem={problem}
          action={
            <Button variant="outline" size="sm" onClick={handleChangeProblem}>
              Change Problem
            </Button>
          }
        />
      )}

      {/* Search input */}
      <SectionCard title="Search Problem" description="Enter the problem as a government officer sees it. A search activates the problem across the Portal.">
        <form onSubmit={handleSearch} className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={problemInput}
              onChange={(e) => {
                setProblemInput(e.target.value);
                if (error && e.target.value.trim()) setError(false);
              }}
              placeholder="Describe the government problem…"
              aria-label="Describe the government problem"
              aria-invalid={error}
              className={cx(
                "h-11 w-full rounded-[10px] border bg-surface pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary/60",
                error ? "border-danger" : "border-line"
              )}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="submit" loading={searching}>
              Search Problem
            </Button>
            <Button type="button" variant="outline" onClick={handleClear} disabled={searching}>
              Clear
            </Button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs font-medium text-danger">Please describe a problem before searching.</p>}
      </SectionCard>

      {/* Initial state */}
      {showInitial && (
        <div className="mt-4 rounded-card border border-dashed border-line bg-surface/60 p-10 text-center">
          <p className="text-sm text-ink-subtle">
            Describe a government problem to find businesses and solutions that may address it. The problem becomes the
            active context for Command Center, Regulations, Policies, Solutions, Ground Intelligence, Reports and Copilot.
          </p>
        </div>
      )}

      {/* No results */}
      {showNoResults && (
        <div className="mt-4 rounded-card border border-dashed border-line bg-surface/60 p-10 text-center">
          <p className="text-sm font-medium text-ink">No matching businesses found.</p>
          <p className="mt-1 text-xs text-ink-faint">
            Try describing the problem with more specific terms such as sector, technology or location.
          </p>
        </div>
      )}

      {/* Searching */}
      {searching && (
        <div className="mt-4 rounded-card border border-line bg-surface p-6 text-center text-sm text-ink-faint">
          Searching for matching businesses…
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Matching Businesses</h2>
            <span className="text-xs text-ink-faint">
              {results.length} potential solution{results.length !== 1 ? "s" : ""} found · ranked by priority
            </span>
          </div>

          <div className="space-y-4">
            {results.map((r) => {
              const band = bandForScore(r.priorityScore);
              return (
                <SectionCard key={r.id}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-ink">{r.name}</h3>
                        <Badge variant="neutral" size="sm">Business / Startup</Badge>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">{r.description}</p>

                      <div className="mt-4 flex items-start gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-surface-muted text-primary">
                          <Cpu className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Technology / Solution</p>
                          <p className="text-sm font-medium text-ink">{r.technology}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <ResultMeta label="Expected Impact" value={r.expectedImpact} />
                        <ResultMeta label="Cost Fit" value={r.costFit} />
                        <ResultMeta label="Relevant Experience" value={r.experience} />
                      </div>

                      <div className="mt-4">
                        <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Why it matches</p>
                        <ul className="mt-2 space-y-1.5">
                          {r.reasons.map((reason) => (
                            <li key={reason} className="flex items-start gap-2 text-sm text-ink-subtle">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="w-full shrink-0 lg:w-52">
                      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">Priority Score</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-3xl font-semibold tracking-tight text-ink">{r.priorityScore}</span>
                        <span className="text-sm text-ink-faint">/ 100</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-warning transition-all duration-500"
                          style={{ width: `${r.priorityScore}%` }}
                        />
                      </div>
                      <div className="mt-2">
                        <Badge variant={band.variant} size="sm">{band.label} Priority</Badge>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              );
            })}
          </div>

          {problem && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-success/40 bg-success-soft/20 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm text-ink-subtle">
                <strong className="text-ink">This problem is now the active Government problem ({problem.id}).</strong>{" "}
                Connected intelligence in Command Center, Regulations, Policies, Solutions, Ground Intelligence, Reports and
                Copilot now uses this problem context.
              </p>
              <Button variant="soft" size="sm" href="/government">View in Command Center</Button>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-ink-faint">
            Illustrative mock matching for demonstration. Scores and matches are not based on real AI analysis.
          </p>
        </div>
      )}
    </>
  );
}

SearchProblemPage.getLayout = (page) => <GovernmentLayout title="Search Problem">{page}</GovernmentLayout>;