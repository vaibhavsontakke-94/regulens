import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function supabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_URL.startsWith("https://") && SERVICE_KEY);
}

export const supabaseAdmin = supabaseConfigured()
  ? createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// Browser-safe client (publishable key, no table access unless RLS grants it).
export const supabaseBrowser = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function govRow(state) {
  return {
    workspace_id: "government-demo",
    name: "Regulatory Intelligence Workspace",
    data: {
      problems: state.problems || [],
      businesses: state.businesses || [],
      regulations: state.regulations || [],
      policies: state.policies || [],
      solutions: state.solutions || [],
      evidence: state.evidence || [],
      reports: state.reports || [],
      notifications: state.notifications || [],
      auditLogs: state.auditLogs || [],
      testAndScale: state.testAndScale || [],
      users: state.users || [],
      idCounters: state.idCounters || {},
    },
  };
}

function bizRows(state) {
  const workspaces = state.businessWorkspaces || {};
  return Object.entries(workspaces).map(([userId, ws]) => ({
    workspace_id: `biz-${userId}`,
    business_name: ws.profile?.identity?.businessName || "Your Business",
    data: clone(ws || {}),
  }));
}

export async function syncToSupabase(state) {
  if (!supabaseAdmin) return { ok: false, error: "Supabase not configured." };
  try {
    const gov = await supabaseAdmin
      .from("government")
      .upsert([govRow(state)], { onConflict: "workspace_id" })
      .select();
    if (gov.error) throw gov.error;

    const biz = bizRows(state);
    let bizResult = { error: null };
    if (biz.length) {
      bizResult = await supabaseAdmin
        .from("business")
        .upsert(biz, { onConflict: "workspace_id" })
        .select();
      if (bizResult.error) throw bizResult.error;
    }

    return { ok: true, government: gov.data, business: bizResult.data || [] };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function readFromSupabase() {
  if (!supabaseAdmin) return null;
  try {
    const [gov, biz] = await Promise.all([
      supabaseAdmin.from("government").select("workspace_id, data"),
      supabaseAdmin.from("business").select("workspace_id, data"),
    ]);
    const out = { government: {}, business: {} };
    for (const row of gov.data || []) out.government[row.workspace_id] = row.data || {};
    for (const row of biz.data || []) out.business[row.workspace_id] = row.data || {};
    return out;
  } catch (err) {
    console.warn("[supabase] read failed:", err?.message || err);
    return null;
  }
}