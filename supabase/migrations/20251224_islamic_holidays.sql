-- Create islamic_holidays table
create table if not exists public.islamic_holidays (
  id uuid default gen_random_uuid() primary key,
  year int not null,
  title text not null,
  holiday_date date not null,
  country text default 'SL',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (year, title)
);

-- Enable RLS
alter table public.islamic_holidays enable row level security;

-- Policies
create policy "Islamic holidays are viewable by everyone"
  on public.islamic_holidays for select
  using (true);

-- Superadmins can manage
create policy "Superadmins can manage islamic holidays"
  on public.islamic_holidays for all
  using (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Initial Seed Data (2024-2026)
insert into public.islamic_holidays (year, title, holiday_date) values
  (2024, 'Eid al-Fitr', '2024-04-10'),
  (2024, 'Eid al-Adha', '2024-06-17'),
  (2024, 'Maulid un-Nabi', '2024-09-16'),
  (2025, 'Eid al-Fitr', '2025-03-30'),
  (2025, 'Eid al-Fitr (Observed)', '2025-03-31'),
  (2025, 'Eid al-Adha', '2025-06-06'),
  (2025, 'Maulid un-Nabi', '2025-09-04'),
  (2026, 'Eid al-Fitr', '2026-03-20'),
  (2026, 'Eid al-Adha', '2026-05-27'),
  (2026, 'Maulid un-Nabi', '2026-08-26')
on conflict (year, title) do nothing;
