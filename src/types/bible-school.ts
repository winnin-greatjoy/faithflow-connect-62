// src/types/bible-school.ts
// TypeScript definitions for Bible School module

export type ProgramName = 'Foundation' | 'Discipleship' | 'Workers' | 'Leadership' | 'Pastoral';
export type CohortStatus = 'planned' | 'active' | 'completed' | 'cancelled';
export type StudentStatus = 'enrolled' | 'suspended' | 'completed' | 'withdrawn';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export type EnrollmentStatus = 'active' | 'completed' | 'withdrawn';
export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';
export type ExamType = 'written' | 'oral' | 'practical' | 'project';
export type ExamResultStatus = 'pass' | 'fail';

// Program (Training Level)
export interface BibleProgram {
    id: string;
    name: ProgramName;
    level_order: number;
    description: string | null;
    duration_weeks: number;
    required_attendance_percentage: number;
    is_centralized: boolean; // false for Foundation, true for higher levels
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Cohort (Specific Intake)
export interface BibleCohort {
    id: string;
    program_id: string;
    branch_id: string | null; // null for centralized programs
    cohort_name: string;
    start_date: string;
    end_date: string;
    status: CohortStatus;
    max_students: number | null;
    venue: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// Student Record
export interface BibleStudent {
    id: string;
    member_id: string;
    current_program_id: string | null;
    current_cohort_id: string | null;
    highest_completed_level: number;
    status: StudentStatus;
    enrolled_at: string;
    updated_at: string;
}

// Application
export interface BibleApplication {
    id: string;
    member_id: string;
    program_id: string;
    branch_id: string;
    status: ApplicationStatus;
    application_letter: string | null;
    pastor_recommendation: string | null;
    remarks: string | null;
    reviewed_by: string | null;
    submitted_at: string;
    reviewed_at: string | null;
}

// Enrollment (Historical)
export interface BibleEnrollment {
    id: string;
    student_id: string;
    cohort_id: string;
    enrolled_at: string;
    completed_at: string | null;
    status: EnrollmentStatus;
    final_attendance_percentage: number | null;
    final_grade: number | null;
}

// Lesson
export interface BibleLesson {
    id: string;
    program_id: string;
    title: string;
    description: string | null;
    content: string | null;
    week_number: number;
    lesson_order: number;
    duration_minutes: number;
    is_mandatory: boolean;
    materials_url: string | null;
    created_at: string;
    updated_at: string;
}

// Attendance Record
export interface BibleAttendance {
    id: string;
    lesson_id: string;
    student_id: string;
    cohort_id: string;
    attended_date: string;
    status: AttendanceStatus;
    remarks: string | null;
    recorded_by: string | null;
    created_at: string;
}

// Exam
export interface BibleExam {
    id: string;
    program_id: string;
    title: string;
    description: string | null;
    total_marks: number;
    pass_mark: number;
    exam_type: ExamType;
    is_final: boolean;
    exam_date: string | null;
    created_at: string;
    updated_at: string;
}

// Exam Result
export interface BibleExamResult {
    id: string;
    exam_id: string;
    student_id: string;
    cohort_id: string;
    score: number;
    status: ExamResultStatus; // Computed based on score vs pass_mark
    remarks: string | null;
    graded_by: string | null;
    submitted_at: string;
    graded_at: string | null;
}

// Promotion Record
export interface BiblePromotion {
    id: string;
    student_id: string;
    from_program_id: string | null;
    to_program_id: string;
    approved_by: string;
    approved_at: string;
    effective_date: string;
    remarks: string | null;
    attendance_percentage: number | null;
    exam_average: number | null;
}

// Graduation Record
export interface BibleGraduation {
    id: string;
    student_id: string;
    program_id: string;
    cohort_id: string;
    graduation_date: string;
    certificate_number: string | null;
    certificate_url: string | null;
    issued_by: string | null;
    created_at: string;
}

// ============================================
// VIEWS & COMPUTED DATA
// ============================================

// Student Progress (From view)
export interface StudentProgress {
    student_id: string;
    member_id: string;
    student_name: string;
    current_program: string | null;
    level_order: number | null;
    cohort_name: string | null;
    start_date: string | null;
    end_date: string | null;
    highest_completed_level: number;
    status: StudentStatus;
    attendance_percentage: number;
    exam_average: number;
}

// Cohort Summary (From view)
export interface CohortSummary {
    cohort_id: string;
    cohort_name: string;
    program_name: string;
    is_centralized: boolean;
    branch_name: string | null;
    start_date: string;
    end_date: string;
    status: CohortStatus;
    enrolled_students: number;
    max_students: number | null;
    avg_attendance: number;
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface ApplicationFormData {
    programId: string;
    remarks?: string;
    pastorRecommendation?: string;
}

export interface CreateCohortFormData {
    programId: string;
    branchId?: string; // Optional for centralized programs
    cohortName: string;
    startDate: string;
    endDate: string;
    maxStudents?: number;
    venue?: string;
}

export interface RecordAttendanceFormData {
    lessonId: string;
    studentId: string;
    cohortId: string;
    status: AttendanceStatus;
    remarks?: string;
}

export interface GradeExamFormData {
    examId: string;
    studentId: string;
    cohortId: string;
    score: number;
    remarks?: string;
}

export interface PromoteStudentFormData {
    studentId: string;
    toProgramId: string;
    remarks?: string;
}

export interface GraduateStudentFormData {
    studentId: string;
    programId: string;
    cohortId: string;
    graduationDate?: string;
}

// ============================================
// UI HELPER TYPES
// ============================================

export interface BibleSchoolStats {
    totalStudents: number;
    activeStudents: number;
    activeCohorts: number;
    foundationStudents: number;
    centralStudents: number;
    pendingApplications: number;
}

export interface PromotionEligibility {
    eligible: boolean;
    reason?: string;
    attendancePercentage: number;
    examAverage: number;
    allExamsPassed: boolean;
}

export type TabType = 'all' | 'foundation' | 'discipleship' | 'workers' | 'leadership' | 'pastoral';
