-- Committees schema

-- Committees table
create table if not exists committees (
  id uuid primary key default extensions.uuid_generate_v4(),
  ministry_id uuid not null references ministries(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  head_member_id uuid references members(id) on delete set null,
  meeting_schedule text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Committee members table
create table if not exists committee_members (
  id uuid primary key default extensions.uuid_generate_v4(),
  committee_id uuid not null references committees(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  role text default 'member',
  joined_at date default now(),
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Triggers for updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers if any, then recreate
drop trigger if exists trg_committees_updated_at on committees;
create trigger trg_committees_updated_at before update on committees for each row execute procedure set_updated_at();

drop trigger if exists trg_committee_members_updated_at on committee_members;
create trigger trg_committee_members_updated_at before update on committee_members for each row execute procedure set_updated_at();

-- RLS
alter table committees enable row level security;
alter table committee_members enable row level security;

-- Basic policies (adjust later as needed)
-- Committees
drop policy if exists "Allow read to authenticated" on committees;
create policy "Allow read to authenticated" on committees for select to authenticated using (true);

drop policy if exists "Allow write to authenticated" on committees;
create policy "Allow write to authenticated" on committees for all to authenticated using (true) with check (true);

-- Committee members
drop policy if exists "Allow read to authenticated" on committee_members;
create policy "Allow read to authenticated" on committee_members for select to authenticated using (true);

drop policy if exists "Allow write to authenticated" on committee_members;
create policy "Allow write to authenticated" on committee_members for all to authenticated using (true) with check (true);
