-- Create new enums for the workflows
CREATE TYPE public.convert_status AS ENUM (
  'pending_branch_review',
  'pending_district_review',
  'approved_for_baptism',
  'baptized'
);

CREATE TYPE public.training_type AS ENUM (
  'discipleship_1',
  'discipleship_2',
  'discipleship_3',
  'leadership',
  'pastoral'
);

CREATE TYPE public.training_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- status tracking for converts workflow
CREATE TABLE public.convert_process (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  status convert_status DEFAULT 'pending_branch_review',
  
  -- Approval tracking
  branch_approved_by UUID REFERENCES auth.users(id),
  branch_approval_date TIMESTAMPTZ,
  
  district_approved_by UUID REFERENCES auth.users(id),
  district_approval_date TIMESTAMPTZ,
  
  national_approved_by UUID REFERENCES auth.users(id),
  national_approval_date TIMESTAMPTZ,
  
  baptism_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(member_id)
);

-- tracking for member training progression
CREATE TABLE public.member_training (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  training_type training_type NOT NULL,
  status training_status DEFAULT 'not_started',
  
  started_at DATE,
  completed_at DATE,
  instructor_id UUID REFERENCES auth.users(id),
  remarks TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(member_id, training_type)
);

-- Enable RLS
ALTER TABLE public.convert_process ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_training ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER update_convert_process_updated_at
BEFORE UPDATE ON public.convert_process
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_member_training_updated_at
BEFORE UPDATE ON public.member_training
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for convert_process
-- 1. View access
CREATE POLICY "View convert process"
ON public.convert_process FOR SELECT
TO authenticated
USING (
  -- Super Admins and Admins can view all
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  -- District Admins (Pastors) can view their district (approximated by branch access for now, logic may need refinement for true district scope)
  -- For now, we assume Pastors have broader view, or strictly branch based.
  -- Let's stick to branch-based hierarchy for consistency with existing implementation:
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = convert_process.member_id
    AND public.has_branch_access(m.branch_id)
  )
);

-- 2. Update access
CREATE POLICY "Manage convert process"
ON public.convert_process FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'pastor') OR
  public.has_role(auth.uid(), 'leader')
)
WITH CHECK (
  -- Regular update checks, specific status transitions should optionally be enforced by application logic or trigger
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'pastor') OR
  public.has_role(auth.uid(), 'leader')
);

-- RLS Policies for member_training
-- 1. View access
CREATE POLICY "View training records"
ON public.member_training FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_training.member_id
    AND public.has_branch_access(m.branch_id)
  )
);

-- 2. Update access
CREATE POLICY "Manage training records"
ON public.member_training FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'pastor') OR
  public.has_role(auth.uid(), 'leader')
);

-- Permission Function to check if user can baptize (Super Admin only)
CREATE OR REPLACE FUNCTION public.can_baptize(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'super_admin'
  );
$$;
