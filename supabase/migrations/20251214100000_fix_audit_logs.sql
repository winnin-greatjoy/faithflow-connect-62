-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
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

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Superadmins can view audit logs" ON public.audit_logs;

-- Policy: Allow any authenticated user to insert logs (needed for system usage)
CREATE POLICY "Authenticated users can insert audit logs" 
    ON public.audit_logs FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow Superadmins (checked via user_roles OR profiles) to view logs
CREATE POLICY "Superadmins can view audit logs" 
    ON public.audit_logs FOR SELECT 
    USING (
        -- Check user_roles table (primary source for RBAC v2)
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'super_admin'
        )
        OR 
        -- Check profiles table (legacy/backup source)
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);
