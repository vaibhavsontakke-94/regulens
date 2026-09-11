import { useState } from "react";
import { Send, Sparkles, ArrowUpRight } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { useGovernmentProblem } from "@/components/government/GovernmentProblemContext";

const SUGGESTIONS = [
  "Summarise priority problems in Lagos",
  "Which businesses are affected by tarif premiums?",
  "Draft a policy option for price bands",
  "What evidence is pending verification?",
];

const SEED = {
  role: "assistant",
  text: "I am your Government Copilot (demo). I can help you interrogate the illustrative problem, business, policy and evidence records in this workspace. Everything I answer is mock data.",
};

export default function CopilotPage() {
  const { problem } = useGovernmentProblem();
  const [messages, setMessages] = useState([SEED]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function buildReply(question) {
    const q = question.toLowerCase();
    if (problem && /business|solve|solutions?|match|who can/.test(q) && problem.solutions.length > 0) {
      const top = problem.solutions.slice(0, 3);
      return (
        `Using the active problem context ("${problem.title}"), the highest-priority matching businesses are:\n` +
        top.map((s) => `• ${s.name} — Priority ${s.priorityScore}/100 · ${s.technology}`).join("\n") +
        "\n\nThis is illustrative mock matching only. A live backend/AI would return real ranked results."
      );
    }
    if (problem) {
      return `This is a demo assistant. Using the active problem context ("${problem.title}"), a full response would pull linked businesses, regulations, policies and evidence. Illustrative only.`;
    }
    return "This is a demo assistant. A full regulatory analysis response would pull from the linked problem, business, policy and evidence records. Illustrative only.";
  }

  function send(text) {
    const question = text.trim();
    if (!question || thinking) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: buildReply(question),
        },
      ]);
      setThinking(false);
    }, 900);
  }

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Government Copilot"
        description="Demo assistant for interrogating the workspace records."
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
                      <Sparkles className="h-3 w-3" /> Copilot (demo)
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
        <Badge variant="amber" size="sm">Demo</Badge>
        <p className="text-xs text-ink-faint">Assistive responses are illustrative and generated locally in the browser.</p>
      </div>
    </>
  );
}

CopilotPage.getLayout = (page) => <GovernmentLayout title="Government Copilot">{page}</GovernmentLayout>;