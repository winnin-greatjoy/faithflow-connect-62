-- Create member_transfers table for tracking branch transfers
-- Supports superadmin-initiated transfers and approval workflows

CREATE TABLE IF NOT EXISTS public.member_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  from_branch_id UUID NOT NULL REFERENCES public.church_branches(id) ON DELETE CASCADE,
  to_branch_id UUID NOT NULL REFERENCES public.church_branches(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.member_transfers ENABLE ROW LEVEL SECURITY;

-- Allow superadmin, admin, and pastor to view all transfers
CREATE POLICY member_transfers_view ON public.member_transfers
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  );

-- Allow superadmin, admin, and pastor to create transfers
CREATE POLICY member_transfers_create ON public.member_transfers
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'pastor'::public.app_role)
  );

-- Allow superadmin to update any transfer, others can only update pending transfers
CREATE POLICY member_transfers_update ON public.member_transfers
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    (
      (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pastor'::public.app_role))
      AND status = 'pending'
    )
  );

-- Add updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_member_transfers_updated_at'
  ) THEN
    CREATE TRIGGER update_member_transfers_updated_at
    BEFORE UPDATE ON public.member_transfers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_transfers_member_id ON public.member_transfers(member_id);
CREATE INDEX IF NOT EXISTS idx_member_transfers_from_branch_id ON public.member_transfers(from_branch_id);
CREATE INDEX IF NOT EXISTS idx_member_transfers_to_branch_id ON public.member_transfers(to_branch_id);
CREATE INDEX IF NOT EXISTS idx_member_transfers_status ON public.member_transfers(status);
CREATE INDEX IF NOT EXISTS idx_member_transfers_requested_at ON public.member_transfers(requested_at DESC);
