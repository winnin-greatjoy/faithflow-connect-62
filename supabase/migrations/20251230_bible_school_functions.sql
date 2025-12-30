-- Bible School Helper Functions and Views
-- Functions for calculations and reporting

-- =====================================================
-- FUNCTION: Get Student Attendance Percentage
-- =====================================================
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

-- =====================================================
-- VIEW: Attendance Summary
-- =====================================================
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

-- =====================================================
-- VIEW: Exam Results Summary
-- =====================================================
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

-- =====================================================
-- VIEW: Student Progress
-- =====================================================
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

-- =====================================================
-- VIEW: Cohort Statistics
-- =====================================================
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

-- =====================================================
-- FUNCTION: Check Promotion Eligibility
-- =====================================================
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

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION public.get_student_attendance_percentage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_promotion_eligibility(UUID, DECIMAL) TO authenticated;
GRANT SELECT ON public.bible_attendance_summary TO authenticated;
GRANT SELECT ON public.bible_exam_results_summary TO authenticated;
GRANT SELECT ON public.bible_student_progress TO authenticated;
GRANT SELECT ON public.bible_cohort_stats TO authenticated;
