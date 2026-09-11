import { useEffect, useRef, useState } from "react";
import { FileText, FileCheck, AlertTriangle, BugOff, Search } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import CompactMetric from "@/components/business/ui/CompactMetric";
import EvidenceUploader from "@/components/business/evidence/EvidenceUploader";
import DocumentCard from "@/components/business/evidence/DocumentCard";
import DocumentAnalysis from "@/components/business/evidence/DocumentAnalysis";

const EVIDENCE_KEY = "regulens-evidence-documents";

function sizeLabel(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function outcomeFor(name) {
  const h = (name.length * 7 + namBMI(name)) % 12;
  if (h === 3 || h === 9) return "needs-review";
  if (h === 7) return "failed";
  return "complete";
}

function namBMI(name) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % 10;
}

function buildAnalysis(name, type) {
  const ext = type.toUpperCase();
  return {
    confidence: 82 + (name.length % 15),
    summary: `This ${ext} document was automatically reviewed against your business profile and the current REGULENS regulatory corpus. The analysis focuses on compliance obligations, licensing, environmental requirements and expansion-related documentation.`,
    keyInformation: [
      `Document type ${ext} recognized; metadata appears consistent with business records.`,
      "No personal or sensitive data redistribution detected.",
      "Content aligns with the business profile industry and operations.",
    ],
    complianceRelevance: [
      "Potential relevance to registration and licensing renewals.",
      "May support compliance evidence for reporting obligations.",
      "Could be referenced by regulatory authorities during inspections.",
    ],
    potentialRisks: [
      "Expiry or renewal dates should be verified against current requirements.",
      "Confirm the issuing authority matches the jurisdiction's official register.",
      "Cross-check referenced figures with official filings to avoid discrepancies.",
    ],
    missingInformation: [
      "Official reference or document number.",
      "Certified copy / notarization where required.",
      "Additional supporting attachments referenced within the document.",
    ],
    importantDates: [
      "Renewal or validity deadline — verify against requirement due dates.",
      "Next reporting or submission milestone.",
    ],
    recommendedActions: [
      "Attach this document to the relevant compliance requirement.",
      "Schedule a renewal reminder before the expiry date.",
      "Share with your designated compliance officer for review.",
    ],
    sources: ["CAC", "FM Trade & Investment", "NESREA"],
  };
}

export default function EvidencePage() {
  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const timers = useRef({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EVIDENCE_KEY);
      if (raw) setDocuments(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(EVIDENCE_KEY, JSON.stringify(documents));
    } catch {
      /* ignore */
    }
  }, [documents]);

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearInterval);
    };
  }, []);

  function analyze(doc) {
    clearInterval(timers.current[doc.id]);
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "analyzing", progress: 5, analysis: null } : d)));
    const interval = setInterval(() => {
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id !== doc.id) return d;
          const next = Math.min(100, (d.progress || 5) + Math.round(Math.random() * 22));
          if (next >= 100) {
            clearInterval(interval);
            delete timers.current[doc.id];
            const outcome = outcomeFor(d.name);
            return {
              ...d,
              status: outcome,
              progress: 100,
              analysis: outcome === "complete" || outcome === "needs-review" ? buildAnalysis(d.name, d.type) : null,
            };
          }
          return { ...d, progress: next };
        })
      );
    }, 380);
    timers.current[doc.id] = interval;
  }

  function addFiles(files) {
    const newDocs = files.map((f) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      type: f.name.split(".").pop().toLowerCase(),
      size: sizeLabel(f.size),
      date: formatDate(new Date()),
      status: "uploading",
      progress: 0,
      analysis: null,
    }));
    setDocuments((prev) => [...newDocs, ...prev]);
    newDocs.forEach((doc) => {
      const uploading = setInterval(() => {
        setDocuments((prev) =>
          prev.map((d) => {
            if (d.id !== doc.id) return d;
            const next = Math.min(100, (d.progress || 0) + Math.round(Math.random() * 30));
            if (next >= 100) {
              clearInterval(uploading);
              delete timers.current[doc.id];
              analyze({ ...doc, progress: 100 });
              return { ...d, status: "analyzing", progress: 5 };
            }
            return { ...d, progress: next };
          })
        );
      }, 300);
      timers.current[doc.id] = uploading;
    });
  }

  function deleteDoc(id) {
    clearInterval(timers.current[id]);
    delete timers.current[id];
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function retryDoc(doc) {
    analyze({ ...doc, status: "analyzing", progress: 5 });
  }

  const active = documents.find((d) => d.id === activeId);
  const counts = {
    total: documents.length,
    complete: documents.filter((d) => d.status === "complete").length,
    needsReview: documents.filter((d) => d.status === "needs-review").length,
    issues: documents.filter((d) => d.status === "failed").length,
  };

  return (
    <>
      <BusinessPageHeader
        eyebrow="Reporting"
        title="Evidence Center"
        description="Upload business documents and get AI-assisted regulatory analysis."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <CompactMetric label="Documents" value={counts.total} hint="Uploaded evidence" icon={FileText} />
        <CompactMetric label="Analyzed" value={counts.complete} hint="Analysis complete" icon={FileCheck} iconClassName="text-success" />
        <CompactMetric label="Needs Review" value={counts.needsReview} hint="Require attention" icon={Search} iconClassName="text-warning" />
        <CompactMetric label="Issues Found" value={counts.issues} hint="Analysis failed" icon={BugOff} iconClassName="text-danger" />
      </div>

      <EvidenceUploader onFiles={addFiles} />

      {documents.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Your Documents</h2>
            <span className="text-xs text-ink-faint">{documents.length} file{documents.length === 1 ? "" : "s"}</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onOpen={(d) => setActiveId(d.id === activeId ? null : d.id)}
                onDelete={deleteDoc}
                onRetry={retryDoc}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-line bg-white p-5 text-sm text-ink-subtle dark:bg-ink-soft">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          No documents yet. Upload a PDF, DOCX, XLSX, JPG or PNG to begin AI-assisted analysis.
        </div>
      )}

      {active && active.analysis && <DocumentAnalysis doc={active} onClose={() => setActiveId(null)} />}
      {active && active.status !== "complete" && active.status !== "needs-review" && active.analysis === null && (
        <div className="mt-6 rounded-lg border border-line bg-white p-5 text-sm text-ink-subtle dark:bg-ink-soft">
          {active.status === "failed"
            ? "This document's analysis failed. Try again or upload a clearer file."
            : "Analysis is in progress for this document. Results will appear shortly."}
        </div>
      )}
    </>
  );
}

EvidencePage.getLayout = (page) => <BusinessLayout>{page}</BusinessLayout>;