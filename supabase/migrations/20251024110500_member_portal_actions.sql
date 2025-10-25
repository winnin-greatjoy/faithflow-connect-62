-- 1) Event RSVPs table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('going','maybe','not_going')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (event_id, member_id)
);
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS: user can manage their own RSVP within their branch
DO $$ BEGIN
  CREATE POLICY event_rsvps_self_manage ON public.event_rsvps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.members m ON m.id = public.event_rsvps.member_id
      JOIN public.events e ON e.id = public.event_rsvps.event_id
      WHERE p.id = auth.uid() AND m.id = public.event_rsvps.member_id AND p.branch_id = e.branch_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.members m ON m.id = public.event_rsvps.member_id
      JOIN public.events e ON e.id = public.event_rsvps.event_id
      WHERE p.id = auth.uid() AND m.id = public.event_rsvps.member_id AND p.branch_id = e.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Department Join Requests
CREATE TABLE IF NOT EXISTS public.department_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('join','leave')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.department_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS: user can create and read their own requests within their branch
DO $$ BEGIN
  CREATE POLICY djr_self_read ON public.department_join_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.members m
      JOIN public.profiles p ON p.id = auth.uid()
      JOIN public.departments d ON d.id = public.department_join_requests.department_id
      WHERE m.id = public.department_join_requests.member_id AND p.branch_id = d.branch_id AND m.id = p.id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY djr_self_insert ON public.department_join_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members m
      JOIN public.profiles p ON p.id = auth.uid()
      JOIN public.departments d ON d.id = public.department_join_requests.department_id
      WHERE m.id = public.department_join_requests.member_id AND p.branch_id = d.branch_id AND m.id = p.id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admins can manage requests
DO $$ BEGIN
  CREATE POLICY djr_admin_manage ON public.department_join_requests
  FOR ALL USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
