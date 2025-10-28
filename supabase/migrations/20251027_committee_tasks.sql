-- Committee Tasks schema
-- Enums (create only if missing)
DO $$
BEGIN
  CREATE TYPE task_status AS ENUM ('backlog','in_progress','done');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE priority_level AS ENUM ('low','medium','high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table
create table if not exists committee_tasks (
  id uuid primary key default extensions.uuid_generate_v4(),
  committee_id uuid not null,
  title text not null,
  description text,
  status task_status not null default 'backlog',
  assignee_id uuid,
  assignee_name text,
  due_date date,
  priority priority_level not null default 'medium',
  tags text[] default '{}',
  attachments text[] default '{}',
  checklist jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to keep updated_at fresh
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_committee_tasks_updated_at on committee_tasks;
create trigger trg_committee_tasks_updated_at
before update on committee_tasks
for each row execute procedure set_updated_at();

-- Indexes
create index if not exists idx_committee_tasks_committee on committee_tasks (committee_id);
create index if not exists idx_committee_tasks_status on committee_tasks (status);
create index if not exists idx_committee_tasks_due_date on committee_tasks (due_date);

-- RLS
alter table committee_tasks enable row level security;

drop policy if exists "Allow read to authenticated" on committee_tasks;
create policy "Allow read to authenticated" on committee_tasks
for select to authenticated
using (true);

drop policy if exists "Allow insert to authenticated" on committee_tasks;
create policy "Allow insert to authenticated" on committee_tasks
for insert to authenticated
with check (true);

drop policy if exists "Allow update to authenticated" on committee_tasks;
create policy "Allow update to authenticated" on committee_tasks
for update to authenticated
using (true);

drop policy if exists "Allow delete to authenticated" on committee_tasks;
create policy "Allow delete to authenticated" on committee_tasks
for delete to authenticated
using (true);
