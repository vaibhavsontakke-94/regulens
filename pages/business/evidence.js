import { useEffect, useState } from "react";
import { FileText, FileCheck, AlertTriangle, BugOff, Search } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader from "@/components/business/ui/PageHeader";
import CompactMetric from "@/components/business/ui/CompactMetric";
import EvidenceUploader from "@/components/business/evidence/EvidenceUploader";
import DocumentCard from "@/components/business/evidence/DocumentCard";
import DocumentAnalysis from "@/components/business/evidence/DocumentAnalysis";
import { bizApi } from "@/lib/api";

function sizeLabel(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function toDoc(e) {
  return {
    id: e.id,
    name: e.title,
    type: e.type || "document",
    size: sizeLabel(e.size || 0),
    date: formatDate(e.date),
    status: e.analysis ? e.status || "complete" : "failed",
    progress: e.progress ?? 100,
    analysis: e.analysis || null,
  };
}

export default function EvidencePage() {
  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let alive = true;
    bizApi
      .evidence()
      .then((res) => {
        if (!alive) return;
        setDocuments((res.evidence || []).map(toDoc));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  function addFiles(files) {
    files.forEach((file) => {
      const localId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ext = file.name.split(".").pop().toLowerCase();
      setDocuments((prev) => [
        { id: localId, name: file.name, type: ext, size: sizeLabel(file.size), date: formatDate(new Date()), status: "analyzing", progress: 30, analysis: null },
        ...prev,
      ]);
      bizApi
        .createEvidence({ title: file.name, type: ext, size: file.size })
        .then((res) => {
          setDocuments((prev) => prev.map((d) => (d.id === localId ? toDoc({ ...res.evidence, analysis: res.analysis }) : d)));
        })
        .catch(() => {
          setDocuments((prev) => prev.map((d) => (d.id === localId ? { ...d, status: "failed", progress: 100 } : d)));
        });
    });
  }

  function deleteDoc(id) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeId === id) setActiveId(null);
    if (id && !id.startsWith("pending-")) {
      bizApi.deleteEvidence(id).catch(() => {});
    }
  }

  function retryDoc(doc) {
    if (!doc.id || doc.id.startsWith("pending-")) return;
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "analyzing", progress: 30, analysis: null } : d)));
    bizApi
      .analyzeEvidence(doc.id)
      .then((res) => {
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? toDoc({ ...res.evidence, analysis: res.analysis }) : d)));
      })
      .catch(() => {
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "failed", progress: 100 } : d)));
      });
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
      {active && active.analysis === null && (
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