import { useState, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { cx } from "@/lib/utils";

export default function CopilotPanel({
  isOpen,
  onClose,
  onSend,
  onSuggested,
  messages: externalMessages,
  setMessages: externalSetMessages,
  suggestedPrompts = [
    "What compliance deadlines are coming up?",
    "Analyze our regulatory risk exposure",
    "What government schemes are we eligible for?",
    "Show our certification readiness status",
  ],
  context,
}) {
  const [internalMessages, setInternalMessages] = useState([]);
  const [input, setInput] = useState("");

  const messages = externalMessages || internalMessages;
  const setMessages = externalSetMessages || setInternalMessages;

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      const inputEl = document.querySelector('input[placeholder*="Ask"]');
      if (inputEl) inputEl.focus();
    }, 100);
  }, [isOpen]);

  const handleSend = (e, textOverride) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = (textOverride || input).trim();
    if (!text) return;
    setMessages((prev) => [...(prev || []), { role: "user", content: text }]);
    const reply = "I can help with regulatory intelligence for your business. In this demo, I'll provide illustrative guidance based on your profile and activity.";
    setTimeout(() => {
      setMessages((prev) => [...(prev || []), { role: "assistant", content: reply }]);
    }, 500);
    onSend?.(text);
    setInput("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, input, messages]);

  if (!isOpen) return null;

  return (
    <div
      className={cx(
        "fixed bottom-4 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl transition-transform duration-300 ease-out",
        "inset-x-4 sm:inset-x-auto sm:right-4 sm:w-[400px] sm:max-w-[calc(100vw-2rem)]"
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">REGULENS Copilot</span>
          {context && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {context}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Copilot"
          className="rounded-full p-1.5 text-ink-subtle hover:bg-surface-muted transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex h-72 flex-col overflow-y-auto px-4 py-3 space-y-3">
        {(!messages || messages.length === 0) && (
          <div className="rounded-lg bg-surface-muted px-3.5 py-2.5 text-sm leading-relaxed text-ink">
            <span className="mb-1 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-success">
              <Sparkles className="h-2.5 w-2.5" /> Copilot
            </span>
            Ask me anything about your business compliance, regulatory risk, growth and certifications.
          </div>
        )}
        {(messages || []).map((m, i) => (
          <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cx(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "bg-success text-white" : "bg-surface-muted text-ink"
              )}
            >
              {m.role === "assistant" && (
                <span className="mb-1 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-success">
                  <Sparkles className="h-2.5 w-2.5" /> Copilot
                </span>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {messages && messages.length > 0 && suggestedPrompts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(null, prompt)}
                className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink-subtle transition-colors hover:border-primary/40 hover:text-primary dark:bg-transparent"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-line">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask REGULENS..."
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-success/60"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-success text-white transition-colors hover:bg-success/90 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}