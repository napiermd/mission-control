-- Mission Control schema (Supabase)
create table if not exists mc_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assignee text,
  status text default 'TODO',
  priority text default 'MEDIUM',
  created_at timestamptz default now()
);

create table if not exists mc_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  stage text default 'IDEA',
  notes text,
  script text,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists mc_team (
  id text primary key,
  name text not null,
  role text,
  department text,
  avatar text,
  current_task text,
  responsibilities text,
  status text default 'IDLE'
);

create table if not exists mc_memories (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  content text not null,
  date date,
  category text,
  source text
);

create table if not exists mc_calendar (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  time text,
  recurrence text,
  status text,
  color text,
  source text
);

-- Learnings: structured agent knowledge capture
create table if not exists mc_learnings (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  type text not null default 'LEARNING',
  title text,
  content text not null,
  category text,
  context text,
  source text default 'auto',
  session_id text,
  tags text[],
  created_at timestamptz default now()
);
create index if not exists idx_learnings_agent on mc_learnings(agent);
create index if not exists idx_learnings_created on mc_learnings(created_at desc);

-- Contacts/CRM
create table if not exists mc_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  category text default 'External',
  handle text,
  email text,
  timezone text,
  compensation text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_contacts_category on mc_contacts(category);
