-- Add unique constraint for email in members table
ALTER TABLE public.members 
ADD CONSTRAINT members_email_unique UNIQUE (email);

-- Add index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email) WHERE email IS NOT NULL;

-- Add index on baptized_sub_level for filtering workers and disciples
CREATE INDEX IF NOT EXISTS idx_members_baptized_sub_level ON public.members(baptized_sub_level) WHERE baptized_sub_level IS NOT NULL;