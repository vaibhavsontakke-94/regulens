import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import StatCard from "@/components/government/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { govApi, handleApiError } from "@/lib/api";
import { SEVERITY_META } from "@/lib/mockData";
import { db } from "../../server/store.js";

const VERDICT_TONE = {
  "Not Ready": { badge: "red", text: "text-danger", hint: "Barriers need resolution before any broader rollout." },
  Conditional: { badge: "amber", text: "text-warning", hint: "Promising, but a wider second pilot should run first." },
  "Ready to Scale": { badge: "green", text: "text-success", hint: "Pilot evidence supports a staged national rollout." },
};

const inputCls =
  "h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-primary/60 disabled:pointer-events-none disabled:opacity-50";
const labelCls = "mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-ink-faint";

function AnalysisStats({ analysis, areaSeverity }) {
  const verdict = VERDICT_TONE[analysis.scaleVerdict] || VERDICT_TONE["Not Ready"];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Pilot Score" value={`${analysis.pilotScore}`} hint="Overall readiness of this solution+area combination (0–100)" />
      <StatCard label="Confidence" value={`${analysis.confidence}%`} hint="Confidence in the predicted pilot outcome" />
      <StatCard
        label="Scale Verdict"
        value={
          <Badge variant={verdict.badge}>{analysis.scaleVerdict}</Badge>
        }
        hint={verdict.hint}
      />
      <StatCard label="Area Severity" value={areaSeverity} hint="Current recorded severity for the pilot area" />
    </div>
  );
}

