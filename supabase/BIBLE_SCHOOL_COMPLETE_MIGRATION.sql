-- =====================================================
-- BIBLE SCHOOL COMPLETE MIGRATION
-- Combined file for manual execution in Supabase Dashboard
-- =====================================================

-- =====================================================
-- PART 1: TABLES
-- =====================================================

-- 1. PROGRAMS TABLE (with seed data)
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

-- 2. COHORTS TABLE
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

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.bible_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
    current_program_id UUID REFERENCES public.bible_programs(id),
    current_cohort_id UUID REFERENCES public.bible_cohorts(id),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'suspended', 'completed', 'withdrawn')),
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. APPLICATIONS TABLE
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

-- 5. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.bible_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
    UNIQUE(student_id, cohort_id)
);

-- 6. LESSONS TABLE
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

-- 7. ATTENDANCE TABLE
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

-- 8. EXAMS TABLE
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

-- 9. EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.bible_exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.bible_exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.bible_students(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.bible_cohorts(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    status TEXT, -- Will be set by application logic: 'pass' or 'fail'
    remarks TEXT,
    graded_by UUID REFERENCES public.profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    graded_at TIMESTAMPTZ,
    UNIQUE(exam_id, student_id, cohort_id)
);

-- 10. PROMOTIONS TABLE
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

-- 11. GRADUATIONS TABLE
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

-- INDEXES for performance
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

-- =====================================================
-- PART 2: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- BIBLE_PROGRAMS - Public read, admin write
ALTER TABLE public.bible_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are viewable by everyone"
    ON public.bible_programs FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage programs"
    ON public.bible_programs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_COHORTS - Branch/District scoped
ALTER TABLE public.bible_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cohorts viewable by branch/district"
    ON public.bible_cohorts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND (
                p.role = 'super_admin'
                OR (p.role = 'district_admin' AND p.district_id IN (
                    SELECT district_id FROM public.church_branches WHERE id = bible_cohorts.branch_id
                ))
                OR (p.role = 'branch_admin' AND p.branch_id = bible_cohorts.branch_id)
            )
        )
    );

CREATE POLICY "Admins can manage cohorts in their scope"
    ON public.bible_cohorts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND (
                p.role = 'super_admin'
                OR (p.role = 'district_admin' AND p.district_id IN (
                    SELECT district_id FROM public.church_branches WHERE id = bible_cohorts.branch_id
                ))
                OR (p.role = 'branch_admin' AND p.branch_id = bible_cohorts.branch_id)
            )
        )
    );

-- BIBLE_STUDENTS - Students see own, admins see scope
ALTER TABLE public.bible_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own record"
    ON public.bible_students FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM public.members WHERE account_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view students in their scope"
    ON public.bible_students FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND (
                p.role = 'super_admin'
                OR (p.role = 'district_admin' AND p.district_id IN (
                    SELECT district_id FROM public.church_branches b
                    JOIN public.bible_cohorts c ON c.branch_id = b.id
                    WHERE c.id = bible_students.current_cohort_id
                ))
                OR (p.role = 'branch_admin' AND p.branch_id IN (
                    SELECT branch_id FROM public.bible_cohorts 
                    WHERE id = bible_students.current_cohort_id
                ))
            )
        )
    );

CREATE POLICY "Admins can manage students"
    ON public.bible_students FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_APPLICATIONS - Members apply, admins review
ALTER TABLE public.bible_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own applications"
    ON public.bible_applications FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM public.members WHERE account_id = auth.uid()
        )
    );

CREATE POLICY "Members can create applications"
    ON public.bible_applications FOR INSERT
    WITH CHECK (
        member_id IN (
            SELECT id FROM public.members WHERE account_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view applications in their scope"
    ON public.bible_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND (
                p.role = 'super_admin'
                OR (p.role = 'district_admin' AND p.district_id IN (
                    SELECT district_id FROM public.church_branches 
                    WHERE id = bible_applications.branch_id
                ))
                OR (p.role = 'branch_admin' AND p.branch_id = bible_applications.branch_id)
            )
        )
    );

