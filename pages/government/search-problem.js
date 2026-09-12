import { useRef, useState } from "react";
import { CheckCircle2, Cpu, Search } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import ActiveProblemIntro from "@/components/government/ui/ActiveProblemIntro";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { govApi, handleApiError } from "@/lib/api";
import { cx } from "@/lib/utils";

const SCORE_BANDS = [
  { min: 80, label: "High", variant: "amber" },
  { min: 65, label: "Medium", variant: "blue" },
  { min: 0, label: "Low", variant: "neutral" },
];

function bandForScore(score) {
  return SCORE_BANDS.find((b) => score >= b.min);
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
  const [summary, setSummary] = useState("");
  const [createdProblemId, setCreatedProblemId] = useState("");
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSearch(e) {
    e?.preventDefault();
    const value = problemInput.trim();
    if (!value) {
      setError(true);
      return;
    }
    setError(false);
    setErrorText("");
    setSearching(true);
    setResults(null);
    setSummary("");
    setCreatedProblemId("");

    try {
      const data = await govApi.problemMatches({ problem: value });
      const matches = data.matches || [];

      if (matches.length > 0) {
        const created = await govApi.createProblem({
          title: value,
          summary:
            data.summary ||
            `New problem reported via Search & Match. ${matches.length} solution provider${matches.length === 1 ? "" : "s"} identified for triage.`,
          reporterEmail: "intake@regulens.gov.ng",
          location: "Federal (Triage)",
          category: "Cross-Sector",
          severity: "Medium",
          rootCauses: ["Under initial triage"],
          affectedBusinessIds: matches.map((m) => m.id),
        });
        const record = created.problem || null;
        setCreatedProblemId(record?.id || "");
        const intel = await govApi.buildIntelligence({ id: record?.id || value, title: value, businesses: matches });
        setProblem(intel.intelligence);
      }
      setResults(matches);
      setSummary(matches.length > 0 ? data.summary || "" : "");
    } catch (err) {
      setErrorText(handleApiError(err));
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleClear() {
    setProblemInput("");
    setError(false);
    setErrorText("");
    setResults(null);
    setSummary("");
    setSearching(false);
    setCreatedProblemId("");
    inputRef.current?.focus();
  }

  function handleChangeProblem() {
    handleClear();
  }

  const showInitial = !searching && results === null;
  const showNoResults = !searching && results !== null && results.length === 0 && !errorText;
  const hasResults = !searching && results !== null && results.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Search Problem"
        description="Describe a government problem to find businesses and solutions against the live workspace, and set it as the active problem for the Government Portal."
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
      <SectionCard title="Search Problem" description="Enter the problem as a government officer sees it. A search creates a workspace problem and activates it across the Portal.">
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
                if (errorText) setErrorText("");
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
        {errorText && <p className="mt-2 text-xs font-medium text-danger">{errorText}</p>}
      </SectionCard>

      {/* Initial state */}
      {showInitial && (
        <div className="mt-4 rounded-card border border-dashed border-line bg-surface/60 p-10 text-center">
          <p className="text-sm text-ink-subtle">
            Describe a government problem to find businesses and solutions that may address it. The problem is saved to the
            workspace and becomes the active context for Command Center, Regulations, Policies, Solutions, Ground
            Intelligence, Reports and Copilot.
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
          Matching businesses against the workspace…
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="mt-4">
          {summary && (
            <SectionCard title="AI Summary" description="Context generated for this problem by the matching engine.">
              <p className="text-sm leading-relaxed text-ink-subtle">{summary}</p>
            </SectionCard>
          )}

          <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Matching Businesses</h2>
            <span className="text-xs text-ink-faint">
              {results.length} potential solution{results.length !== 1 ? "s" : ""} found · matched against the workspace
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
                <strong className="text-ink">This problem is now saved to the workspace ({problem.id}).</strong>{" "}
                {createdProblemId && <>Record {createdProblemId} was created and the matched businesses were associated.</>}{" "}
                Connected intelligence in Command Center, Regulations, Policies, Solutions, Ground Intelligence, Reports and
                Copilot now uses this problem context.
              </p>
              <Button variant="soft" size="sm" href={`/government/problems/${problem.id || createdProblemId}`}>View Problem</Button>
              <Button variant="outline" size="sm" href="/government">View in Command Center</Button>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-ink-faint">
            Matches are produced by the REGULENS AI matching engine against the live workspace database.
          </p>
        </div>
      )}
    </>
  );
}

SearchProblemPage.getLayout = (page) => <GovernmentLayout title="Search Problem">{page}</GovernmentLayout>;