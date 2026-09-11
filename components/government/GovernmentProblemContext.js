import { createContext, useContext, useEffect, useState } from "react";

// Lightweight frontend-only problem context.
// Persists the active Government problem to localStorage so it survives
// navigation (and refresh) across the Government Portal.
// Production: data comes from POST /api/v1/problems + related GET APIs.

const STORAGE_KEY = "regulens:govActiveProblem:v1";

const GovernmentProblemContext = createContext({
  problem: null,
  setProblem: () => {},
  clearProblem: () => {},
});

export default function GovernmentProblemProvider({ children }) {
  const [problem, setProblemState] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProblemState(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  function setProblem(p) {
    setProblemState(p);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      // ignore storage failures
    }
  }

  function clearProblem() {
    setProblemState(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  }

  return (
    <GovernmentProblemContext.Provider value={{ problem, setProblem, clearProblem }}>
      {children}
    </GovernmentProblemContext.Provider>
  );
}

export function useGovernmentProblem() {
  return useContext(GovernmentProblemContext);
}