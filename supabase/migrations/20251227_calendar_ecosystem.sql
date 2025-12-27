-- 1. Personal Tasks (Private to User)
create table if not exists public.user_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  is_completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_tasks enable row level security;

create policy "Users can manage their own tasks"
  on public.user_tasks for all
  using (auth.uid() = user_id);

-- 2. Appointments (Bookable Meetings)
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  host_id uuid not null references public.members(id) on delete cascade,     -- The leader being booked
  requester_id uuid not null references public.members(id) on delete cascade, -- The member booking
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text check (status in ('pending', 'approved', 'rejected', 'cancelled')) default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Users can view appointments where they are host or requester"
  on public.appointments for select
  using (auth.uid() = host_id or auth.uid() = requester_id);

create policy "Users can update appointments where they are host or requester"
  on public.appointments for update
  using (auth.uid() = host_id or auth.uid() = requester_id);

create policy "Users can insert appointments as requester"
  on public.appointments for insert
  with check (auth.uid() = requester_id);

-- 3. Appointment Availability Slots (MVP)
create table if not exists public.appointment_slots (
  id uuid default gen_random_uuid() primary key,
  host_id uuid not null references public.members(id) on delete cascade,
  day_of_week int check (day_of_week between 0 and 6), -- 0=Sun, 6=Sat
  start_time time not null,
  end_time time not null,
  duration_minutes int default 30,
  created_at timestamptz default now()
);

alter table public.appointment_slots enable row level security;

create policy "Slots are viewable by everyone"
  on public.appointment_slots for select
  using (true);

create policy "Hosts can manage their own slots"
  on public.appointment_slots for all
  using (auth.uid() = host_id);


-- Indexing for performance
create index idx_user_tasks_user_id on public.user_tasks(user_id);
create index idx_appointments_host_id on public.appointments(host_id);
create index idx_appointments_requester_id on public.appointments(requester_id);
create index idx_appointments_start_at on public.appointments(start_at);
