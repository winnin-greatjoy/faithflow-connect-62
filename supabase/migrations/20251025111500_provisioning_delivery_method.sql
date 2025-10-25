-- Add delivery_method to account_provisioning_jobs
ALTER TABLE public.account_provisioning_jobs
ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'invite' CHECK (delivery_method IN ('invite','temp_password'));

-- Optional: store generated temp password hash or metadata later
-- ALTER TABLE public.account_provisioning_jobs ADD COLUMN temp_password_length smallint DEFAULT 12;
