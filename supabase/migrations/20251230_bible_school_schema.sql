-- Bible School Module - Complete Database Schema
-- Phase 1: Core Tables with Branch/Central Architecture
-- Foundation: Branch-managed | Higher levels: Central administration

-- ============================================
-- 1. PROGRAMS TABLE (Training Levels)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level_order INTEGER NOT NULL UNIQUE,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  required_attendance_percentage INTEGER DEFAULT 75,
  is_centralized BOOLEAN DEFAULT false, -- TRUE for Discipleship, Workers, Leadership, Pastoral
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed programs with centralization flag
INSERT INTO public.bible_programs (name, level_order, duration_weeks, is_centralized, description) VALUES
  ('Foundation', 1, 12, false, 'Basic Christian foundations - Branch level'),
  ('Discipleship', 2, 24, true, 'Discipleship training - Central administration'),
  ('Workers', 3, 36, true, 'Worker training - Central administration'),
  ('Leadership', 4, 48, true, 'Leadership training - Central administration'),
  ('Pastoral', 5, 60, true, 'Pastoral training - Central administration')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. COHORTS TABLE (Specific Intakes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id), -- NULL for centralized cohorts
  cohort_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  max_students INTEGER,
  venue TEXT, -- Physical location
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, branch_id, start_date)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_cohorts_program ON public.bible_cohorts(program_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_branch ON public.bible_cohorts(branch_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_status ON public.bible_cohorts(status);

-- ============================================
-- 3. STUDENTS TABLE (Learner Records)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  current_program_id UUID REFERENCES public.bible_programs(id),
  current_cohort_id UUID REFERENCES public.bible_cohorts(id),
  highest_completed_level INTEGER DEFAULT 0, -- Track progression
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'suspended', 'completed', 'withdrawn')),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_member ON public.bible_students(member_id);
CREATE INDEX IF NOT EXISTS idx_students_program ON public.bible_students(current_program_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.bible_students(status);

-- ============================================
-- 4. APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.bible_programs(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  application_letter TEXT,
  pastor_recommendation TEXT,
  remarks TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_applications_member ON public.bible_applications(member_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.bible_applications(status);

-- ============================================
-- 5. ENROLLMENTS TABLE (Historical Record)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
  final_attendance_percentage DECIMAL(5,2),
  final_grade DECIMAL(5,2),
  UNIQUE(student_id, cohort_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.bible_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_cohort ON public.bible_enrollments(cohort_id);

-- ============================================
-- 6. LESSONS TABLE (Curriculum)
-- ============================================
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
  materials_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, week_number, lesson_order)
);

CREATE INDEX IF NOT EXISTS idx_lessons_program ON public.bible_lessons(program_id);

-- ============================================
-- 7. ATTENDANCE TABLE
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.bible_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_cohort ON public.bible_attendance(cohort_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.bible_attendance(attended_date);

-- ============================================
-- 8. EXAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.bible_programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_marks INTEGER NOT NULL,
  pass_mark INTEGER NOT NULL,
  exam_type TEXT DEFAULT 'written' CHECK (exam_type IN ('written', 'oral', 'practical', 'project')),
  is_final BOOLEAN DEFAULT false,
  exam_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exams_program ON public.bible_exams(program_id);

-- ============================================
-- 9. EXAM RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.bible_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0),
  remarks TEXT,
  graded_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  graded_at TIMESTAMPTZ,
  UNIQUE(exam_id, student_id, cohort_id)
);

-- Add computed column for pass/fail status
ALTER TABLE public.bible_exam_results 
ADD COLUMN IF NOT EXISTS status TEXT 
GENERATED ALWAYS AS (
  CASE WHEN score >= (SELECT pass_mark FROM public.bible_exams WHERE id = exam_id) 
  THEN 'pass' ELSE 'fail' END
) STORED;

CREATE INDEX IF NOT EXISTS idx_exam_results_student ON public.bible_exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON public.bible_exam_results(exam_id);

-- ============================================
-- 10. PROMOTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
  from_program_id UUID REFERENCES public.bible_programs(id),
  to_program_id UUID NOT NULL REFERENCES public.bible_programs(id),
  approved_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ DEFAULT now(),
  effective_date DATE NOT NULL,
  remarks TEXT,
  attendance_percentage DECIMAL(5,2),
  exam_average DECIMAL(5,2)
);

