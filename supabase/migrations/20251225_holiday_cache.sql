-- Create holiday_cache table
create table if not exists public.holiday_cache (
  year int not null,
  country text not null default 'SL',
  holidays jsonb not null,
  generated_at timestamptz default now(),
  primary key (year, country)
);

-- Enable RLS for holiday_cache
alter table public.holiday_cache enable row level security;

-- Policies for holiday_cache
create policy "Holiday cache is viewable by everyone"
  on public.holiday_cache for select
  using (true);

-- Create holiday_overrides table
create table if not exists public.holiday_overrides (
  id uuid default gen_random_uuid() primary key,
  year int not null,
  country text not null default 'SL',
  title text not null,
  holiday_date date not null,
  action text not null check (action in ('add', 'remove', 'replace')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for holiday_overrides
alter table public.holiday_overrides enable row level security;

-- Policies for holiday_overrides (Superadmin only)
create policy "Holiday overrides are viewable by superadmins"
  on public.holiday_overrides for select
  using (public.has_role(auth.uid(), 'super_admin'::public.app_role));

create policy "Superadmins can manage holiday overrides"
  on public.holiday_overrides for all
  using (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Helper to invalidate cache on changes
create or replace function public.invalidate_holiday_cache()
returns trigger as $$
begin
  delete from public.holiday_cache 
  where year = NEW.year and country = NEW.country;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to clear cache when overrides change
create trigger on_holiday_override_change
  after insert or update or delete on public.holiday_overrides
  for each row execute function public.invalidate_holiday_cache();

-- Trigger to clear cache when Islamic holidays change
create trigger on_islamic_holiday_change
  after insert or update or delete on public.islamic_holidays
  for each row execute function public.invalidate_holiday_cache();
