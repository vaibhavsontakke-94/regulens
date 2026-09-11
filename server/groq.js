const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const MODEL_CANDIDATES = () => {
  const configured = process.env.GROQ_MODEL;
  const list = [configured, DEFAULT_MODEL, "groq/compound", "qwen/qwen3.8-27b", "openai/gpt-oss-20b", "groq/compound-mini"].filter(
    (m, i, arr) => m && arr.indexOf(m) === i
  );
  return list;
};

export function groqAvailable() {
  return Boolean(process.env.GROQ_API_KEY);
}

function isModelNotFound(err) {
  const msg = String(err?.message || "");
  return err?.status === 404 || /model_not_found|does not exist/i.test(msg);
}

export async function groqChat({
  system = "",
  user = "",
  messages = [],
  temperature = 0.4,
  maxTokens = 1024,
}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");

  const stream = [];
  if (system) stream.push({ role: "system", content: system });
  stream.push(...messages);
  if (user) stream.push({ role: "user", content: user });

  const candidates = MODEL_CANDIDATES();
  let lastError = null;

  for (const model of candidates) {
    let res;
    try {
      res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ model, messages: stream, temperature, max_tokens: maxTokens }),
      });
    } catch (err) {
      lastError = err;
      throw err;
    }

    if (res.ok) {
      const json = await res.json();
      return (json?.choices?.[0]?.message?.content || "").trim();
    }

    const detail = await res.text().catch(() => "");
    lastError = new Error(`Groq API error ${res.status}: ${detail.slice(0, 300)}`);
    lastError.status = res.status;
    if (!isModelNotFound(lastError)) break;
    console.warn(`[groq] model ${model} unavailable, trying next candidate...`);
  }

  throw lastError || new Error("Groq API request failed.");
}

export async function groqWithFallback(user, { system = "", messages = [], fallback, maxTokens = 1024 } = {}) {
  if (!groqAvailable()) return fallback();
  try {
    const reply = await groqChat({ system, user, messages, maxTokens });
    return reply || fallback();
  } catch (err) {
    console.warn("[groq] call failed, using fallback:", err.message);
    return fallback();
  }
}