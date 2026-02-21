-- Mission Control sync extensions
alter table mc_tasks add column if not exists external_id text unique;
alter table mc_tasks add column if not exists link text;
alter table mc_tasks add column if not exists context text;
alter table mc_content add column if not exists external_id text unique;
alter table mc_memories add column if not exists external_id text unique;
alter table mc_calendar add column if not exists external_id text unique;

create table if not exists mc_projects (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  title text not null,
  status text,
  progress int,
  context text,
  updated_at timestamptz default now(),
  source text
);

create table if not exists mc_metrics (
  key text primary key,
  value_num numeric,
  value_text text,
  updated_at timestamptz default now()
);

create table if not exists mc_emails (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  from_address text,
  subject text,
  received_at timestamptz,
  priority text,
  category text,
  summary text,
  source text
);
