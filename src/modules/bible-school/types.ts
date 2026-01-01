// src/modules/bible-school/types.ts
// Re-export core types from main types file
export type {
    ProgramName,
    CohortStatus,
    StudentStatus,
    ApplicationStatus,
    EnrollmentStatus,
    AttendanceStatus,
    ExamType,
    ExamResultStatus,
    BibleProgram,
    BibleCohort,
    BibleStudent,
    BibleApplication,
    BibleEnrollment,
    BibleLesson,
    BibleAttendance,
    BibleExam,
    BibleExamResult,
    BiblePromotion,
    BibleGraduation,
    StudentProgress,
    CohortSummary,
    ApplicationFormData,
    CreateCohortFormData,
    RecordAttendanceFormData,
    GradeExamFormData,
    PromoteStudentFormData,
    GraduateStudentFormData,
    BibleSchoolStats,
    PromotionEligibility,
    TabType,
} from '@/types/bible-school';

import type { TabType } from '@/types/bible-school';

// Module-specific filter types
export interface BibleSchoolFilters {
    search: string;
    activeTab: TabType;
    cohortFilter: string; // 'all' or cohort ID
    statusFilter: string; // 'all', 'active', 'completed', etc.
    branchFilter: string; // 'all' or branch ID
}

// Pagination config
export interface PaginationConfig {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
}
