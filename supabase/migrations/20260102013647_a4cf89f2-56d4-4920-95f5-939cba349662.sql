-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'district_overseer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'general_overseer';