export default function TestAndScalePage({ initialProblems, initialProblemId }) {
  const router = useRouter();
  const problems = initialProblems || [];

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function selectProblem(id) {
    const problem = problems.find((p) => p.id === id);
    if (!problem) {
      setError("Problem not found in the workspace.");
      return;
    }
    setSelectedProblem(problem);
    setSolutions([]);
    setSelectedSolutionId("");
    const areas = problem.geographic?.areas || [];
    setSelectedArea(areas[0] || problem.location || "");
    setResult(null);
    setError("");
    setSolutionsLoading(true);
    govApi
      .problemSolutions(problem.id)
      .then((data) => {
        const sols = data.solutions || [];
        setSolutions(sols);
        setSelectedSolutionId(sols[0]?.id || "");
      })
      .catch((err) => setError(handleApiError(err)))
      .finally(() => setSolutionsLoading(false));
  }

  useEffect(() => {
    const initial = initialProblemId || problems[0]?.id;
    if (initial) selectProblem(String(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areaSeverity = useMemo(() => {
    if (!selectedProblem || !selectedArea) return "";
    return (selectedProblem.geographic?.severityByArea || {})[selectedArea] || selectedProblem.severity || "";
  }, [selectedProblem, selectedArea]);

  const verdict = result ? VERDICT_TONE[result.analysis.scaleVerdict] || VERDICT_TONE["Not Ready"] : null;

  async function handleRun() {
    if (!selectedProblem || !selectedSolutionId || !selectedArea) {
      setError("Select a problem, solution and pilot area before running the analysis.");
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const data = await govApi.testAndScale({
        problemId: selectedProblem.id,
        solutionId: selectedSolutionId,
        pilotArea: selectedArea,
      });
      setResult(data.record);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Test & Scale"
        description="Run a pilot analysis for a selected solution in one small area, predict its implementation outcome, and decide whether it is ready to scale nationally."
      />

      <div className="mb-6 rounded-lg border border-primary/30 bg-primary-soft/20 px-4 py-3 text-sm text-primary">
        <strong>Workspace analysis.</strong> Predictions are AI-generated estimates produced by REGULENS' analysis engine from the recorded problem and solution data.
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </span>
          {problems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => selectProblem(selectedProblem?.id || problems[0].id)}>
              Reset
            </Button>
          )}
        </div>
      )}

      <SectionCard
        title="Configure Pilot"
        description="Pick the problem, one of its linked solutions, and a small geographic area to test in."
      >
        {problems.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-line bg-surface-muted/40 p-5 text-sm text-ink-faint">
            No problems are available in the workspace.{" "}
            <a href="/government/search-problem" className="font-medium text-primary hover:underline">
              Search a problem
            </a>{" "}
            to get started.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label htmlFor="ts-problem" className={labelCls}>Problem</label>
              <select
                id="ts-problem"
                className={inputCls}
                value={selectedProblem?.id || ""}
                onChange={(e) => selectProblem(e.target.value)}
              >
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>{p.id} · {p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ts-solution" className={labelCls}>Solution</label>
              <select
                id="ts-solution"
                className={inputCls}
                value={selectedSolutionId}
                onChange={(e) => setSelectedSolutionId(e.target.value)}
                disabled={solutionsLoading || solutions.length === 0}
              >
                {solutionsLoading ? (
                  <option>Loading solutions…</option>
                ) : solutions.length === 0 ? (
                  <option>No linked solutions</option>
                ) : (
                  solutions.map((s) => (
                    <option key={s.id} value={s.id}>{s.title} · {s.cost} · {s.time}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label htmlFor="ts-area" className={labelCls}>Pilot Area</label>
              <select
                id="ts-area"
                className={inputCls}
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                {(selectedProblem?.geographic?.areas || []).map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {selectedProblem && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-surface-muted p-3.5 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{selectedProblem.title}</p>
              <p className="text-xs text-ink-faint">{selectedProblem.id} · {selectedProblem.location} · severity {selectedProblem.severity}</p>
            </div>
            {areaSeverity && (
              <Badge variant={SEVERITY_META[areaSeverity]?.variant || "neutral"} size="sm">
                {selectedArea}: {areaSeverity}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleRun}
            loading={running}
            disabled={!selectedProblem || solutions.length === 0 || !selectedArea}
            data-testid="run-test-and-scale"
          >
            {running ? "Analyzing…" : "Run Test & Scale Analysis"}
          </Button>
          {selectedProblem && (
            <Button
              variant="ghost"
              size="sm"
              href={`/government/problems/${selectedProblem.id}`}
            >
              View problem
            </Button>
          )}
        </div>
      </SectionCard>

      {result && (
        <div className="mt-6 space-y-4">
          <SectionCard
            title="Pilot Analysis"
            description={`${result.id} · ${result.problemTitle} → ${result.solutionTitle} · ${result.pilotArea}`}
            action={
              <Badge
                variant={verdict.badge}
                dot
              >
                {result.analysis.scaleVerdict}
              </Badge>
            }
          >
            <AnalysisStats analysis={result.analysis} areaSeverity={areaSeverity} />
          </SectionCard>

          <SectionCard title="Predicted Impact" description="What implementing the solution in the pilot area is expected to achieve.">
            <p className="text-[15px] leading-relaxed text-ink-subtle">{result.analysis.predictedImpact}</p>
          </SectionCard>

          <SectionCard title="Pilot Phases" description="Suggested three-phase test plan for the selected area.">
            <ol className="space-y-3">
              {result.analysis.phases.map((phase, i) => (
                <li key={i} className="flex items-start gap-3 rounded-[10px] border border-line p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink">{phase.name}</p>
                      <Badge variant="blue" size="sm">{phase.duration}</Badge>
                      <Badge variant="neutral" size="sm">{phase.cost} cost</Badge>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{phase.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Success Indicators" description="Measure these at the end of the pilot to judge the outcome.">
              <ul className="space-y-2.5">
                {result.analysis.successIndicators.map((indicator, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-subtle">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    {indicator}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Risks & Mitigations" description="Likely risks to the pilot and how to handle them.">
              <ul className="space-y-2.5">
                {result.analysis.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-subtle">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                    <div className="min-w-0">
                      <p>{r.risk} <Badge variant={r.likelihood === "High" ? "red" : r.likelihood === "Medium" ? "amber" : "green"} size="sm">{r.likelihood}</Badge></p>
                      <p className="mt-0.5 text-xs text-ink-faint">{r.mitigation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard title="Rollout Guidance" description="Recommended next step after the pilot verdict.">
            <div className={`flex items-start gap-3 rounded-[10px] ${verdict.text} bg-surface-muted p-4`}>
              <ArrowRight className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-[15px] font-medium leading-relaxed">{result.analysis.rolloutGuidance}</p>
            </div>
          </SectionCard>

          <p className="text-center text-xs text-ink-faint">
            This analysis is stored in the workspace (record {result.id}) and mirrored to the persistence layer. Recommendations are AI-generated estimates, not official decisions.
          </p>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps({ query }) {
  const problems = JSON.parse(JSON.stringify(db.state.problems || []));
  const initialProblemId = Array.isArray(query.problemId) ? query.problemId[0] : query.problemId || "";
  return {
    props: { initialProblems: problems, initialProblemId },
  };
}

TestAndScalePage.getLayout = (page) => <GovernmentLayout title="Test & Scale">{page}</GovernmentLayout>;