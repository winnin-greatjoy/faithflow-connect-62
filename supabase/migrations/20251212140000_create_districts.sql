-- Add 'district_admin' to app_role enum
-- Note: Supabase/Postgres doesn't support adding values to an enum inside a transaction block easily if it's used, 
-- but 'ALTER TYPE ... ADD VALUE' is the standard way. 
-- However, inside a migration file, we usually just run it.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'district_admin';

-- Create districts table
create table public.districts (
  id uuid not null default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now(),
  head_admin_id uuid references auth.users(id),
  constraint districts_pkey primary key (id)
);

-- Add district_id and is_district_hq to church_branches
alter table public.church_branches
add column district_id uuid references public.districts(id),
add column is_district_hq boolean default false;

-- Add RLS policies for districts
alter table public.districts enable row level security;

-- Allow read access for authenticated users (since many might need to see district names)
create policy "Enable read access for all authenticated users"
on public.districts for select
to authenticated
using (true);

-- Allow superadmins to insert
create policy "Enable insert for superadmins"
on public.districts for insert
to authenticated
with check (
  exists (
    select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'
  )
);

-- Allow superadmins and district admins to update
create policy "Enable update for superadmins and district admins"
on public.districts for update
to authenticated
using (
  exists (
    select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'
  ) OR (
      -- Check if user is a district_admin. 
      -- Ideally we'd check if they are the admin FOR THIS district, 
      -- but for now, checking the role is a start. 
       head_admin_id = auth.uid()
  )
);

-- Allow superadmins to delete
create policy "Enable delete for superadmins"
on public.districts for delete
to authenticated
using (
  exists (
    select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'
  )
);

-- Allow district admins to insert church_branches if they manage the district
create policy "Enable insert for district admins in their district"
on public.church_branches for insert
to authenticated
with check (
  exists (
    select 1 from public.districts
    where districts.id = church_branches.district_id
    and districts.head_admin_id = auth.uid()
  )
);

-- Allow district admins to update church_branches in their district
create policy "Enable update for district admins in their district"
on public.church_branches for update
to authenticated
using (
  exists (
    select 1 from public.districts
    where districts.id = church_branches.district_id
    and districts.head_admin_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.districts
    where districts.id = church_branches.district_id
    and districts.head_admin_id = auth.uid()
  )
);

-- Allow district admins to assign roles to branches in their district
create policy "Enable insert for district admins to assign roles"
on public.user_roles for insert
to authenticated
with check (
  exists (
    select 1 from public.districts d
    join public.church_branches cb on cb.district_id = d.id
    where cb.id = user_roles.branch_id
    and d.head_admin_id = auth.uid()
  )
);
