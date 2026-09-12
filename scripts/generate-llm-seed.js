import { generateLlmSeed } from "../server/llmSeed.js";

try {
  const seed = await generateLlmSeed();
  const counts = ["businesses", "regulations", "policies", "solutions", "evidence", "reports", "notifications", "auditLogs", "problems"]
    .map((k) => `${k}=${(seed[k] || []).length}`)
    .join(" ");
  console.log(`OK llm-seed generated: ${counts}`);
  console.log(`Saved to ${process.cwd()}/.data/llm-seed.json`);
} catch (err) {
  console.error(`LLM seed generation failed: ${err.message}`);
  process.exit(1);
}