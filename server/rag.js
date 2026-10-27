import { groqChat } from "./groq.js";
import { VectorStore } from "./vectorStore.js";

const DEFAULT_TOP_K = 4;
const MAX_CONTEXT_CHARS = 2000;

export async function ragChat({ question, system = "", store, topK = DEFAULT_TOP_K }) {
  // 1. Retrieve relevant documents from the vector store
  const hits = await store.query(question, topK);

  // 2. Build context from retrieved documents
  let context = "";
  for (const hit of hits) {
    const snippet = hit.text.length > MAX_CONTEXT_CHARS
      ? hit.text.substring(0, MAX_CONTEXT_CHARS) + "..."
      : hit.text;
    context += `\n--- Document (score: ${hit.toFixed(3)}) ---\n${snippet}\n`;
  }

  // 3. Send question + context to LLM via Groq
  const messages = [
    { role: "system", content: system || "You are a regulatory intelligence assistant. Use the provided context to answer the user's question. If the context doesn't contain the answer, say you don't know." },
    { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
  ];

  const reply = await groqChat({ messages, temperature: 0.3, maxTokens: 1024 });
  return {
    answer: reply || "I couldn't generate a response.",
    sources: hits.map((h) => ({ text: h.text.substring(0, 200), score: h.score })),
  };
}

export async function initializeRAGFromStore(store) {
  // Hydrate the vector store from existing data if needed
  const docs = store.getAll();
  if (docs.length > 0) {
    await store.addBatch(docs.map((d) => d.text));
  }
  return store;
}