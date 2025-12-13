ALTER TABLE public.districts 
DROP COLUMN IF EXISTS overseer_id;

ALTER TABLE public.districts
ADD COLUMN overseer_id uuid REFERENCES public.profiles(id);

COMMENT ON COLUMN public.districts.overseer_id IS 'Reference to the profile who is the spiritual overseer of the district';
