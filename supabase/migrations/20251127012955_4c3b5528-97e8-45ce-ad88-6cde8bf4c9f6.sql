-- Add missing values to coverage_type enum
ALTER TYPE public.coverage_type ADD VALUE IF NOT EXISTS 'committee';
ALTER TYPE public.coverage_type ADD VALUE IF NOT EXISTS 'task';

-- Create message_templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage message templates
CREATE POLICY "Admins can manage message templates"
ON public.message_templates
FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role)
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  recipient_id UUID NOT NULL,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all notification logs
CREATE POLICY "Admins can view notification logs"
ON public.notification_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role)
);

-- Admins can insert notification logs
CREATE POLICY "Admins can insert notification logs"
ON public.notification_logs
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'pastor'::app_role)
);

-- Add updated_at trigger for message_templates
CREATE TRIGGER set_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();