-- Fixes:
-- 1) Make submit_transfer_request resolve member by profile_id first (then email fallback).
-- 2) Normalize department_join_requests RLS policies for current member ownership mapping.

CREATE OR REPLACE FUNCTION public.submit_transfer_request(
  target_branch_id UUID,
  notes TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_from_branch_id UUID;
  v_email TEXT;
  v_member_id UUID;
  v_transfer_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT branch_id
  INTO v_from_branch_id
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_from_branch_id IS NULL THEN
    RAISE EXCEPTION 'User has no branch assigned';
  END IF;

  IF target_branch_id IS NULL THEN
    RAISE EXCEPTION 'target_branch_id is required';
  END IF;

  IF target_branch_id = v_from_branch_id THEN
    RAISE EXCEPTION 'Target branch must be different from current branch';
  END IF;

  -- Preferred mapping: members.profile_id -> auth.uid()
  SELECT id
  INTO v_member_id
  FROM public.members
  WHERE profile_id = v_user_id
  LIMIT 1;

  -- Fallback mapping: members.email -> auth email
  IF v_member_id IS NULL THEN
    SELECT email
    INTO v_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_email IS NULL OR v_email = '' THEN
      RAISE EXCEPTION 'User email not found';
    END IF;

    SELECT id
    INTO v_member_id
    FROM public.members
    WHERE lower(email) = lower(v_email)
    LIMIT 1;
  END IF;

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Member record not found for user';
  END IF;

  INSERT INTO public.member_transfers (
    member_id,
    from_branch_id,
    to_branch_id,
    requested_by,
    status,
    reason,
    notes
  ) VALUES (
    v_member_id,
    v_from_branch_id,
    target_branch_id,
    v_user_id,
    'pending',
    'Self-service transfer request',
    NULLIF(btrim(notes), '')
  )
  RETURNING id INTO v_transfer_id;

  RETURN v_transfer_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_transfer_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_transfer_request(UUID, TEXT) TO authenticated;

-- Rebuild department_join_requests policies to support members.profile_id mapping
DROP POLICY IF EXISTS "Users can view their own requests" ON public.department_join_requests;
DROP POLICY IF EXISTS "Users can create join requests" ON public.department_join_requests;
DROP POLICY IF EXISTS "Leaders can manage requests" ON public.department_join_requests;
DROP POLICY IF EXISTS djr_self_read ON public.department_join_requests;
DROP POLICY IF EXISTS djr_self_insert ON public.department_join_requests;
DROP POLICY IF EXISTS djr_admin_manage ON public.department_join_requests;

CREATE POLICY djr_select_own_or_admin
  ON public.department_join_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.members m
      WHERE m.id = department_join_requests.member_id
        AND (
          m.profile_id = auth.uid()
          OR (
            m.email IS NOT NULL
            AND lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          )
        )
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'pastor'::app_role)
    OR public.has_role(auth.uid(), 'leader'::app_role)
  );

CREATE POLICY djr_insert_own
  ON public.department_join_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.members m
      WHERE m.id = department_join_requests.member_id
        AND (
          m.profile_id = auth.uid()
          OR (
            m.email IS NOT NULL
            AND lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          )
        )
    )
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.departments d ON d.id = department_join_requests.department_id
        WHERE p.id = auth.uid()
          AND p.branch_id = d.branch_id
      )
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'pastor'::app_role)
      OR public.has_role(auth.uid(), 'leader'::app_role)
    )
  );

CREATE POLICY djr_update_admin
  ON public.department_join_requests
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'pastor'::app_role)
    OR public.has_role(auth.uid(), 'leader'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'pastor'::app_role)
    OR public.has_role(auth.uid(), 'leader'::app_role)
  );
