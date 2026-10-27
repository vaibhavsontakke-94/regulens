import { embedText, cosineSimilarity, similaritySearch, storeEmbedding, getEmbeddings } from "./embedding.js";

export class VectorStore {
  constructor(dimensions = 768) {
    this.dimensions = dimensions;
    this.vectors = new Map(); // id -> { vector, text, metadata } (local cache)
    this.idx = 0;
    this.workspaceId = "government-demo"; // default workspace
  }

  async setWorkspace(workspaceId) {
    this.workspaceId = workspaceId;
    // Load existing embeddings from Supabase
    const stored = await getEmbeddings(workspaceId);
    this.vectors.clear();
    for (const item of stored) {
      const id = item.reference_id || `doc-${this.idx++}`;
      this.vectors.set(id, {
        vector: item.embedding,
        text: item.content || "",
        metadata: item.metadata || {},
        type: item.type,
      });
    }
    console.log(`[vectorStore] Loaded ${stored.length} vectors from Supabase for workspace ${workspaceId}`);
  }

  async add(text, metadata = {}) {
    const vector = await embedText(text);
    const id = `doc-${this.idx++}`;
    this.vectors.set(id, { vector, text, metadata, type: metadata.type });
    
    // Store in Supabase for persistence
    await storeEmbedding(this.workspaceId, metadata.type || "document", id, text, vector);
    
    return id;
  }

  async addBatch(texts, metadatas = []) {
    const ids = await Promise.all(
      texts.map((text, i) => this.add(text, metadatas[i] || {}))
    );
    return ids;
  }

  // Cosine similarity
  cosineSimilarity(a, b) {
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

  async query(question, topK = 4) {
    const qVec = await embedText(question);
    const results = [];

    for (const [id, { vector, text, metadata }] of this.vectors) {
      const sim = cosineSimilarity(qVec, vector);
      results.push({ id, text, metadata, score: sim });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  getAll() {
    return Array.from(this.vectors.values()).map(({ text, metadata }) => ({
      text,
      metadata,
    }));
  }
}