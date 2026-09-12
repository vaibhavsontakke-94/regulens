const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const MAX_429_RETRIES = 6;

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

  function retryWaitMs(resp, detail) {
    const header = Number(resp && resp.headers && resp.headers.get("retry-after"));
    if (Number.isFinite(header) && header > 0) return Math.min(Math.max(header * 1000, 1000), 45000);
    const m = /in\s+([\d.]+)\s*(?:seconds?|s)/i.exec(detail || "");
    if (m) return Math.min(Math.max(Number(m[1]) * 1000, 1000), 45000);
    return 5000;
  }
  const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const model of candidates) {
    let res = null;
    let modelError = null;
    for (let attempt = 1; attempt <= MAX_429_RETRIES; attempt += 1) {
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
        throw err;
      }

      if (res.ok) {
        const json = await res.json();
        return (json?.choices?.[0]?.message?.content || "").trim();
      }

      const detail = await res.text().catch(() => "");
      modelError = new Error(`Groq API error ${res.status}: ${detail.slice(0, 300)}`);
      modelError.status = res.status;
      if (res.status === 429 && attempt < MAX_429_RETRIES) {
        const wait = retryWaitMs(res, detail);
        console.warn(`[groq] rate limited on ${model} (attempt ${attempt} of ${MAX_429_RETRIES}), retrying in ${Math.round(wait / 1000)}s...`);
        await sleepMs(wait);
        continue;
      }
      break;
    }
    lastError = modelError || lastError;
    if (!isModelNotFound(lastError)) break;
    console.warn(`[groq] model ${model} unavailable, trying next candidate...`);
  }

  throw lastError || new Error("Groq API request failed.");
}

const VISION_MODEL_CANDIDATES = () => {
  const configured = process.env.GROQ_VISION_MODEL;
  return [configured, "qwen/qwen3.6-27b", "qwen/qwen3.8-27b"].filter(
    (m, i, arr) => m && arr.indexOf(m) === i
  );
};

const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

export async function groqVision({ system = "", prompt = "", images = [], maxTokens = 900 } = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");
  if (!images || !images.length) throw new Error("No images provided for vision analysis.");
  const safeMaxTokens = Math.min(maxTokens, 900);

  const content = [{ type: "text", text: prompt }];
  for (const imageUrl of images) {
    content.push({ type: "image_url", image_url: { url: imageUrl } });
  }
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content });

  let lastError = null;
  const bodyFor = (model, extra) =>
    JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: safeMaxTokens,
      ...extra,
    });
  for (const model of VISION_MODEL_CANDIDATES()) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const res = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: bodyFor(model, { reasoning_format: "hidden" }),
        });
        if (res.ok) {
          const json = await res.json();
          const reply = (json?.choices?.[0]?.message?.content || "").trim();
          if (reply) return stripReasoning(reply);
        }
        const detail = await res.text().catch(() => "");
        lastError = new Error(`Groq vision API error ${res.status}: ${detail.slice(0, 200)}`);

        if (res.status === 400 && /unsupported|unknown parameter|extra input|unexpected/i.test(detail) && attempt === 1) {
          console.warn(`[groq] vision ${model} rejected reasoning params, retrying without...`);
          const res2 = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: bodyFor(model, {}),
          });
          if (res2.ok) {
            const json = await res2.json();
            const reply = (json?.choices?.[0]?.message?.content || "").trim();
            if (reply) return stripReasoning(reply);
          }
          const detail2 = await res2.text().catch(() => "");
          lastError = new Error(`Groq vision API error ${res2.status}: ${detail2.slice(0, 200)}`);
          break;
        }
        if (res.status === 429 && attempt === 1) {
          console.warn(`[groq] vision rate limited on ${model}, retrying...`);
          await sleepMs(6000);
          continue;
        }
        if (!isModelNotFound(lastError)) break;
      } catch (err) {
        lastError = err;
        break;
      }
    }
    if (lastError && !isModelNotFound(lastError)) break;
    console.warn(`[groq] vision model ${model} unavailable, trying next candidate...`);
  }

  throw lastError || new Error("Groq vision request failed.");
}

function stripReasoning(reply) {
  const idx = reply.indexOf(" response");
  if (idx > -1) {
    const after = reply.slice(idx + " response".length).trim();
    if (after) return after;
  }
  return reply.replace(/^[\s\S]*?thinking\/?>/s, "").trim();
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