-- Provide a SECURITY DEFINER RPC to list branches for transfer dialogs
-- This function runs with definer privileges so clients with limited branch visibility
-- (e.g., branch admins) can still fetch a list of branches to choose transfer destinations.

CREATE OR REPLACE FUNCTION public.list_transfer_branches()
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, name FROM public.church_branches ORDER BY name;
$$;

-- Allow authenticated users to execute the function
GRANT EXECUTE ON FUNCTION public.list_transfer_branches() TO authenticated;
