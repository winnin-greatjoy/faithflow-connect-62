
-- ============================================================
-- 1) Committee tables: replace permissive policies with role-based
-- ============================================================
DROP POLICY IF EXISTS "Allow write to authenticated" ON public.committees;
DROP POLICY IF EXISTS "Allow read to authenticated" ON public.committees;
DROP POLICY IF EXISTS "Allow write to authenticated" ON public.committee_members;
DROP POLICY IF EXISTS "Allow read to authenticated" ON public.committee_members;
DROP POLICY IF EXISTS "Allow read to authenticated" ON public.committee_tasks;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.committee_tasks;
DROP POLICY IF EXISTS "Allow update to authenticated" ON public.committee_tasks;
DROP POLICY IF EXISTS "Allow delete to authenticated" ON public.committee_tasks;

-- Helper: current user's member id
CREATE OR REPLACE FUNCTION public.current_member_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.members WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- Committees
CREATE POLICY "Authenticated can view committees" ON public.committees
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Leaders manage committees" ON public.committees
FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'pastor'::public.app_role) OR
  public.has_role(auth.uid(), 'leader'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'pastor'::public.app_role) OR
  public.has_role(auth.uid(), 'leader'::public.app_role)
);

-- Committee members
CREATE POLICY "Authenticated can view committee members" ON public.committee_members
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Leaders or committee head manage members" ON public.committee_members
FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'pastor'::public.app_role) OR
  public.has_role(auth.uid(), 'leader'::public.app_role) OR
  EXISTS (
    SELECT 1 FROM public.committees c
    WHERE c.id = committee_members.committee_id
      AND c.head_member_id = public.current_member_id()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'pastor'::public.app_role) OR
  public.has_role(auth.uid(), 'leader'::public.app_role) OR
  EXISTS (
    SELECT 1 FROM public.committees c
    WHERE c.id = committee_members.committee_id
      AND c.head_member_id = public.current_member_id()
  )
);

-- Committee tasks
CREATE POLICY "View tasks if member or leader" ON public.committee_tasks
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'pastor'::public.app_role) OR
  public.has_role(auth.uid(), 'leader'::public.app_role) OR
  EXISTS (
    SELECT 1 FROM public.committee_members cm
    WHERE cm.committee_id = committee_tasks.committee_id
      AND cm.member_id = public.current_member_id()
  )
);

CREATE POLICY "Leaders or committee head manage tasks" ON public.committee_tasks
FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'pastor'::public.app_role) OR
  public.has_role(auth.uid(), 'leader'::public.app_role) OR
  EXISTS (
    SELECT 1 FROM public.committees c
    WHERE c.id = committee_tasks.committee_id
      AND c.head_member_id = public.current_member_id()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'pastor'::public.app_role) OR
  public.has_role(auth.uid(), 'leader'::public.app_role) OR
  EXISTS (
    SELECT 1 FROM public.committees c
    WHERE c.id = committee_tasks.committee_id
      AND c.head_member_id = public.current_member_id()
  )
);

-- ============================================================
-- 2) Storage bucket profile-photos: add RLS policies
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Profile photos public read" ON storage.objects;
CREATE POLICY "Profile photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users manage own profile photos" ON storage.objects;
CREATE POLICY "Users manage own profile photos"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins manage district logos" ON storage.objects;
CREATE POLICY "Admins manage district logos"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND name LIKE 'district-logos/%'
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND name LIKE 'district-logos/%'
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Admins manage finance documents" ON storage.objects;
CREATE POLICY "Admins manage finance documents"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND name LIKE 'finance/%'
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND name LIKE 'finance/%'
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  )
);

-- ============================================================
-- 3) Transfer RPCs: add authorization checks
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_member_transfer(transfer_id uuid, approver_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id UUID;
  v_to_branch_id UUID;
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF approver_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'approver_id must match authenticated user';
  END IF;
  IF NOT (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to approve transfers';
  END IF;

  SELECT member_id, to_branch_id, status
  INTO v_member_id, v_to_branch_id, v_status
  FROM public.member_transfers WHERE id = transfer_id;

  IF v_member_id IS NULL THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF v_status != 'pending' THEN RAISE EXCEPTION 'Transfer is not pending'; END IF;

  UPDATE public.member_transfers
  SET status = 'approved', processed_by = approver_id, processed_at = now()
  WHERE id = transfer_id;

  UPDATE public.members
  SET branch_id = v_to_branch_id, updated_at = now()
  WHERE id = v_member_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_member_transfer(transfer_id uuid, rejector_id uuid, rejection_notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF rejector_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'rejector_id must match authenticated user';
  END IF;
  IF NOT (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to reject transfers';
  END IF;

  UPDATE public.member_transfers
  SET status = 'rejected',
      processed_by = rejector_id,
      processed_at = now(),
      notes = COALESCE(rejection_notes, notes)
  WHERE id = transfer_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer not found or not pending';
  END IF;
END;
$$;

-- ============================================================
-- 4) setup_superadmin: lock down to service role
-- ============================================================
REVOKE ALL ON FUNCTION public.setup_superadmin(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.setup_superadmin(text) FROM authenticated;
REVOKE ALL ON FUNCTION public.setup_superadmin(text) FROM anon;
DROP FUNCTION IF EXISTS public.setup_superadmin(text);

-- ============================================================
-- 5) Add SET search_path to remaining functions (linter warning)
-- ============================================================
ALTER FUNCTION public.update_registration_updated_at() SET search_path = public;
ALTER FUNCTION public.invalidate_holiday_cache() SET search_path = public;
ALTER FUNCTION public.can_baptize(uuid) SET search_path = public;
ALTER FUNCTION public.set_room_booking_event_id() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.get_student_attendance_percentage(uuid) SET search_path = public;
ALTER FUNCTION public.check_promotion_eligibility(uuid, numeric) SET search_path = public;
ALTER FUNCTION public.upgrade_member_to_baptized(uuid, text, text) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
