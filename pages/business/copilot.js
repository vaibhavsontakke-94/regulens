import { useState, useRef } from "react";
import { Sparkles, Send, FileText, Paperclip, X } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import { bizApi, handleApiError } from "@/lib/api";

const SUGGESTIONS = [
  "What compliance deadlines are coming up?",
  "Analyze our regulatory risk exposure",
  "Compare Mumbai vs Pune for expansion",
  "What government schemes are we eligible for?",
  "Show our certification readiness status",
];

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your REGULENS Business Copilot. Ask me about compliance, risk, expansion readiness or regulatory intelligence for your business." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [docText, setDocText] = useState("");
  const [docError, setDocError] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  function onFileSelected(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) {
      setDocError("File is too large. Maximum upload size is 12 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "").split(",")[1] || "";
      if (!base64) {
        setDocError("The file could not be read.");
        return;
      }
      setFileInfo({ name: f.name, mimeType: f.type || "application/octet-stream", base64, size: f.size });
      setDocError("");
    };
    reader.onerror = () => setDocError("The file could not be read.");
    reader.readAsDataURL(f);
  }

  async function sendDocument() {
    const text = docText.trim();
    if ((!text && !fileInfo) || thinking) {
      setDocError("Paste some text or choose a file to review.");
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `[Document review${fileInfo ? ` · ${fileInfo.name}` : ""}]\n${
          fileInfo ? fileInfo.name : text.length > 500 ? text.slice(0, 500) + "…" : text
        }`,
      },
    ]);
    const payload = fileInfo ? { file: fileInfo } : { document: text };
    setDocText("");
    setFileInfo(null);
    setDocError("");
    setShowDoc(false);
    setThinking(true);
    try {
      const data = await bizApi.documentReview(payload);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `The assistant could not be reached: ${handleApiError(err)}` },
      ]);
    } finally {
      setThinking(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setThinking(true);
    try {
      const data = await bizApi.copilot({ message: question });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `The assistant could not be reached: ${handleApiError(err)}` },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      <BusinessPageHeader
        eyebrow="Workspace"
        title="REGULENS Copilot"
        description="AI-powered assistant for compliance, risk and expansion queries."
      />

      <SectionCard className="mb-6">
        <div className="flex flex-col gap-3" style={{ minHeight: 300 }}>
          <div className="flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: 400 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-success text-white"
                      : "bg-surface-muted text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-subtle transition-colors hover:border-success/50 hover:bg-success-soft/30 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {showDoc && (
            <div className="mb-3 rounded-md border border-line bg-surface p-3">
              <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-ink-faint">
                Review a document — upload a file or paste text, then get a simple summary
              </p>

              <div className="mb-2 flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.csv,.json,.log,.rtf,.html,.htm"
                  onChange={onFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-subtle transition-colors hover:border-success/50 hover:text-ink"
                >
                  <Paperclip className="h-3.5 w-3.5" /> Choose file
                </button>
                {fileInfo && (
                  <span className="flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1.5 text-xs text-ink">
                    <FileText className="h-3.5 w-3.5 text-success" />
                    {fileInfo.name}
                    <span className="text-ink-faint">({(fileInfo.size / 1024).toFixed(0)} KB)</span>
                    <button
                      type="button"
                      onClick={() => setFileInfo(null)}
                      className="text-ink-faint transition-colors hover:text-danger"
                      aria-label="Remove file"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <span className="text-xs text-ink-faint">— or —</span>
                <span className="text-xs text-ink-faint">paste below</span>
              </div>

              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                rows={4}
                placeholder="Paste the document text here…"
                className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
              />
              {docError && <p className="mt-2 text-xs text-danger">{docError}</p>}
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={sendDocument}
                  disabled={(!docText.trim() && !fileInfo) || thinking}
                  className="flex items-center gap-1.5 rounded-md bg-success px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:bg-success/90 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Summarise in simple words
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDoc(false);
                    setDocText("");
                    setFileInfo(null);
                    setDocError("");
                  }}
                  className="text-xs text-ink-faint transition-colors hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line pt-3">
            <Sparkles className="h-4 w-4 shrink-0 text-success" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about compliance, risk, expansion…"
              className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
            />
            <button
              type="button"
              onClick={() => {
                setShowDoc((v) => !v);
                setDocText("");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-subtle transition-colors hover:border-success/50 hover:text-ink"
              aria-label="Review a document"
              title="Review a document"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-success text-white transition-colors hover:bg-success/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
            {thinking && (
              <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-subtle">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-success" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-success" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-success" style={{ animationDelay: "300ms" }} />
                Analyzing…
              </span>
            )}
          </form>
        </div>
      </SectionCard>
    </>
  );
}

CopilotPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};