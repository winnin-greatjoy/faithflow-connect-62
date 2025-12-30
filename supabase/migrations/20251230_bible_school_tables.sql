-- Bible School Tables Migration
-- Creates all core tables for Bible School functionality

-- =====================================================
-- 1. PROGRAMS TABLE (with seed data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level_order INTEGER NOT NULL UNIQUE,
    description TEXT,
    duration_weeks INTEGER NOT NULL,
    required_attendance_percentage INTEGER DEFAULT 75,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data for programs
INSERT INTO public.bible_programs (name, level_order, duration_weeks, description) VALUES
    ('Foundation', 1, 12, 'Basic Christian foundations and doctrine'),
    ('Discipleship', 2, 24, 'Deepening faith and spiritual growth'),
    ('Workers', 3, 36, 'Training for church ministry and service'),
    ('Leadership', 4, 48, 'Developing leadership skills and wisdom'),
    ('Pastoral', 5, 60, 'Advanced pastoral and ministerial training')
ON CONFLICT (level_order) DO NOTHING;

-- =====================================================
-- 2. COHORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.church_branches(id) ON DELETE CASCADE,
    cohort_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    max_students INTEGER,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(program_id, branch_id, start_date)
);

-- =====================================================
-- 3. STUDENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
    current_program_id UUID REFERENCES public.bible_programs(id),
    current_cohort_id UUID REFERENCES public.bible_cohorts(id),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'suspended', 'completed', 'withdrawn')),
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 4. APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.church_branches(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    remarks TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

-- =====================================================
-- 5. ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
    UNIQUE(student_id, cohort_id)
);

-- =====================================================
-- 6. LESSONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    week_number INTEGER NOT NULL,
    lesson_order INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 90,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(program_id, week_number, lesson_order)
);

-- =====================================================
-- 7. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.bible_lessons(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
    attended_date DATE NOT NULL,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'excused', 'late')),
    remarks TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lesson_id, student_id, cohort_id)
);

-- =====================================================
-- 8. EXAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    total_marks INTEGER NOT NULL,
    pass_mark INTEGER NOT NULL,
    exam_type TEXT DEFAULT 'written' CHECK (exam_type IN ('written', 'oral', 'practical', 'project')),
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 9. EXAM RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.bible_exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    status TEXT GENERATED ALWAYS AS (
        CASE WHEN score >= (SELECT pass_mark FROM public.bible_exams WHERE id = exam_id) 
        THEN 'pass' ELSE 'fail' END
    ) STORED,
    remarks TEXT,
    graded_by UUID REFERENCES public.profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    graded_at TIMESTAMPTZ,
    UNIQUE(exam_id, student_id, cohort_id)
);

-- =====================================================
-- 10. PROMOTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
    from_program_id UUID REFERENCES public.bible_programs(id),
    to_program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ DEFAULT now(),
    effective_date DATE NOT NULL,
    remarks TEXT
);

-- =====================================================
-- 11. GRADUATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_graduations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
    graduation_date DATE NOT NULL,
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    issued_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, program_id, cohort_id)
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bible_cohorts_program ON public.bible_cohorts(program_id);
CREATE INDEX IF NOT EXISTS idx_bible_cohorts_branch ON public.bible_cohorts(branch_id);
CREATE INDEX IF NOT EXISTS idx_bible_cohorts_status ON public.bible_cohorts(status);

CREATE INDEX IF NOT EXISTS idx_bible_students_member ON public.bible_students(member_id);
CREATE INDEX IF NOT EXISTS idx_bible_students_program ON public.bible_students(current_program_id);
CREATE INDEX IF NOT EXISTS idx_bible_students_cohort ON public.bible_students(current_cohort_id);

CREATE INDEX IF NOT EXISTS idx_bible_applications_member ON public.bible_applications(member_id);
CREATE INDEX IF NOT EXISTS idx_bible_applications_status ON public.bible_applications(status);

CREATE INDEX IF NOT EXISTS idx_bible_attendance_student ON public.bible_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_bible_attendance_cohort ON public.bible_attendance(cohort_id);

CREATE INDEX IF NOT EXISTS idx_bible_exam_results_student ON public.bible_exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_bible_exam_results_exam ON public.bible_exam_results(exam_id);
