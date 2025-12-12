-- Add district hierarchy to church_branches
-- parent_id: references the district HQ branch (null for main HQ and district HQs)
-- branch_type: 'main_hq' (central admin), 'district_hq', 'local' (regular branch under a district)
-- district_name: name of the district (only for district_hq branches)

ALTER TABLE public.church_branches
ADD COLUMN parent_id uuid REFERENCES public.church_branches(id) ON DELETE SET NULL,
ADD COLUMN branch_type text NOT NULL DEFAULT 'local' CHECK (branch_type IN ('main_hq', 'district_hq', 'local')),
ADD COLUMN district_name text;

-- Update the main branch to be main_hq type
UPDATE public.church_branches SET branch_type = 'main_hq' WHERE is_main = true;

-- Add index for parent_id queries
CREATE INDEX idx_church_branches_parent_id ON public.church_branches(parent_id);
CREATE INDEX idx_church_branches_branch_type ON public.church_branches(branch_type);

-- Add a comment explaining the structure
COMMENT ON COLUMN public.church_branches.parent_id IS 'References the parent branch. For local branches, this is their district HQ. District HQs and main HQ have null parent_id.';
COMMENT ON COLUMN public.church_branches.branch_type IS 'Type of branch: main_hq (central administration), district_hq (district headquarters), local (regular branch under a district)';
COMMENT ON COLUMN public.church_branches.district_name IS 'Name of the district (only applicable for district_hq branches)';