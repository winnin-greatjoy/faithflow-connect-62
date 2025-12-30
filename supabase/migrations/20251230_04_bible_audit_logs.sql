-- Bible School Audit Logs
-- As requested in the production-ready blueprint

CREATE TABLE IF NOT EXISTS public.bible_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  student_id UUID REFERENCES public.bible_students(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_bible_audit_logs_student ON public.bible_audit_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_bible_audit_logs_performer ON public.bible_audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_bible_audit_logs_action ON public.bible_audit_logs(action);

-- RLS
ALTER TABLE public.bible_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert (via Edge Functions mostly, but service role bypasses RLS)
-- We'll allow authenticated insert just in case, but usually edge functions use service role.
CREATE POLICY "Authenticated users can insert bible audit logs" 
    ON public.bible_audit_logs FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Viewable by admins (super_admin and admin roles)
CREATE POLICY "Admins can view bible audit logs" 
    ON public.bible_audit_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role IN ('super_admin', 'admin', 'pastor')
        )
    );
