import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { bizApi } from "@/lib/api";

const EMPTY_WORKSPACE = {
  staticProfile: { name: "Your Business", legalName: "", businessType: "", industry: "", profileCompletion: 0, identity: { businessName: "", registrar: "", employees: "", businessSize: "" } },
  healthScores: { overall: 0, compliance: 0, risk: 0, operations: 0, financialExposure: 0, growthReadiness: 0, label: "Not set up", summary: "" },
  compliance: [],
  riskCategories: [],
  riskAnalysis: { matrixAxis: { x: "Probability", y: "Impact" }, risks: [], timeline: [], mitigations: [] },
  expansionFactors: [],
  expansionAnalysis: { currentRegion: "", targetRegion: "", currentScore: 0, targetScore: 0, advantages: [], requirements: [], risks: [], estimatedCost: "", recommendedActions: [] },
  expansionReadiness: { readiness: 0, label: "Not set up", summary: "", breakdown: [] },
  certifications: [],
  certificationIntel: [],
  regulatoryUpdates: [],
  schemes: [],
  problems: [],
  problemLifecycle: [],
  evidence: [],
  reports: [],
  financialImpact: { complianceCost: "₹ 0M", potentialExposure: "₹ 0M", setupCost: "₹ 0M", expansionCost: "₹ 0M", operationalImpact: "₹ 0M", note: "", bars: [] },
  notifications: [],
  profile: null,
};

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [data, setData] = useState(EMPTY_WORKSPACE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const value = await bizApi.workspace();
      setData(value || EMPTY_WORKSPACE);
      setError(null);
    } catch (err) {
      setError(err?.message || "Unable to load your workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ data, loading, error, refresh, isHydrated: !loading }),
    [data, loading, error, refresh]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}