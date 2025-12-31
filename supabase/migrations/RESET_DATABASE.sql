-- ⚠️ WARNING: This script DELETES ALL DATA and resets the database
-- Run this ONLY if you want to start completely fresh

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- 1. Clear all data from tables (order matters due to foreign keys)
TRUNCATE TABLE public.bible_audit_logs CASCADE;
TRUNCATE TABLE public.bible_graduations CASCADE;
TRUNCATE TABLE public.bible_promotions CASCADE;
TRUNCATE TABLE public.bible_exam_results CASCADE;
TRUNCATE TABLE public.bible_attendance CASCADE;
TRUNCATE TABLE public.bible_enrollments CASCADE;
TRUNCATE TABLE public.bible_students CASCADE;
TRUNCATE TABLE public.bible_applications CASCADE;
TRUNCATE TABLE public.bible_lessons CASCADE;
TRUNCATE TABLE public.bible_exams CASCADE;
TRUNCATE TABLE public.bible_cohorts CASCADE;
-- Note: Don't truncate bible_programs as they're seeded reference data

TRUNCATE TABLE public.committee_members CASCADE;
TRUNCATE TABLE public.committee_tasks CASCADE;
TRUNCATE TABLE public.committees CASCADE;

TRUNCATE TABLE public.ministry_members CASCADE;
TRUNCATE TABLE public.department_assignments CASCADE;
TRUNCATE TABLE public.departments CASCADE;
TRUNCATE TABLE public.ministries CASCADE;

TRUNCATE TABLE public.children CASCADE;
TRUNCATE TABLE public.first_timers CASCADE;
TRUNCATE TABLE public.members CASCADE;

TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Note: Keep church_branches but clear if you want fresh branches too
-- TRUNCATE TABLE public.church_branches CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- 2. Delete all auth users (this requires admin API or Supabase dashboard)
-- You'll need to do this in Supabase Dashboard: Authentication > Users > Select All > Delete
-- OR run: DELETE FROM auth.users; (if you have access)

-- 3. Create initial branch (if needed)
INSERT INTO public.church_branches (id, name, slug, address, phone, pastor_name, is_main)
VALUES (
    gen_random_uuid(),
    'Main Branch',
    'main-branch',
    'Church Address Here',
    '+1234567890',
    'Pastor Name',
    true
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SUPERADMIN SETUP
-- After running this, create the superadmin via Supabase Auth
-- =====================================================
-- 
-- OPTION 1: Use Supabase Dashboard
-- 1. Go to Authentication > Users > Add user
-- 2. Create user with email: superadmin@yourchurch.com
-- 3. Then run the SQL below to set up their profile
--
-- OPTION 2: Use the existing SETUP_SUPERADMIN.sql migration
-- See: supabase/migrations/SETUP_SUPERADMIN.sql