CREATE INDEX IF NOT EXISTS idx_promotions_student ON public.bible_promotions(student_id);
CREATE INDEX IF NOT EXISTS idx_promotions_date ON public.bible_promotions(effective_date);

-- ============================================
-- 11. GRADUATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bible_graduations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.bible_programs(id),
  cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id),
  graduation_date DATE NOT NULL,
  certificate_number TEXT UNIQUE,
  certificate_url TEXT,
  issued_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, program_id, cohort_id)
);

CREATE INDEX IF NOT EXISTS idx_graduations_student ON public.bible_graduations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduations_date ON public.bible_graduations(graduation_date);

-- ============================================
-- 12. VIEWS FOR REPORTING
-- ============================================

-- Student Progress View
CREATE OR REPLACE VIEW public.bible_student_progress AS
SELECT 
  s.id as student_id,
  s.member_id,
  m.full_name as student_name,
  p.name as current_program,
  p.level_order,
  c.cohort_name,
  c.start_date,
  c.end_date,
  s.highest_completed_level,
  s.status,
  COALESCE(att.attendance_percentage, 0) as attendance_percentage,
  COALESCE(ex.exam_average, 0) as exam_average
FROM public.bible_students s
JOIN public.members m ON m.id = s.member_id
LEFT JOIN public.bible_programs p ON p.id = s.current_program_id
LEFT JOIN public.bible_cohorts c ON c.id = s.current_cohort_id
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) FILTER (WHERE a.status = 'present') * 100.0 / NULLIF(COUNT(*), 0) as attendance_percentage
  FROM public.bible_attendance a
  WHERE a.student_id = s.id
) att ON true
LEFT JOIN LATERAL (
  SELECT AVG(er.score) as exam_average
  FROM public.bible_exam_results er
  WHERE er.student_id = s.id
) ex ON true;

-- Cohort Summary View
CREATE OR REPLACE VIEW public.bible_cohort_summary AS
SELECT 
  c.id as cohort_id,
  c.cohort_name,
  p.name as program_name,
  p.is_centralized,
  b.name as branch_name,
  c.start_date,
  c.end_date,
  c.status,
  COUNT(e.id) as enrolled_students,
  c.max_students,
  AVG(CASE WHEN att.attendance_percentage IS NOT NULL 
    THEN att.attendance_percentage ELSE 0 END) as avg_attendance
FROM public.bible_cohorts c
JOIN public.bible_programs p ON p.id = c.program_id
LEFT JOIN public.branches b ON b.id = c.branch_id
LEFT JOIN public.bible_enrollments e ON e.cohort_id = c.id AND e.status = 'active'
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) FILTER (WHERE a.status = 'present') * 100.0 / NULLIF(COUNT(*), 0) as attendance_percentage
  FROM public.bible_attendance a
  WHERE a.cohort_id = c.id
) att ON true
GROUP BY c.id, c.cohort_name, p.name, p.is_centralized, b.name, c.start_date, c.end_date, c.status, c.max_students;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
DROP TRIGGER IF EXISTS update_bible_programs_updated_at ON public.bible_programs;
CREATE TRIGGER update_bible_programs_updated_at
  BEFORE UPDATE ON public.bible_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bible_cohorts_updated_at ON public.bible_cohorts;
CREATE TRIGGER update_bible_cohorts_updated_at
  BEFORE UPDATE ON public.bible_cohorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bible_students_updated_at ON public.bible_students;
CREATE TRIGGER update_bible_students_updated_at
  BEFORE UPDATE ON public.bible_students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.bible_programs IS 'Training programs: Foundation (branch-level) and higher levels (centralized)';
COMMENT ON TABLE public.bible_cohorts IS 'Specific training intakes. branch_id is NULL for centralized programs';
COMMENT ON TABLE public.bible_students IS 'Student records tracking current and historical training';
COMMENT ON TABLE public.bible_applications IS 'Applications for Bible School programs';
COMMENT ON TABLE public.bible_enrollments IS 'Historical record of student enrollments in cohorts';
COMMENT ON TABLE public.bible_lessons IS 'Curriculum lessons for each program';
COMMENT ON TABLE public.bible_attendance IS 'Attendance tracking for lessons';
COMMENT ON TABLE public.bible_exams IS 'Examinations for programs';
COMMENT ON TABLE public.bible_exam_results IS 'Student exam results with auto-computed pass/fail status';
COMMENT ON TABLE public.bible_promotions IS 'Promotion history between program levels';
COMMENT ON TABLE public.bible_graduations IS 'Graduation records with certificate tracking';
