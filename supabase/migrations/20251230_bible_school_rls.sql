-- Bible School Module - Row Level Security Policies
-- Enforces: Students see own data, Branch admins manage Foundation, Central admins manage higher levels

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.bible_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_graduations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. BIBLE_PROGRAMS (Public Read, Admin Write)
-- ============================================
CREATE POLICY "Anyone can view active programs"
  ON public.bible_programs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins can manage programs"
  ON public.bible_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================
-- 2. BIBLE_COHORTS (Branch/Central Split)
-- ============================================

-- View: Students see cohorts they're enrolled in
CREATE POLICY "Students can view their cohorts"
  ON public.bible_cohorts FOR SELECT
  USING (
    id IN (
      SELECT cohort_id FROM public.bible_enrollments e
      JOIN public.bible_students s ON s.id = e.student_id
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- View: Branch admins see Foundation cohorts in their branch
CREATE POLICY "Branch admins view Foundation cohorts in branch"
  ON public.bible_cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.bible_programs prog ON prog.id = bible_cohorts.program_id
      WHERE p.id = auth.uid()
        AND p.role = 'branch_admin'
        AND p.branch_id = bible_cohorts.branch_id
        AND prog.is_centralized = false
    )
  );

-- View: Central admins (district/super) see centralized cohorts
CREATE POLICY "Central admins view centralized cohorts"
  ON public.bible_cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.bible_programs prog ON prog.id = bible_cohorts.program_id
      WHERE p.id = auth.uid()
        AND p.role IN ('district_admin', 'super_admin')
        AND prog.is_centralized = true
    )
  );

-- Insert: Branch admins create Foundation cohorts for their branch
CREATE POLICY "Branch admins create Foundation cohorts"
  ON public.bible_cohorts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.bible_programs prog ON prog.id = bible_cohorts.program_id
      WHERE p.id = auth.uid()
        AND p.role = 'branch_admin'
        AND p.branch_id = bible_cohorts.branch_id
        AND prog.is_centralized = false
    )
  );

-- Insert: Central admins create centralized cohorts
CREATE POLICY "Central admins create centralized cohorts"
  ON public.bible_cohorts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.bible_programs prog ON prog.id = bible_cohorts.program_id
      WHERE p.id = auth.uid()
        AND p.role IN ('district_admin', 'super_admin')
        AND prog.is_centralized = true
    )
  );

-- Update/Delete: Same logic as insert
CREATE POLICY "Branch admins update Foundation cohorts"
  ON public.bible_cohorts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.bible_programs prog ON prog.id = bible_cohorts.program_id
      WHERE p.id = auth.uid()
        AND p.role = 'branch_admin'
        AND p.branch_id = bible_cohorts.branch_id
        AND prog.is_centralized = false
    )
  );

CREATE POLICY "Central admins update centralized cohorts"
  ON public.bible_cohorts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.bible_programs prog ON prog.id = bible_cohorts.program_id
      WHERE p.id = auth.uid()
        AND p.role IN ('district_admin', 'super_admin')
        AND prog.is_centralized = true
    )
  );

-- ============================================
-- 3. BIBLE_STUDENTS (Student + Admin Access)
-- ============================================

-- Students view their own record
CREATE POLICY "Students view own record"
  ON public.bible_students FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.members WHERE account_id = auth.uid()
    )
  );

-- Admins view students in their scope
CREATE POLICY "Admins view students in scope"
  ON public.bible_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        -- Super admin sees all
        p.role = 'super_admin'
        -- District admin sees district students
        OR (p.role = 'district_admin' AND p.district_id IN (
          SELECT district_id FROM public.branches b
          JOIN public.members m ON m.branch_id = b.id
          WHERE m.id = bible_students.member_id
        ))
        -- Branch admin sees branch students
        OR (p.role = 'branch_admin' AND p.branch_id IN (
          SELECT branch_id FROM public.members
          WHERE id = bible_students.member_id
        ))
      )
    )
  );

-- Admins create/update student records
CREATE POLICY "Admins manage students"
  ON public.bible_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- ============================================
-- 4. BIBLE_APPLICATIONS
-- ============================================

-- Students view own applications
CREATE POLICY "Students view own applications"
  ON public.bible_applications FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.members WHERE account_id = auth.uid()
    )
  );

-- Students can create applications
CREATE POLICY "Students create applications"
  ON public.bible_applications FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.members WHERE account_id = auth.uid()
    )
  );

