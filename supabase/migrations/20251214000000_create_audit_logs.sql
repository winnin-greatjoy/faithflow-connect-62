-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details TEXT,
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone authenticated to insert logs (automated triggering)
CREATE POLICY "Authenticated users can insert audit logs" 
    ON public.audit_logs FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Allow only superadmins to view audit logs
-- Assuming super_admin check is done via EXISTS on user_roles or a specific claim
-- For simplicity, we'll check if the user has a super_admin role in user_roles
CREATE POLICY "Superadmins can view audit logs" 
    ON public.audit_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'super_admin'
        )
    );

-- Add indexes for common queries
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);
