import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supa = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY;
const EMBEDDING_ENDPOINT = process.env.EMBEDDING_ENDPOINT || "https://api.example.com/embed";

export async function embedText(text) {
  if (!EMBEDDING_API_KEY) {
    console.warn("[embedding] EMBEDDING_API_KEY not configured, fallback embeddings will be zero vectors.");
    return Array(768).fill(0);
  }

  try {
    const res = await fetch(EMBEDDING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMBEDDING_API_KEY}`,
      },
      body: JSON.stringify({ input: text, model: "text-embedding-3-large" }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      throw new Error(`Embedding API ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.data?.[0]?.embedding || [];
  } catch (err) {
    console.error("[embedding] Error:", err.message);
    return Array(768).fill(0);
  }
}

export async function storeEmbedding(workspaceId, type, referenceId, content, embedding) {
  if (!supa) {
    console.warn("[embedding] Supabase not configured, cannot store embedding.");
    return false;
  }

  const { error } = await supa.from("vectors").insert({
    workspace_id: workspaceId,
    type,
    reference_id: referenceId,
    content,
    embedding: embedding, // stored as vector(768) via pgvector
    metadata: {},
  });

  if (error) {
    console.error("[embedding] Supastore insert error:", error.message);
    return false;
  }
  return true;
}

export async function getEmbeddings(workspaceId, type = null) {
  if (!supa) {
    console.warn("[embedding] Supabase not configured.");
    return [];
  }

  const { data, error } = await supa
    .from("vectors")
    .select("*")
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("[embedding] Supabase query error:", error.message);
    return [];
  }

  return data || [];
}

export function cosineSimilarity(a, b) {
  if (a.length !== b.length) throw new Error("Vector dimension mismatch");
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function similaritySearch(workspaceId, queryEmbedding, type = null, topK = 4) {
  if (!supa) {
    console.warn("[embedding] Supabase not configured, cannot perform similarity search.");
    return [];
  }

  const all = await getEmbeddings(workspaceId, type);

  // Compute cosine similarity in JavaScript and sort
  const scored = all.map((item) => {
    const sim = cosineSimilarity(queryEmbedding, item.embedding);
    return { ...item, score: sim };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}