-- Create message_templates table
create table if not exists public.message_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null, -- 'welcome', 'reminder', 'announcement', etc.
  subject text, -- for emails
  body text not null,
  variables jsonb default '[]'::jsonb, -- array of variable names e.g. ['member_name', 'event_date']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);

-- Create notification_logs table
create table if not exists public.notification_logs (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'email', 'sms'
  recipient_id uuid references public.members(id),
  template_id uuid references public.message_templates(id),
  subject text,
  message text not null,
  status text not null default 'pending', -- 'pending', 'sent', 'failed'
  error text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);

-- Add RLS policies
alter table public.message_templates enable row level security;
alter table public.notification_logs enable row level security;

-- Policies for message_templates
create policy "Enable read access for authenticated users" on public.message_templates
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on public.message_templates
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on public.message_templates
  for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on public.message_templates
  for delete using (auth.role() = 'authenticated');

-- Policies for notification_logs
create policy "Enable read access for authenticated users" on public.notification_logs
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on public.notification_logs
  for insert with check (auth.role() = 'authenticated');

-- Create updated_at trigger for message_templates
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.message_templates
  for each row
  execute procedure public.handle_updated_at();
