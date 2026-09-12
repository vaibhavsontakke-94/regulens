import { useState, useRef } from "react";
import { Send, Sparkles, ArrowUpRight, FileText, Paperclip, X } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";
import { govApi, handleApiError } from "@/lib/api";

const SUGGESTIONS = [
  "Summarise priority problems in Mumbai",
  "Which businesses are affected by tariff premiums?",
  "Draft a policy option for price bands",
  "What evidence is pending verification?",
];

const SEED = {
  role: "assistant",
  text: "I am your Government Copilot. Ask me about the problems, affected businesses, regulations, policies, solutions, evidence and reports in this workspace.",
};

export default function CopilotPage() {
  const { problem } = useGovernmentProblem();
  const [messages, setMessages] = useState([SEED]);
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
    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: `[Document review${fileInfo ? ` · ${fileInfo.name}` : ""}]\n${
          fileInfo ? fileInfo.name : text.length > 500 ? text.slice(0, 500) + "…" : text
        }`,
      },
    ]);
    const payload = fileInfo ? { file: fileInfo, problem } : { document: text, problem };
    setDocText("");
    setFileInfo(null);
    setDocError("");
    setShowDoc(false);
    setThinking(true);
    try {
      const data = await govApi.documentReview(payload);
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `The assistant could not be reached: ${handleApiError(err)}` },
      ]);
    } finally {
      setThinking(false);
    }
  }

  async function send(text) {
    const question = text.trim();
    if (!question || thinking) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    try {
      const data = await govApi.copilot({ message: question, problem });
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `The assistant could not be reached: ${handleApiError(err)}` },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Government Copilot"
        description="AI assistant for interrogating the workspace records."
      />

      {problem && (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-primary">Active Context</p>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{problem.id} · {problem.title}</p>
          <div className="flex items-center gap-2">
            <Badge variant="amber" size="sm">{problem.status}</Badge>
            <span className="text-xs text-ink-faint">Priority {problem.priorityScore}/100 · {problem.priorityLevel}</span>
          </div>
        </div>
      )}

      <SectionCard>
        <div className="flex h-[62vh] min-h-[420px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-[12px] px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-text"
                      : "border border-line bg-surface-muted text-ink-subtle"
                  }`}
                >
                  {m.role === "assistant" && (
                    <span className="mb-1 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-primary">
                      <Sparkles className="h-3 w-3" /> AI Copilot
                    </span>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-[12px] border border-line bg-surface-muted px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="flex items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-subtle transition-colors hover:border-primary/50 hover:text-ink"
                >
                  {s}
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {showDoc && (
            <div className="mb-3 rounded-[10px] border border-line bg-surface p-3">
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
                  className="flex items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-subtle transition-colors hover:border-primary/50 hover:text-ink"
                >
                  <Paperclip className="h-3.5 w-3.5" /> Choose file
                </button>
                {fileInfo && (
                  <span className="flex items-center gap-1.5 rounded-[10px] bg-surface-muted px-2.5 py-1.5 text-xs text-ink">
                    <FileText className="h-3.5 w-3.5 text-primary" />
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
                className="w-full resize-y rounded-[10px] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
              />
              {docError && <p className="mt-2 text-xs text-danger">{docError}</p>}
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={sendDocument}
                  disabled={(!docText.trim() && !fileInfo) || thinking}
                  className="flex items-center gap-1.5 rounded-[10px] bg-primary px-3.5 py-2 text-xs font-semibold text-primary-text transition-opacity disabled:opacity-40"
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-line pt-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about problems, businesses, policies or evidence…"
              className="h-11 flex-1 rounded-[10px] border border-line bg-surface px-3.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/60"
            />
            <button
              type="button"
              onClick={() => {
                setShowDoc((v) => !v);
                setDocText("");
              }}
              className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface text-ink-subtle transition-colors hover:border-primary/50 hover:text-ink"
              aria-label="Review a document"
              title="Review a document"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary text-primary-text transition-opacity disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </SectionCard>
      <div className="mt-4 flex items-center gap-2">
        <Badge variant="success" size="sm">AI</Badge>
        <p className="text-xs text-ink-faint">Responses are generated by the REGULENS Copilot from workspace context and may reference live workspace data.</p>
      </div>
    </>
  );
}

CopilotPage.getLayout = (page) => <GovernmentLayout title="Government Copilot">{page}</GovernmentLayout>;