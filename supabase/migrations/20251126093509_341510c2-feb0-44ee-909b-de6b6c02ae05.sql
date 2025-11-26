-- Create member transfers table
CREATE TABLE public.member_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  from_branch_id UUID NOT NULL REFERENCES public.church_branches(id),
  to_branch_id UUID NOT NULL REFERENCES public.church_branches(id),
  requested_by UUID NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT different_branches CHECK (from_branch_id != to_branch_id)
);

-- Enable RLS
ALTER TABLE public.member_transfers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins and pastors can view transfers"
ON public.member_transfers
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role) OR
  has_role(auth.uid(), 'leader'::app_role)
);

CREATE POLICY "Admins and pastors can create transfers"
ON public.member_transfers
FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'super_admin'::app_role) OR
   has_role(auth.uid(), 'admin'::app_role) OR
   has_role(auth.uid(), 'pastor'::app_role)) AND
  requested_by = auth.uid()
);

CREATE POLICY "Admins and pastors can update transfers"
ON public.member_transfers
FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role)
);

-- Create trigger to update timestamps
CREATE TRIGGER update_member_transfers_updated_at
BEFORE UPDATE ON public.member_transfers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle transfer approval
CREATE OR REPLACE FUNCTION public.approve_member_transfer(
  transfer_id UUID,
  approver_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id UUID;
  v_to_branch_id UUID;
  v_status TEXT;
BEGIN
  -- Get transfer details
  SELECT member_id, to_branch_id, status
  INTO v_member_id, v_to_branch_id, v_status
  FROM member_transfers
  WHERE id = transfer_id;

  -- Check if transfer exists and is pending
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Transfer not found';
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Transfer is not pending';
  END IF;

  -- Update transfer status
  UPDATE member_transfers
  SET 
    status = 'approved',
    processed_by = approver_id,
    processed_at = now()
  WHERE id = transfer_id;

  -- Update member's branch
  UPDATE members
  SET 
    branch_id = v_to_branch_id,
    updated_at = now()
  WHERE id = v_member_id;
END;
$$;

-- Create function to reject transfer
CREATE OR REPLACE FUNCTION public.reject_member_transfer(
  transfer_id UUID,
  rejector_id UUID,
  rejection_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE member_transfers
  SET 
    status = 'rejected',
    processed_by = rejector_id,
    processed_at = now(),
    notes = COALESCE(rejection_notes, notes)
  WHERE id = transfer_id
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer not found or not pending';
  END IF;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_member_transfers_member_id ON public.member_transfers(member_id);
CREATE INDEX idx_member_transfers_status ON public.member_transfers(status);
CREATE INDEX idx_member_transfers_from_branch ON public.member_transfers(from_branch_id);
CREATE INDEX idx_member_transfers_to_branch ON public.member_transfers(to_branch_id);