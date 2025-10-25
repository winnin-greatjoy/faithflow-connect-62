-- Seed module permissions for admin (global manage)
DO $$
DECLARE
  s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['choir','finance','ushering','prayer','evangelism'] LOOP
    INSERT INTO public.module_role_permissions (module_id, role, scope_type, allowed_actions)
    SELECT m.id, 'admin'::public.app_role, 'global', ARRAY['manage']::public.permission_action[]
    FROM public.modules m
    WHERE m.slug = s
      AND NOT EXISTS (
        SELECT 1 FROM public.module_role_permissions mrp
        WHERE mrp.module_id = m.id AND mrp.role = 'admin'::public.app_role AND mrp.scope_type = 'global'
      );
  END LOOP;
END $$;

-- RLS policies for core tables
-- MEMBERS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY members_branch_read ON public.members
  FOR SELECT USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.members.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY members_branch_insert ON public.members
  FOR INSERT WITH CHECK (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.members.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY members_branch_update ON public.members
  FOR UPDATE USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.members.branch_id
    )
  ) WITH CHECK (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.members.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY members_admin_delete ON public.members
  FOR DELETE USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DEPARTMENT ASSIGNMENTS
ALTER TABLE public.department_assignments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY da_branch_read ON public.department_assignments
  FOR SELECT USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.members m
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE m.id = public.department_assignments.member_id
        AND m.branch_id = p.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY da_branch_write ON public.department_assignments
  FOR ALL USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.members m
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE m.id = public.department_assignments.member_id
        AND m.branch_id = p.branch_id
    )
  ) WITH CHECK (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.members m
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE m.id = public.department_assignments.member_id
        AND m.branch_id = p.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EVENTS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY events_branch_read ON public.events
  FOR SELECT USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.events.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY events_branch_write ON public.events
  FOR ALL USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.events.branch_id
    )
  ) WITH CHECK (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.events.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- FINANCE RECORDS
ALTER TABLE public.finance_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY fr_branch_read ON public.finance_records
  FOR SELECT USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.finance_records.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY fr_branch_write ON public.finance_records
  FOR ALL USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.finance_records.branch_id
    )
  ) WITH CHECK (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.finance_records.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
