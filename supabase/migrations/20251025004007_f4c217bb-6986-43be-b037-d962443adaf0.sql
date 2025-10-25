-- Create ministries table
CREATE TABLE public.ministries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID REFERENCES auth.users(id),
  branch_id UUID NOT NULL REFERENCES public.church_branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ministry_members junction table
CREATE TABLE public.ministry_members (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'leader', 'coordinator')),
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, ministry_id)
);

-- Create ministry_events table
CREATE TABLE public.ministry_events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create department_join_requests table
CREATE TABLE public.department_join_requests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('join', 'leave')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create event_rsvps table
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'not_attending')),
  guests_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Enable RLS
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ministries
CREATE POLICY "Ministries viewable by branch users"
  ON public.ministries FOR SELECT
  USING (has_branch_access(branch_id));

CREATE POLICY "Admins can manage ministries"
  ON public.ministries FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role));

-- RLS Policies for ministry_members
CREATE POLICY "Ministry members viewable by branch users"
  ON public.ministry_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ministries m
    WHERE m.id = ministry_members.ministry_id AND has_branch_access(m.branch_id)
  ));

CREATE POLICY "Leaders can manage ministry members"
  ON public.ministry_members FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role) OR has_role(auth.uid(), 'leader'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role) OR has_role(auth.uid(), 'leader'::app_role));

-- RLS Policies for ministry_events
CREATE POLICY "Ministry events viewable by branch users"
  ON public.ministry_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ministries m
    WHERE m.id = ministry_events.ministry_id AND has_branch_access(m.branch_id)
  ));

CREATE POLICY "Leaders can manage ministry events"
  ON public.ministry_events FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role) OR has_role(auth.uid(), 'leader'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role) OR has_role(auth.uid(), 'leader'::app_role));

-- RLS Policies for department_join_requests
CREATE POLICY "Users can view their own requests"
  ON public.department_join_requests FOR SELECT
  USING (
    member_id IN (SELECT id FROM public.members WHERE id IN (
      SELECT member_id FROM public.profiles WHERE id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'pastor'::app_role)
    OR has_role(auth.uid(), 'leader'::app_role)
  );

CREATE POLICY "Users can create join requests"
  ON public.department_join_requests FOR INSERT
  WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE id IN (
      SELECT member_id FROM public.profiles WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Leaders can manage requests"
  ON public.department_join_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role) OR has_role(auth.uid(), 'leader'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pastor'::app_role) OR has_role(auth.uid(), 'leader'::app_role));

-- RLS Policies for event_rsvps
CREATE POLICY "Users can view RSVPs for visible events"
  ON public.event_rsvps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_rsvps.event_id AND has_branch_access(e.branch_id)
  ));

CREATE POLICY "Users can manage their own RSVPs"
  ON public.event_rsvps FOR ALL
  USING (
    member_id IN (SELECT id FROM public.members WHERE id IN (
      SELECT member_id FROM public.profiles WHERE id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'leader'::app_role)
  )
  WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE id IN (
      SELECT member_id FROM public.profiles WHERE id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'leader'::app_role)
  );

-- Create indexes for performance
CREATE INDEX idx_ministry_members_member ON public.ministry_members(member_id);
CREATE INDEX idx_ministry_members_ministry ON public.ministry_members(ministry_id);
CREATE INDEX idx_ministry_events_ministry ON public.ministry_events(ministry_id);
CREATE INDEX idx_dept_join_requests_member ON public.department_join_requests(member_id);
CREATE INDEX idx_dept_join_requests_dept ON public.department_join_requests(department_id);
CREATE INDEX idx_event_rsvps_event ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_member ON public.event_rsvps(member_id);

-- Triggers for updated_at
CREATE TRIGGER update_ministries_updated_at
  BEFORE UPDATE ON public.ministries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ministry_events_updated_at
  BEFORE UPDATE ON public.ministry_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_event_rsvps_updated_at
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();