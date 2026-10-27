-- REGULENS — Supabase schema with pgvector RAG support
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
--
-- NOTE: The Data API (PostgREST, /rest/v1/) must be ENABLED in
-- Dashboard > Project Settings > API for the app to reach these tables.

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- Vectors table for RAG: stores document embeddings (768-dim)
-- linked to government workspace problems/solutions/regulations/policies.
create table if not exists public.vectors (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  type text not null, -- 'problem' | 'solution' | 'regulation' | 'policy'
  reference_id text not null, -- the id of the referenced record
  content text not null, -- the text that was embedded
  embedding vector(768) not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Government workspace: one row per government workspaces.
-- `data` holds all government features (problems, businesses, regulations,
-- policies, solutions, evidence, reports, notifications, audit logs).
create table if not exists public.government (
  id uuid primary key default gen_random_uuid(),
  workspace_id text unique not null,
  name text,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Business workspace: one row per business user/workspace.
-- `data` holds all business features (profile, compliance, risk categories,
-- certifications, schemes, regulatory updates, problems, evidence, reports).
create table if not exists public.business (
  id uuid primary key default gen_random_uuid(),
  workspace_id text unique not null,
  business_name text,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: only the service-role key (server) can read/write.
-- Anonymous (publishable) key has no table access by default.
alter table public.government enable row level security;
alter table public.business enable row level security;
alter table public.vectors enable row level security;

create policy "service role full access" on public.government
  for all using (true) with check (true);
create policy "service role full access" on public.business
  for all using (true) with check (true);
create policy "service role full access" on public.vectors
  for all using (true) with check (true);

-- Refresh updated_at automatically on writes.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger government_touch before update on public.government
  for each row execute function public.touch_updated_at();
create trigger business_touch before update on public.business
  for each row execute function public.touch_updated_at();