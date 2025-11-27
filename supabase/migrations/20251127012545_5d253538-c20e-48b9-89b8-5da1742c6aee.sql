-- Create department_tasks table
CREATE TABLE IF NOT EXISTS public.department_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  assignee_name TEXT,
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  checklist JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for department_tasks
ALTER TABLE public.department_tasks ENABLE ROW LEVEL SECURITY;

-- Leaders can manage department tasks
CREATE POLICY "Leaders can manage department tasks"
ON public.department_tasks
FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role) OR
  has_role(auth.uid(), 'leader'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role) OR
  has_role(auth.uid(), 'leader'::app_role)
);

-- Members can view tasks in their department (comparing text to text)
CREATE POLICY "Members can view department tasks"
ON public.department_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = (SELECT id FROM public.profiles WHERE id = auth.uid())
    AND m.assigned_department = department_tasks.department_id::text
  )
);

-- Add trigger for updated_at
CREATE TRIGGER set_department_tasks_updated_at
BEFORE UPDATE ON public.department_tasks
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();