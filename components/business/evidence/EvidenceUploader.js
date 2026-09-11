import { useRef, useState } from "react";
import { CloudUpload, FileUp, UploadCloud } from "lucide-react";
import { cx } from "@/lib/utils";

const ACCEPTED = ["pdf", "docx", "xlsx", "jpg", "png"];

export default function EvidenceUploader({ onFiles }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function accept() {
    return ACCEPTED.map((ext) => `.${ext}`).join(",");
  }

  function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const invalid = files.filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return !ACCEPTED.includes(ext);
    });
    if (invalid.length > 0) {
      setError(`${invalid.map((f) => f.name).join(", ")} — unsupported file type.`);
      return;
    }
    setError("");
    onFiles(files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cx(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragging ? "border-primary bg-primary-soft/40" : "border-line bg-surface-muted/40"
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <CloudUpload className="h-6 w-6" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">Drag and drop documents here</p>
        <p className="mt-0.5 text-xs text-ink-subtle">or browse files from your computer</p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary/40 hover:text-primary dark:bg-transparent"
      >
        <FileUp className="h-4 w-4" aria-hidden="true" />
        Browse Files
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept()}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-ink-faint">Supported: PDF, DOCX, XLSX, JPG, PNG. Max 20MB per file.</p>
      {error && (
        <p role="alert" className="flex items-center gap-2 text-xs font-medium text-danger">
          <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}