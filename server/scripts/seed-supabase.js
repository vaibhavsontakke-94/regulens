import fs from "node:fs";
import path from "node:path";
import { seedState } from "../store.js";
import { syncToSupabase, supabaseConfigured } from "../supabase.js";

const DATA_FILE = path.join(process.cwd(), ".data", "store.json");

function loadState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (parsed && Array.isArray(parsed.problems)) return parsed;
  } catch {
    /* falls back to fresh seed */
  }
  const fresh = seedState();
  fresh.users = [];
  fresh.idCounters = { problem: 14, evidence: 0, report: 0, businessProblem: 0, businessEvidence: 0, notification: 0 };
  return fresh;
}

if (!supabaseConfigured()) {
  console.error("Supabase is not configured. Check .env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}

const result = await syncToSupabase(loadState());

if (result.ok) {
  const bizCount = (result.business || []).length;
  console.log(`OK synced to Supabase: government rows=1, business rows=${bizCount}`);
  console.log(`Business workspaces: ${(result.business || []).map((b) => b.workspace_id).join(", ") || "(none)"}`);
} else {
  console.error(`Sync failed: ${result.error}`);
  console.error("Hint: create the tables (supabase/tables.sql in the SQL Editor) and enable the Data API.");
  process.exit(1);
}