CREATE POLICY "Admins can update applications"
    ON public.bible_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_ENROLLMENTS - Scoped to cohort
ALTER TABLE public.bible_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrollments viewable by relevant parties"
    ON public.bible_enrollments FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.bible_students 
            WHERE member_id IN (
                SELECT id FROM public.members WHERE account_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

CREATE POLICY "Admins can manage enrollments"
    ON public.bible_enrollments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_LESSONS - Public read for students
ALTER TABLE public.bible_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons viewable by everyone"
    ON public.bible_lessons FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage lessons"
    ON public.bible_lessons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_ATTENDANCE - Students see own, admins see all
ALTER TABLE public.bible_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own attendance"
    ON public.bible_attendance FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.bible_students 
            WHERE member_id IN (
                SELECT id FROM public.members WHERE account_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all attendance"
    ON public.bible_attendance FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

CREATE POLICY "Admins can manage attendance"
    ON public.bible_attendance FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_EXAMS - Public read
ALTER TABLE public.bible_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exams viewable by everyone"
    ON public.bible_exams FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage exams"
    ON public.bible_exams FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_EXAM_RESULTS - Students see own, admins see all
ALTER TABLE public.bible_exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own results"
    ON public.bible_exam_results FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.bible_students 
            WHERE member_id IN (
                SELECT id FROM public.members WHERE account_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all results"
    ON public.bible_exam_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

CREATE POLICY "Admins can manage results"
    ON public.bible_exam_results FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_PROMOTIONS - Read only for students
ALTER TABLE public.bible_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own promotions"
    ON public.bible_promotions FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.bible_students 
            WHERE member_id IN (
                SELECT id FROM public.members WHERE account_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all promotions"
    ON public.bible_promotions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

CREATE POLICY "Admins can create promotions"
    ON public.bible_promotions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- BIBLE_GRADUATIONS - Read only for students
ALTER TABLE public.bible_graduations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own graduations"
    ON public.bible_graduations FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.bible_students 
            WHERE member_id IN (
                SELECT id FROM public.members WHERE account_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all graduations"
    ON public.bible_graduations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

CREATE POLICY "Admins can create graduations"
    ON public.bible_graduations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND role IN ('super_admin', 'district_admin', 'branch_admin')
        )
    );

-- =====================================================
-- PART 3: FUNCTIONS AND VIEWS
-- =====================================================

-- FUNCTION: Get Student Attendance Percentage
CREATE OR REPLACE FUNCTION public.get_student_attendance_percentage(student_id UUID)
RETURNS TABLE (percentage DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'present')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
                2
            ),
            0
        ) AS percentage
    FROM public.bible_attendance
    WHERE bible_attendance.student_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- VIEW: Attendance Summary
CREATE OR REPLACE VIEW public.bible_attendance_summary AS
SELECT 
    s.id as student_id,
    s.member_id,
    c.id as cohort_id,
    COUNT(*) FILTER (WHERE a.status = 'present') * 100.0 / NULLIF(COUNT(*), 0) as attendance_percentage,
    COUNT(*) as total_lessons,
    COUNT(*) FILTER (WHERE a.status = 'present') as attended,
    COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
    COUNT(*) FILTER (WHERE a.status = 'excused') as excused,
    COUNT(*) FILTER (WHERE a.status = 'late') as late
FROM public.bible_students s
LEFT JOIN public.bible_enrollments e ON e.student_id = s.id
LEFT JOIN public.bible_cohorts c ON c.id = e.cohort_id
LEFT JOIN public.bible_attendance a ON a.student_id = s.id AND a.cohort_id = c.id
GROUP BY s.id, s.member_id, c.id;

-- VIEW: Exam Results Summary
CREATE OR REPLACE VIEW public.bible_exam_results_summary AS
SELECT 
    s.id as student_id,
    s.member_id,
    e.id as exam_id,
    e.title as exam_title,
    e.is_final,
    er.score,
    er.status,
    e.pass_mark,
    e.total_marks,
    ROUND((er.score / e.total_marks) * 100, 2) as percentage
FROM public.bible_students s
JOIN public.bible_exam_results er ON er.student_id = s.id
JOIN public.bible_exams e ON e.id = er.exam_id;

-- VIEW: Student Progress
CREATE OR REPLACE VIEW public.bible_student_progress AS
SELECT 
    s.id as student_id,
    s.member_id,
    m.full_name as member_name,
    p.name as current_program,
    p.level_order,
    c.cohort_name,
    c.start_date,
    c.end_date,
    s.status,
    att.attendance_percentage,
    att.total_lessons,
    att.attended,
    COUNT(DISTINCT er.id) FILTER (WHERE er.status = 'pass') as exams_passed,
    COUNT(DISTINCT er.id) as total_exams
FROM public.bible_students s
JOIN public.members m ON m.id = s.member_id
LEFT JOIN public.bible_programs p ON p.id = s.current_program_id
LEFT JOIN public.bible_cohorts c ON c.id = s.current_cohort_id
LEFT JOIN public.bible_attendance_summary att ON att.student_id = s.id
LEFT JOIN public.bible_exam_results er ON er.student_id = s.id
GROUP BY 
    s.id, s.member_id, m.full_name, p.name, p.level_order,
    c.cohort_name, c.start_date, c.end_date, s.status,
    att.attendance_percentage, att.total_lessons, att.attended;

-- VIEW: Cohort Statistics
CREATE OR REPLACE VIEW public.bible_cohort_stats AS
SELECT 
    c.id as cohort_id,
    c.cohort_name,
    p.name as program_name,
    b.name as branch_name,
    c.status,
    c.start_date,
    c.end_date,
    c.max_students,
    COUNT(DISTINCT e.student_id) as enrolled_students,
    COUNT(DISTINCT e.student_id) FILTER (WHERE e.status = 'active') as active_students,
    COUNT(DISTINCT e.student_id) FILTER (WHERE e.status = 'completed') as completed_students
FROM public.bible_cohorts c
JOIN public.bible_programs p ON p.id = c.program_id
JOIN public.church_branches b ON b.id = c.branch_id
LEFT JOIN public.bible_enrollments e ON e.cohort_id = c.id
GROUP BY 
    c.id, c.cohort_name, p.name, b.name, c.status,
    c.start_date, c.end_date, c.max_students;

-- FUNCTION: Check Promotion Eligibility
CREATE OR REPLACE FUNCTION public.check_promotion_eligibility(
    p_student_id UUID,
    p_min_attendance DECIMAL DEFAULT 75
)
RETURNS JSON AS $$
DECLARE
    v_attendance DECIMAL;
    v_passed_finals BOOLEAN;
    v_result JSON;
BEGIN
    -- Check attendance
    SELECT percentage INTO v_attendance
    FROM public.get_student_attendance_percentage(p_student_id);
    
    -- Check if all final exams are passed
    SELECT COALESCE(BOOL_AND(er.status = 'pass'), false) INTO v_passed_finals
    FROM public.bible_exam_results er
    JOIN public.bible_exams e ON e.id = er.exam_id
    WHERE er.student_id = p_student_id
    AND e.is_final = true;
    
    -- Build result
    v_result := json_build_object(
        'eligible', (v_attendance >= p_min_attendance AND v_passed_finals),
        'attendance_percentage', v_attendance,
        'min_attendance_required', p_min_attendance,
        'passed_all_finals', v_passed_finals
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_student_attendance_percentage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_promotion_eligibility(UUID, DECIMAL) TO authenticated;
GRANT SELECT ON public.bible_attendance_summary TO authenticated;
GRANT SELECT ON public.bible_exam_results_summary TO authenticated;
GRANT SELECT ON public.bible_student_progress TO authenticated;
GRANT SELECT ON public.bible_cohort_stats TO authenticated;
