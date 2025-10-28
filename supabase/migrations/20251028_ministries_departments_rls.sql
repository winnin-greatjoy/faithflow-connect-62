-- Enable RLS and add branch-scoped policies for ministries and departments

-- MINISTRIES
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY ministries_branch_read ON public.ministries
  FOR SELECT USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.ministries.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY ministries_branch_write ON public.ministries
  FOR ALL USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.ministries.branch_id
    )
  ) WITH CHECK (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.ministries.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DEPARTMENTS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY departments_branch_read ON public.departments
  FOR SELECT USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.departments.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY departments_branch_write ON public.departments
  FOR ALL USING (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.departments.branch_id
    )
  ) WITH CHECK (
    public.has_role('admin', auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.branch_id = public.departments.branch_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
