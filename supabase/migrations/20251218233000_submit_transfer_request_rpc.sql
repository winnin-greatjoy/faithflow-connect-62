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
  WHERE email = v_email
  LIMIT 1;

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
