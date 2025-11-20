-- Restrict streaming keys from regular users
-- Only admins/pastors/leaders should see stream_key and rtmp_server columns

-- Drop existing policies on streams table that allow public viewing
DROP POLICY IF EXISTS "Public streams viewable by everyone" ON public.streams;
DROP POLICY IF EXISTS "Admins and pastors can manage streams" ON public.streams;

-- Create new SELECT policy that restricts sensitive columns
-- Regular users can see public/members-only streams but NOT stream_key/rtmp_server
CREATE POLICY "Users can view public stream info"
ON public.streams
FOR SELECT
TO authenticated
USING (
  (privacy = 'public'::stream_privacy) OR 
  ((privacy = 'members_only'::stream_privacy) AND (auth.uid() IS NOT NULL))
);

-- Privileged users (admins, pastors, leaders) can see everything including keys
CREATE POLICY "Privileged users can view all stream details"
ON public.streams
FOR SELECT
TO authenticated
USING (
  (privacy = 'private'::stream_privacy) AND 
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'pastor'::app_role) OR 
   has_role(auth.uid(), 'leader'::app_role))
);

-- Admins and pastors can manage streams
CREATE POLICY "Admins and pastors can manage streams"
ON public.streams
FOR ALL
TO authenticated
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

-- Revoke column-level access to sensitive columns from authenticated role
REVOKE SELECT (stream_key, rtmp_server) ON public.streams FROM authenticated;

-- Grant column-level access only to service role (used by edge functions with proper auth)
GRANT SELECT (stream_key, rtmp_server) ON public.streams TO service_role;