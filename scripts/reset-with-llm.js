import fs from "node:fs";
import path from "node:path";
import { loadLlmSeed } from "../server/llmSeed.js";
import { seedState } from "../server/store.js";
import { syncToSupabase, supabaseConfigured } from "../server/supabase.js";
import { hashPassword } from "../server/auth.js";
import { DEMO_ACCOUNTS } from "../server/seed-users.js";

const DATA_FILE = path.join(process.cwd(), ".data", "store.json");

function maxNumeric(ids, prefix) {
  let max = 0;
  for (const id of ids || []) {
    const match = String(id).match(new RegExp(`${prefix}(\\d+)`));
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max;
}

const seed = loadLlmSeed();
if (!seed) {
  console.error("Missing .data/llm-seed.json. Run scripts/generate-llm-seed.js first.");
  process.exit(1);
}

const fresh = seedState();
fresh.users = [];
fresh.sessions = { active: {} };
fresh.idCounters = {
  problem: maxNumeric(seed.problems, "PRB-2026-"),
  evidence: maxNumeric(seed.evidence, "EVD-"),
  report: maxNumeric(seed.reports, "RPT-"),
  businessProblem: 0,
  businessEvidence: 0,
  notification: maxNumeric(seed.notifications, "NTF-"),
  testScale: 0,
};
fresh.businessWorkspaces = {};

for (const [role, account] of Object.entries(DEMO_ACCOUNTS)) {
  fresh.users.push({
    id: `usr-demo-${role}`,
    role,
    email: account.email,
    name: account.name,
    passwordHash: hashPassword(account.password),
    verified: true,
    createdAt: new Date().toISOString(),
    accountType: "demo",
    profile:
      role === "government"
        ? { department: "Ministry of Commerce", designation: "Policy Officer", organization: "Regulatory Authority" }
        : { businessName: "Nortex Textiles Ltd", industry: "Manufacturing", location: "Surat, Gujarat" },
  });
}

if (!supabaseConfigured()) {
  console.warn("Supabase not configured — skipping remote sync.");
} else {
  const result = await syncToSupabase(fresh);
  if (!result.ok) {
    console.error(`Supabase sync failed: ${result.error}`);
    console.error("Remote store left unchanged. Fix the seed or Supabase tables before retrying.");
    process.exit(1);
  }
}

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.writeFileSync(DATA_FILE, JSON.stringify(fresh, null, 2));

const counts = ["businesses", "regulations", "policies", "solutions", "evidence", "reports", "notifications", "auditLogs", "problems"]
  .map((k) => `${k}=${(fresh[k] || []).length}`)
  .join(" ");

console.log(`OK reset: ${counts}`);
console.log(`Local store + Supabase now serve the LLM-generated dataset (${fresh.problems.length} problems).`);
console.log("Restart the dev server so the in-memory store reloads from .data/store.json.");