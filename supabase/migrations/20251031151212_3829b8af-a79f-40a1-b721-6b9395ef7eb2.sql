-- Add slug column to departments table
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS slug TEXT;

-- Populate slug for existing departments based on their names
UPDATE public.departments
SET slug = CASE
  WHEN LOWER(name) = 'choir' THEN 'choir'
  WHEN LOWER(name) = 'ushering' THEN 'ushering'
  WHEN LOWER(name) = 'media' THEN 'media'
  WHEN LOWER(name) = 'finance' THEN 'finance'
  WHEN LOWER(name) = 'prayer team' THEN 'prayer-team'
  WHEN LOWER(name) = 'evangelism' THEN 'evangelism'
  WHEN LOWER(name) = 'technical' THEN 'technical'
  ELSE LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
END
WHERE slug IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE public.departments ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on slug per branch
ALTER TABLE public.departments ADD CONSTRAINT departments_branch_slug_unique UNIQUE (branch_id, slug);