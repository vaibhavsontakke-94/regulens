import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import { bizApi, handleApiError } from "@/lib/api";

const SUGGESTIONS = [
  "What compliance deadlines are coming up?",
  "Analyze our regulatory risk exposure",
  "Compare Kaduna vs Abuja for expansion",
  "What government schemes are we eligible for?",
  "Show our certification readiness status",
];

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your REGULENS Business Copilot. Ask me about compliance, risk, expansion readiness or regulatory intelligence for your business." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

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

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line pt-3">
            <Sparkles className="h-4 w-4 shrink-0 text-success" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about compliance, risk, expansion…"
              className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
            />
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