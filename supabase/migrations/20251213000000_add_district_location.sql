-- Add location column to districts table
ALTER TABLE districts ADD COLUMN IF NOT EXISTS location text;
