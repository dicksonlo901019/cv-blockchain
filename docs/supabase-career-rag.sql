-- Replace VECTOR_DIMENSION with the exact dimension of OPENAI_EMBEDDING_MODEL
-- before running this migration. Do not deploy this file unchanged.
create extension if not exists vector;

create table if not exists career_documents (
  id text primary key,
  source_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists career_chunks (
  id text primary key,
  parent_id text not null,
  parent_type text not null,
  content text not null,
  language text not null,
  metadata jsonb not null default '{}'::jsonb,
  evidence_level text not null,
  confidentiality text not null,
  embedding vector(VECTOR_DIMENSION),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_chunks_metadata_gin
  on career_chunks using gin (metadata);
create index if not exists career_chunks_parent_idx
  on career_chunks (parent_type, parent_id);
create index if not exists career_chunks_visibility_idx
  on career_chunks (confidentiality, evidence_level, language);
-- Choose vector_cosine_ops / HNSW parameters after the embedding model,
-- expected corpus size, and recall/latency target are confirmed.
-- create index career_chunks_embedding_hnsw on career_chunks
-- using hnsw (embedding vector_cosine_ops);

create table if not exists career_projects (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists career_skills (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists career_skill_evidence (
  id text primary key,
  skill_id text not null references career_skills(id) on delete cascade,
  payload jsonb not null
);
create table if not exists career_interview_stories (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists job_descriptions (
  id uuid primary key,
  owner_id uuid,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists job_match_runs (
  id uuid primary key,
  job_description_id uuid references job_descriptions(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists resume_versions (
  id uuid primary key,
  owner_id uuid,
  content jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists generation_history (
  id uuid primary key,
  owner_id uuid,
  job_match_run_id uuid references job_match_runs(id) on delete cascade,
  output jsonb not null,
  created_at timestamptz not null default now()
);