-- Admins view applications in scope
CREATE POLICY "Admins view applications in scope"
  ON public.bible_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'super_admin'
        OR (p.role = 'district_admin' AND p.district_id IN (
          SELECT district_id FROM public.branches WHERE id = bible_applications.branch_id
        ))
        OR (p.role = 'branch_admin' AND p.branch_id = bible_applications.branch_id)
      )
    )
  );

-- Admins approve/reject applications
CREATE POLICY "Admins manage applications"
  ON public.bible_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- ============================================
-- 5. BIBLE_ENROLLMENTS
-- ============================================

-- Students view own enrollments
CREATE POLICY "Students view own enrollments"
  ON public.bible_enrollments FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.bible_students s
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- Admins view enrollments in scope
CREATE POLICY "Admins view enrollments"
  ON public.bible_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- Admins manage enrollments
CREATE POLICY "Admins manage enrollments"
  ON public.bible_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- ============================================
-- 6. BIBLE_LESSONS (Public Read for Enrolled)
-- ============================================

-- Enrolled students view lessons for their program
CREATE POLICY "Enrolled students view program lessons"
  ON public.bible_lessons FOR SELECT
  USING (
    program_id IN (
      SELECT current_program_id FROM public.bible_students s
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- Admins view all lessons
CREATE POLICY "Admins view all lessons"
  ON public.bible_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- Admins manage lessons
CREATE POLICY "Admins manage lessons"
  ON public.bible_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('district_admin', 'super_admin')
    )
  );

-- ============================================
-- 7. BIBLE_ATTENDANCE
-- ============================================

-- Students view own attendance
CREATE POLICY "Students view own attendance"
  ON public.bible_attendance FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.bible_students s
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- Admins view attendance in scope
CREATE POLICY "Admins view attendance"
  ON public.bible_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- Admins record attendance
CREATE POLICY "Admins record attendance"
  ON public.bible_attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- ============================================
-- 8. BIBLE_EXAMS (View for Enrolled)
-- ============================================

-- Students view exams for their program
CREATE POLICY "Students view program exams"
  ON public.bible_exams FOR SELECT
  USING (
    program_id IN (
      SELECT current_program_id FROM public.bible_students s
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- Admins view all exams
CREATE POLICY "Admins view exams"
  ON public.bible_exams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- Admins manage exams
CREATE POLICY "Admins manage exams"
  ON public.bible_exams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('district_admin', 'super_admin')
    )
  );

-- ============================================
-- 9. BIBLE_EXAM_RESULTS
-- ============================================

-- Students view own results
CREATE POLICY "Students view own results"
  ON public.bible_exam_results FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.bible_students s
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- Admins view all results
CREATE POLICY "Admins view results"
  ON public.bible_exam_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- Admins grade exams
CREATE POLICY "Admins grade exams"
  ON public.bible_exam_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- ============================================
-- 10. BIBLE_PROMOTIONS
-- ============================================

-- Students view own promotions
CREATE POLICY "Students view own promotions"
  ON public.bible_promotions FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.bible_students s
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- Admins view promotions
CREATE POLICY "Admins view promotions"
  ON public.bible_promotions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- Level-based promotion authority
CREATE POLICY "Admins promote students"
  ON public.bible_promotions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.bible_programs prog ON prog.id = bible_promotions.to_program_id
      WHERE p.id = auth.uid()
      AND (
        -- Super admin can promote to any level
        p.role = 'super_admin'
        -- District admin can promote up to Leadership
        OR (p.role = 'district_admin' AND prog.level_order <= 4)
        -- Branch admin can promote up to Workers
        OR (p.role = 'branch_admin' AND prog.level_order <= 3)
      )
    )
  );

-- ============================================
-- 11. BIBLE_GRADUATIONS
-- ============================================

-- Students view own graduations
CREATE POLICY "Students view own graduations"
  ON public.bible_graduations FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.bible_students s
      JOIN public.members m ON m.id = s.member_id
      WHERE m.account_id = auth.uid()
    )
  );

-- Admins view all graduations
CREATE POLICY "Admins view graduations"
  ON public.bible_graduations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- Admins record graduations
CREATE POLICY "Admins record graduations"
  ON public.bible_graduations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('branch_admin', 'district_admin', 'super_admin')
    )
  );

-- ============================================
-- GRANT ACCESS TO VIEWS
-- ============================================
GRANT SELECT ON public.bible_student_progress TO authenticated;
GRANT SELECT ON public.bible_cohort_summary TO authenticated;
