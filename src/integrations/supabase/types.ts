export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_provisioning_jobs: {
        Row: {
          created_at: string | null
          created_by: string | null
          delivery_method: string
          id: string
          member_id: string
          processed_at: string | null
          reason: string | null
          status: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["provision_type"]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivery_method?: string
          id?: string
          member_id: string
          processed_at?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["provision_type"]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivery_method?: string
          id?: string
          member_id?: string
          processed_at?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          type?: Database["public"]["Enums"]["provision_type"]
        }
        Relationships: [
          {
            foreignKeyName: "account_provisioning_jobs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_slots: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          duration_minutes: number | null
          end_time: string
          host_id: string
          id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          duration_minutes?: number | null
          end_time: string
          host_id: string
          id?: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          duration_minutes?: number | null
          end_time?: string
          host_id?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_slots_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          end_at: string
          host_id: string
          id: string
          notes: string | null
          requester_id: string
          start_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_at: string
          host_id: string
          id?: string
          notes?: string | null
          requester_id: string
          start_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_at?: string
          host_id?: string
          id?: string
          notes?: string | null
          requester_id?: string
          start_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          branch_id: string
          created_at: string | null
          event_id: string | null
          id: string
          member_id: string
          notes: string | null
        }
        Insert: {
          attendance_date: string
          branch_id: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          member_id: string
          notes?: string | null
        }
        Update: {
          attendance_date?: string
          branch_id?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          member_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      bible_applications: {
        Row: {
          branch_id: string
          id: string
          member_id: string
          program_id: string
          remarks: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          branch_id: string
          id?: string
          member_id: string
          program_id: string
          remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          branch_id?: string
          id?: string
          member_id?: string
          program_id?: string
          remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_applications_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_applications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_attendance: {
        Row: {
          attended_date: string
          cohort_id: string
          created_at: string | null
          id: string
          lesson_id: string
          recorded_by: string | null
          remarks: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          attended_date: string
          cohort_id: string
          created_at?: string | null
          id?: string
          lesson_id: string
          recorded_by?: string | null
          remarks?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          attended_date?: string
          cohort_id?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          recorded_by?: string | null
          remarks?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_attendance_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_attendance_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohort_stats"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_attendance_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_attendance_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "bible_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_exam_results_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_student_progress"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_students"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
          student_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          student_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_audit_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_audit_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_exam_results_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_audit_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_student_progress"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_audit_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_students"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_cohorts: {
        Row: {
          branch_id: string
          cohort_name: string
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          max_students: number | null
          program_id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          cohort_name: string
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          max_students?: number | null
          program_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          cohort_name?: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          max_students?: number | null
          program_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_cohorts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_cohorts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_cohorts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_enrollments: {
        Row: {
          cohort_id: string
          completed_at: string | null
          enrolled_at: string | null
          id: string
          status: string | null
          student_id: string
        }
        Insert: {
          cohort_id: string
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string | null
          student_id: string
        }
        Update: {
          cohort_id?: string
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohort_stats"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_exam_results_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_student_progress"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_students"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_exam_results: {
        Row: {
          cohort_id: string
          exam_id: string
          graded_at: string | null
          graded_by: string | null
          id: string
          remarks: string | null
          score: number
          status: string | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          cohort_id: string
          exam_id: string
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          remarks?: string | null
          score: number
          status?: string | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          cohort_id?: string
          exam_id?: string
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          remarks?: string | null
          score?: number
          status?: string | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_exam_results_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_exam_results_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohort_stats"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_exam_results_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "bible_exam_results_summary"
            referencedColumns: ["exam_id"]
          },
          {
            foreignKeyName: "bible_exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "bible_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_exam_results_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_exam_results_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_student_progress"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_students"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_exams: {
        Row: {
          created_at: string | null
          description: string | null
          exam_type: string | null
          id: string
          is_final: boolean | null
          pass_mark: number
          program_id: string
          title: string
          total_marks: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          exam_type?: string | null
          id?: string
          is_final?: boolean | null
          pass_mark: number
          program_id: string
          title: string
          total_marks: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          exam_type?: string | null
          id?: string
          is_final?: boolean | null
          pass_mark?: number
          program_id?: string
          title?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "bible_exams_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_graduations: {
        Row: {
          certificate_number: string | null
          certificate_url: string | null
          cohort_id: string
          created_at: string | null
          graduation_date: string
          id: string
          issued_by: string | null
          program_id: string
          student_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_url?: string | null
          cohort_id: string
          created_at?: string | null
          graduation_date: string
          id?: string
          issued_by?: string | null
          program_id: string
          student_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_url?: string | null
          cohort_id?: string
          created_at?: string | null
          graduation_date?: string
          id?: string
          issued_by?: string | null
          program_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_graduations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_graduations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohort_stats"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_graduations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_graduations_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_graduations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_exam_results_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_student_progress"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_students"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_lessons: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_mandatory: boolean | null
          lesson_order: number
          program_id: string
          title: string
          week_number: number
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          lesson_order: number
          program_id: string
          title: string
          week_number: number
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          lesson_order?: number
          program_id?: string
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "bible_lessons_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number
          id: string
          is_active: boolean | null
          level_order: number
          name: string
          required_attendance_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks: number
          id?: string
          is_active?: boolean | null
          level_order: number
          name: string
          required_attendance_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number
          id?: string
          is_active?: boolean | null
          level_order?: number
          name?: string
          required_attendance_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bible_promotions: {
        Row: {
          approved_at: string | null
          approved_by: string
          effective_date: string
          from_program_id: string | null
          id: string
          remarks: string | null
          student_id: string
          to_program_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by: string
          effective_date: string
          from_program_id?: string | null
          id?: string
          remarks?: string | null
          student_id: string
          to_program_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string
          effective_date?: string
          from_program_id?: string | null
          id?: string
          remarks?: string | null
          student_id?: string
          to_program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_promotions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_promotions_from_program_id_fkey"
            columns: ["from_program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_promotions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_promotions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_exam_results_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_promotions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_student_progress"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bible_promotions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bible_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_promotions_to_program_id_fkey"
            columns: ["to_program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_students: {
        Row: {
          current_cohort_id: string | null
          current_program_id: string | null
          enrolled_at: string | null
          id: string
          member_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          current_cohort_id?: string | null
          current_program_id?: string | null
          enrolled_at?: string | null
          id?: string
          member_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          current_cohort_id?: string | null
          current_program_id?: string | null
          enrolled_at?: string | null
          id?: string
          member_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_students_current_cohort_id_fkey"
            columns: ["current_cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_attendance_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_students_current_cohort_id_fkey"
            columns: ["current_cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohort_stats"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "bible_students_current_cohort_id_fkey"
            columns: ["current_cohort_id"]
            isOneToOne: false
            referencedRelation: "bible_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_students_current_program_id_fkey"
            columns: ["current_program_id"]
            isOneToOne: false
            referencedRelation: "bible_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_students_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          age: number | null
          created_at: string | null
          date_of_birth: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          member_id: string
          name: string
          notes: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          member_id: string
          name: string
          notes?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          member_id?: string
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      choir_repertoire: {
        Row: {
          audio_url: string | null
          category: string | null
          composer: string | null
          created_at: string | null
          created_by: string | null
          department_id: string
          difficulty: string | null
          duration: number | null
          id: string
          key_signature: string | null
          last_performed: string | null
          lyrics: string | null
          notes: string | null
          performance_count: number | null
          sheet_music_url: string | null
          tempo: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          composer?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id: string
          difficulty?: string | null
          duration?: number | null
          id?: string
          key_signature?: string | null
          last_performed?: string | null
          lyrics?: string | null
          notes?: string | null
          performance_count?: number | null
          sheet_music_url?: string | null
          tempo?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          composer?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string
          difficulty?: string | null
          duration?: number | null
          id?: string
          key_signature?: string | null
          last_performed?: string | null
          lyrics?: string | null
          notes?: string | null
          performance_count?: number | null
          sheet_music_url?: string | null
          tempo?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "choir_repertoire_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      church_branches: {
        Row: {
          address: string
          branch_type: string
          created_at: string | null
          district_id: string | null
          district_name: string | null
          id: string
          is_district_hq: boolean | null
          is_main: boolean | null
          name: string
          parent_id: string | null
          pastor_name: string | null
          phone: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          address: string
          branch_type?: string
          created_at?: string | null
          district_id?: string | null
          district_name?: string | null
          id?: string
          is_district_hq?: boolean | null
          is_main?: boolean | null
          name: string
          parent_id?: string | null
          pastor_name?: string | null
          phone?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          branch_type?: string
          created_at?: string | null
          district_id?: string | null
          district_name?: string | null
          id?: string
          is_district_hq?: boolean | null
          is_main?: boolean | null
          name?: string
          parent_id?: string | null
          pastor_name?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "church_branches_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_branches_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          committee_id: string
          created_at: string | null
          id: string
          joined_at: string | null
          member_id: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          committee_id: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          member_id: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          committee_id?: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          member_id?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_tasks: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          attachments: string[] | null
          checklist: Json | null
          comments: Json | null
          committee_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          attachments?: string[] | null
          checklist?: Json | null
          comments?: Json | null
          committee_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          attachments?: string[] | null
          checklist?: Json | null
          comments?: Json | null
          committee_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      committees: {
        Row: {
          created_at: string | null
          description: string | null
          head_member_id: string | null
          id: string
          is_active: boolean
          meeting_schedule: string | null
          ministry_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          head_member_id?: string | null
          id?: string
          is_active?: boolean
          meeting_schedule?: string | null
          ministry_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          head_member_id?: string | null
          id?: string
          is_active?: boolean
          meeting_schedule?: string | null
          ministry_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committees_head_member_id_fkey"
            columns: ["head_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committees_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      convert_process: {
        Row: {
          baptism_date: string | null
          branch_approval_date: string | null
          branch_approved_by: string | null
          created_at: string | null
          district_approval_date: string | null
          district_approved_by: string | null
          id: string
          member_id: string
          national_approval_date: string | null
          national_approved_by: string | null
          notes: string | null
          status: Database["public"]["Enums"]["convert_status"] | null
          updated_at: string | null
        }
        Insert: {
          baptism_date?: string | null
          branch_approval_date?: string | null
          branch_approved_by?: string | null
          created_at?: string | null
          district_approval_date?: string | null
          district_approved_by?: string | null
          id?: string
          member_id: string
          national_approval_date?: string | null
          national_approved_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["convert_status"] | null
          updated_at?: string | null
        }
        Update: {
          baptism_date?: string | null
          branch_approval_date?: string | null
          branch_approved_by?: string | null
          created_at?: string | null
          district_approval_date?: string | null
          district_approved_by?: string | null
          id?: string
          member_id?: string
          national_approval_date?: string | null
          national_approved_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["convert_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convert_process_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      department_assignments: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          assigned_by: string
          assigned_date: string
          created_at: string | null
          department_id: string
          id: string
          member_id: string
          reason: string
          status: Database["public"]["Enums"]["assignment_status"] | null
          type: Database["public"]["Enums"]["assignment_type"]
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          assigned_by: string
          assigned_date: string
          created_at?: string | null
          department_id: string
          id?: string
          member_id: string
          reason: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          type: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          assigned_by?: string
          assigned_date?: string
          created_at?: string | null
          department_id?: string
          id?: string
          member_id?: string
          reason?: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          type?: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      department_join_requests: {
        Row: {
          action: string
          department_id: string
          id: string
          member_id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string
        }
        Insert: {
          action: string
          department_id: string
          id?: string
          member_id: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
        }
        Update: {
          action?: string
          department_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_join_requests_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_join_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      department_tasks: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          attachments: string[] | null
          checklist: Json | null
          comments: Json | null
          created_at: string | null
          department_id: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          attachments?: string[] | null
          checklist?: Json | null
          comments?: Json | null
          created_at?: string | null
          department_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          attachments?: string[] | null
          checklist?: Json | null
          comments?: Json | null
          created_at?: string | null
          department_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          branch_id: string
          created_at: string | null
          description: string | null
          head_id: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          branding_color: string | null
          branding_logo_path: string | null
          created_at: string
          default_branch_id: string | null
          head_admin_id: string | null
          id: string
          location: string | null
          name: string
          notification_prefs: Json
          overseer_id: string | null
        }
        Insert: {
          branding_color?: string | null
          branding_logo_path?: string | null
          created_at?: string
          default_branch_id?: string | null
          head_admin_id?: string | null
          id?: string
          location?: string | null
          name: string
          notification_prefs?: Json
          overseer_id?: string | null
        }
        Update: {
          branding_color?: string | null
          branding_logo_path?: string | null
          created_at?: string
          default_branch_id?: string | null
          head_admin_id?: string | null
          id?: string
          location?: string | null
          name?: string
          notification_prefs?: Json
          overseer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "districts_default_branch_id_fkey"
            columns: ["default_branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "districts_overseer_id_fkey"
            columns: ["overseer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_quotas: {
        Row: {
          branch_id: string | null
          collected_amount: number | null
          created_at: string | null
          district_id: string | null
          event_id: string
          id: string
          notes: string | null
          target_amount: number
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          collected_amount?: number | null
          created_at?: string | null
          district_id?: string | null
          event_id: string
          id?: string
          notes?: string | null
          target_amount?: number
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          collected_amount?: number | null
          created_at?: string | null
          district_id?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          target_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_quotas_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_quotas_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_quotas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          amount_paid: number | null
          cancelled_at: string | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          member_id: string | null
          metadata: Json | null
          name: string
          payment_status: string | null
          phone: string | null
          registered_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          member_id?: string | null
          metadata?: Json | null
          name: string
          payment_status?: string | null
          phone?: string | null
          registered_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          member_id?: string | null
          metadata?: Json | null
          name?: string
          payment_status?: string | null
          phone?: string | null
          registered_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          guests_count: number | null
          id: string
          member_id: string
          notes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          guests_count?: number | null
          id?: string
          member_id: string
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          guests_count?: number | null
          id?: string
          member_id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          branch_id: string | null
          capacity: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          district_id: string | null
          end_at: string | null
          end_time: string | null
          event_date: string
          event_level: Database["public"]["Enums"]["event_level_type"] | null
          id: string
          is_paid: boolean | null
          location: string | null
          metadata: Json | null
          organizer_id: string | null
          organizer_role: string | null
          owner_scope_id: string | null
          registration_fee: number | null
          requires_registration: boolean | null
          scope: Database["public"]["Enums"]["event_scope"]
          start_at: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          target_audience: string | null
          title: string
          updated_at: string | null
          visibility: Database["public"]["Enums"]["event_visibility"] | null
        }
        Insert: {
          branch_id?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          end_at?: string | null
          end_time?: string | null
          event_date: string
          event_level?: Database["public"]["Enums"]["event_level_type"] | null
          id?: string
          is_paid?: boolean | null
          location?: string | null
          metadata?: Json | null
          organizer_id?: string | null
          organizer_role?: string | null
          owner_scope_id?: string | null
          registration_fee?: number | null
          requires_registration?: boolean | null
          scope?: Database["public"]["Enums"]["event_scope"]
          start_at?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["event_visibility"] | null
        }
        Update: {
          branch_id?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          end_at?: string | null
          end_time?: string | null
          event_date?: string
          event_level?: Database["public"]["Enums"]["event_level_type"] | null
          id?: string
          is_paid?: boolean | null
          location?: string | null
          metadata?: Json | null
          organizer_id?: string | null
          organizer_role?: string | null
          owner_scope_id?: string | null
          registration_fee?: number | null
          requires_registration?: boolean | null
          scope?: Database["public"]["Enums"]["event_scope"]
          start_at?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["event_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "events_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          module_id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          module_id: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          module_id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "features_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_fund_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          attachment_path: string | null
          branch_id: string
          created_at: string
          district_id: string | null
          id: string
          purpose: string
          requested_at: string | null
          requested_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          attachment_path?: string | null
          branch_id: string
          created_at?: string
          district_id?: string | null
          id?: string
          purpose: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          attachment_path?: string | null
          branch_id?: string
          created_at?: string
          district_id?: string | null
          id?: string
          purpose?: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_fund_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_fund_requests_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_records: {
        Row: {
          amount: number
          branch_id: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          member_id: string | null
          recorded_by: string | null
          transaction_date: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          branch_id: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          member_id?: string | null
          recorded_by?: string | null
          transaction_date: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          member_id?: string | null
          recorded_by?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_remittances: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          district_id: string | null
          id: string
          offerings: number
          proof_path: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          tithes: number
          total_due: number
          updated_at: string
          week_end: string
          week_start: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          district_id?: string | null
          id?: string
          offerings?: number
          proof_path?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tithes?: number
          total_due?: number
          updated_at?: string
          week_end: string
          week_start: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          district_id?: string | null
          id?: string
          offerings?: number
          proof_path?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tithes?: number
          total_due?: number
          updated_at?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_remittances_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_remittances_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      first_timers: {
        Row: {
          area: string
          branch_id: string
          community: string
          created_at: string | null
          created_by: string | null
          email: string | null
          first_visit: string
          follow_up_notes: string | null
          follow_up_status:
            | Database["public"]["Enums"]["follow_up_status"]
            | null
          full_name: string
          id: string
          invited_by: string | null
          notes: string | null
          phone: string | null
          public_landmark: string | null
          service_date: string
          status: Database["public"]["Enums"]["first_timer_status"] | null
          street: string
          updated_at: string | null
        }
        Insert: {
          area: string
          branch_id: string
          community: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_visit: string
          follow_up_notes?: string | null
          follow_up_status?:
            | Database["public"]["Enums"]["follow_up_status"]
            | null
          full_name: string
          id?: string
          invited_by?: string | null
          notes?: string | null
          phone?: string | null
          public_landmark?: string | null
          service_date: string
          status?: Database["public"]["Enums"]["first_timer_status"] | null
          street: string
          updated_at?: string | null
        }
        Update: {
          area?: string
          branch_id?: string
          community?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_visit?: string
          follow_up_notes?: string | null
          follow_up_status?:
            | Database["public"]["Enums"]["follow_up_status"]
            | null
          full_name?: string
          id?: string
          invited_by?: string | null
          notes?: string | null
          phone?: string | null
          public_landmark?: string | null
          service_date?: string
          status?: Database["public"]["Enums"]["first_timer_status"] | null
          street?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "first_timers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      holiday_cache: {
        Row: {
          country: string
          generated_at: string | null
          holidays: Json
          year: number
        }
        Insert: {
          country?: string
          generated_at?: string | null
          holidays: Json
          year: number
        }
        Update: {
          country?: string
          generated_at?: string | null
          holidays?: Json
          year?: number
        }
        Relationships: []
      }
      holiday_overrides: {
        Row: {
          action: string
          country: string
          created_at: string | null
          holiday_date: string
          id: string
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          action: string
          country?: string
          created_at?: string | null
          holiday_date: string
          id?: string
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          action?: string
          country?: string
          created_at?: string | null
          holiday_date?: string
          id?: string
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      islamic_holidays: {
        Row: {
          country: string | null
          created_at: string | null
          holiday_date: string
          id: string
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          holiday_date: string
          id?: string
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          country?: string | null
          created_at?: string | null
          holiday_date?: string
          id?: string
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      member_training: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          instructor_id: string | null
          member_id: string
          remarks: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["training_status"] | null
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          member_id: string
          remarks?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          member_id?: string
          remarks?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          training_type?: Database["public"]["Enums"]["training_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_training_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_transfers: {
        Row: {
          created_at: string | null
          from_branch_id: string
          id: string
          member_id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string
          requested_at: string
          requested_by: string
          status: string
          to_branch_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_branch_id: string
          id?: string
          member_id: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          requested_at?: string
          requested_by: string
          status?: string
          to_branch_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_branch_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          requested_at?: string
          requested_by?: string
          status?: string
          to_branch_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_transfers_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_transfers_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_transfers_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          area: string
          assigned_department: string | null
          baptism_date: string | null
          baptism_officiator: string | null
          baptized_sub_level:
            | Database["public"]["Enums"]["baptized_sub_level"]
            | null
          branch_id: string
          community: string
          created_at: string | null
          created_by: string | null
          date_joined: string
          date_of_birth: string
          discipleship_class_1: boolean | null
          discipleship_class_2: boolean | null
          discipleship_class_3: boolean | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          last_attendance: string | null
          leader_role: Database["public"]["Enums"]["leader_role"] | null
          marital_status: Database["public"]["Enums"]["marital_status"]
          membership_level: Database["public"]["Enums"]["membership_level"]
          ministry: string | null
          number_of_children: number | null
          pastoral_notes: string | null
          phone: string
          prayer_needs: string | null
          profile_id: string | null
          profile_photo: string | null
          public_landmark: string | null
          spiritual_mentor: string | null
          spouse_name: string | null
          status: Database["public"]["Enums"]["member_status"] | null
          street: string
          updated_at: string | null
        }
        Insert: {
          area: string
          assigned_department?: string | null
          baptism_date?: string | null
          baptism_officiator?: string | null
          baptized_sub_level?:
            | Database["public"]["Enums"]["baptized_sub_level"]
            | null
          branch_id: string
          community: string
          created_at?: string | null
          created_by?: string | null
          date_joined: string
          date_of_birth: string
          discipleship_class_1?: boolean | null
          discipleship_class_2?: boolean | null
          discipleship_class_3?: boolean | null
          email?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          last_attendance?: string | null
          leader_role?: Database["public"]["Enums"]["leader_role"] | null
          marital_status: Database["public"]["Enums"]["marital_status"]
          membership_level: Database["public"]["Enums"]["membership_level"]
          ministry?: string | null
          number_of_children?: number | null
          pastoral_notes?: string | null
          phone: string
          prayer_needs?: string | null
          profile_id?: string | null
          profile_photo?: string | null
          public_landmark?: string | null
          spiritual_mentor?: string | null
          spouse_name?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          street: string
          updated_at?: string | null
        }
        Update: {
          area?: string
          assigned_department?: string | null
          baptism_date?: string | null
          baptism_officiator?: string | null
          baptized_sub_level?:
            | Database["public"]["Enums"]["baptized_sub_level"]
            | null
          branch_id?: string
          community?: string
          created_at?: string | null
          created_by?: string | null
          date_joined?: string
          date_of_birth?: string
          discipleship_class_1?: boolean | null
          discipleship_class_2?: boolean | null
          discipleship_class_3?: boolean | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          last_attendance?: string | null
          leader_role?: Database["public"]["Enums"]["leader_role"] | null
          marital_status?: Database["public"]["Enums"]["marital_status"]
          membership_level?: Database["public"]["Enums"]["membership_level"]
          ministry?: string | null
          number_of_children?: number | null
          pastoral_notes?: string | null
          phone?: string
          prayer_needs?: string | null
          profile_id?: string | null
          profile_photo?: string | null
          public_landmark?: string | null
          spiritual_mentor?: string | null
          spouse_name?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          street?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string
          created_at: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          body: string
          category: string
          created_at?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      ministries: {
        Row: {
          branch_id: string
          created_at: string | null
          description: string | null
          head_id: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ministries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      ministry_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          location: string | null
          ministry_id: string
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          location?: string | null
          ministry_id: string
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          location?: string | null
          ministry_id?: string
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ministry_events_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      ministry_members: {
        Row: {
          created_at: string | null
          id: string
          joined_date: string
          member_id: string
          ministry_id: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_date?: string
          member_id: string
          ministry_id: string
          role?: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_date?: string
          member_id?: string
          ministry_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministry_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ministry_members_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      module_role_permissions: {
        Row: {
          allowed_actions: Database["public"]["Enums"]["permission_action"][]
          branch_id: string | null
          created_at: string | null
          department_id: string | null
          id: string
          ministry_id: string | null
          module_id: string
          role: Database["public"]["Enums"]["app_role"] | null
          role_id: string | null
          scope_type: string
        }
        Insert: {
          allowed_actions: Database["public"]["Enums"]["permission_action"][]
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          ministry_id?: string | null
          module_id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          role_id?: string | null
          scope_type: string
        }
        Update: {
          allowed_actions?: Database["public"]["Enums"]["permission_action"][]
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          ministry_id?: string | null
          module_id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          role_id?: string | null
          scope_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          recipient_id: string
          sent_at: string | null
          status: string
          subject: string | null
          template_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          recipient_id: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          recipient_id?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          district_id: string | null
          first_name: string
          id: string
          is_baptized: boolean | null
          last_name: string
          phone: string | null
          profile_photo: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          district_id?: string | null
          first_name: string
          id: string
          is_baptized?: boolean | null
          last_name: string
          phone?: string | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          district_id?: string | null
          first_name?: string
          id?: string
          is_baptized?: boolean | null
          last_name?: string
          phone?: string | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          actions: Database["public"]["Enums"]["permission_action"][]
          branch_id: string | null
          coverage_type: Database["public"]["Enums"]["coverage_type"]
          created_at: string | null
          department_id: string | null
          feature_id: string | null
          id: string
          ministry_id: string | null
          module_id: string
          role_id: string
          scope_type: Database["public"]["Enums"]["scope_type_v2"]
          updated_at: string | null
        }
        Insert: {
          actions: Database["public"]["Enums"]["permission_action"][]
          branch_id?: string | null
          coverage_type: Database["public"]["Enums"]["coverage_type"]
          created_at?: string | null
          department_id?: string | null
          feature_id?: string | null
          id?: string
          ministry_id?: string | null
          module_id: string
          role_id: string
          scope_type: Database["public"]["Enums"]["scope_type_v2"]
          updated_at?: string | null
        }
        Update: {
          actions?: Database["public"]["Enums"]["permission_action"][]
          branch_id?: string | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"]
          created_at?: string | null
          department_id?: string | null
          feature_id?: string | null
          id?: string
          ministry_id?: string | null
          module_id?: string
          role_id?: string
          scope_type?: Database["public"]["Enums"]["scope_type_v2"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          role_type: Database["public"]["Enums"]["role_type"]
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          role_type?: Database["public"]["Enums"]["role_type"]
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          role_type?: Database["public"]["Enums"]["role_type"]
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stream_chats: {
        Row: {
          created_at: string
          id: string
          message: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_chats_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_views: {
        Row: {
          id: string
          stream_id: string
          user_id: string | null
          viewed_at: string
          watch_duration: number | null
        }
        Insert: {
          id?: string
          stream_id: string
          user_id?: string | null
          viewed_at?: string
          watch_duration?: number | null
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string | null
          viewed_at?: string
          watch_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_views_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          branch_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          embed_url: string | null
          end_time: string | null
          id: string
          is_featured: boolean | null
          platform: Database["public"]["Enums"]["stream_platform"]
          privacy: Database["public"]["Enums"]["stream_privacy"]
          rtmp_server: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["stream_status"]
          storage_path: string | null
          stream_key: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          branch_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          embed_url?: string | null
          end_time?: string | null
          id?: string
          is_featured?: boolean | null
          platform?: Database["public"]["Enums"]["stream_platform"]
          privacy?: Database["public"]["Enums"]["stream_privacy"]
          rtmp_server?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["stream_status"]
          storage_path?: string | null
          stream_key?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          branch_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          embed_url?: string | null
          end_time?: string | null
          id?: string
          is_featured?: boolean | null
          platform?: Database["public"]["Enums"]["stream_platform"]
          privacy?: Database["public"]["Enums"]["stream_privacy"]
          rtmp_server?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["stream_status"]
          storage_path?: string | null
          stream_key?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          department_id: string | null
          district_id: string | null
          id: string
          ministry_id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          role_id: string | null
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          district_id?: string | null
          id?: string
          ministry_id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          role_id?: string | null
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          district_id?: string | null
          id?: string
          ministry_id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      bible_attendance_summary: {
        Row: {
          absent: number | null
          attendance_percentage: number | null
          attended: number | null
          cohort_id: string | null
          excused: number | null
          late: number | null
          member_id: string | null
          student_id: string | null
          total_lessons: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_students_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_cohort_stats: {
        Row: {
          active_students: number | null
          branch_name: string | null
          cohort_id: string | null
          cohort_name: string | null
          completed_students: number | null
          end_date: string | null
          enrolled_students: number | null
          max_students: number | null
          program_name: string | null
          start_date: string | null
          status: string | null
        }
        Relationships: []
      }
      bible_exam_results_summary: {
        Row: {
          exam_id: string | null
          exam_title: string | null
          is_final: boolean | null
          member_id: string | null
          pass_mark: number | null
          percentage: number | null
          score: number | null
          status: string | null
          student_id: string | null
          total_marks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_students_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_student_progress: {
        Row: {
          attendance_percentage: number | null
          attended: number | null
          cohort_name: string | null
          current_program: string | null
          end_date: string | null
          exams_passed: number | null
          level_order: number | null
          member_id: string | null
          member_name: string | null
          start_date: string | null
          status: string | null
          student_id: string | null
          total_exams: number | null
          total_lessons: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bible_students_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _enum_role_to_slug: {
        Args: { _r: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      approve_member_transfer: {
        Args: { approver_id: string; transfer_id: string }
        Returns: undefined
      }
      can_baptize: { Args: { _user_id: string }; Returns: boolean }
      check_promotion_eligibility: {
        Args: { p_min_attendance?: number; p_student_id: string }
        Returns: Json
      }
      create_user_with_profile: {
        Args: {
          branch_slug: string
          email: string
          first_name: string
          is_baptized: boolean
          last_name: string
          password: string
          role: string
        }
        Returns: string
      }
      get_student_attendance_percentage: {
        Args: { student_id: string }
        Returns: {
          percentage: number
        }[]
      }
      has_branch_access: { Args: { p_branch_id: string }; Returns: boolean }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              role: Database["public"]["Enums"]["app_role"]
              user_id: string
            }
            Returns: boolean
          }
        | { Args: { role: string; user_id: string }; Returns: boolean }
      is_district_admin_for_branch: {
        Args: { p_branch_id: string }
        Returns: boolean
      }
      is_district_admin_for_district: {
        Args: { p_district_id: string }
        Returns: boolean
      }
      is_user_baptized: { Args: never; Returns: boolean }
      list_transfer_branches: {
        Args: never
        Returns: {
          id: string
          name: string
        }[]
      }
      reject_member_transfer: {
        Args: {
          rejection_notes?: string
          rejector_id: string
          transfer_id: string
        }
        Returns: undefined
      }
      setup_superadmin: { Args: { admin_email: string }; Returns: string }
      submit_transfer_request: {
        Args: { notes: string; target_branch_id: string }
        Returns: string
      }
      upgrade_member_to_baptized: {
        Args: { p_email: string; p_member_id: string; p_password?: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "pastor"
        | "leader"
        | "worker"
        | "member"
        | "district_admin"
        | "district_overseer"
        | "general_overseer"
      assignment_status: "pending" | "approved" | "rejected"
      assignment_type: "assignment" | "transfer" | "suspension"
      baptized_sub_level: "leader" | "worker" | "disciple"
      convert_status:
        | "pending_branch_review"
        | "pending_district_review"
        | "approved_for_baptism"
        | "baptized"
      coverage_type: "global" | "department" | "ministry" | "committee" | "task"
      event_level_type: "NATIONAL" | "DISTRICT" | "BRANCH"
      event_scope: "local" | "district" | "national"
      event_status:
        | "draft"
        | "published"
        | "cancelled"
        | "upcoming"
        | "active"
        | "ended"
      event_visibility: "public" | "private"
      first_timer_status: "new" | "contacted" | "followed_up" | "converted"
      follow_up_status: "pending" | "called" | "visited" | "completed"
      gender: "male" | "female"
      job_status: "pending" | "processing" | "done" | "error"
      leader_role:
        | "pastor"
        | "assistant_pastor"
        | "department_head"
        | "ministry_head"
      marital_status: "single" | "married" | "widowed" | "divorced"
      member_status: "active" | "inactive" | "suspended" | "transferred"
      membership_level: "baptized" | "convert" | "visitor"
      permission_action: "view" | "create" | "update" | "delete" | "manage"
      priority_level: "low" | "medium" | "high"
      provision_type: "auto_baptized" | "admin_initiated"
      role_type: "account" | "member" | "leader" | "admin" | "pastor" | "worker"
      scope_type_v2: "global" | "branch"
      stream_platform: "youtube" | "facebook" | "vimeo" | "custom" | "supabase"
      stream_privacy: "public" | "members_only" | "private"
      stream_status: "scheduled" | "live" | "ended" | "archived"
      task_status: "backlog" | "in_progress" | "done"
      training_status: "not_started" | "in_progress" | "completed"
      training_type:
        | "discipleship_1"
        | "discipleship_2"
        | "discipleship_3"
        | "leadership"
        | "pastoral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "pastor",
        "leader",
        "worker",
        "member",
        "district_admin",
        "district_overseer",
        "general_overseer",
      ],
      assignment_status: ["pending", "approved", "rejected"],
      assignment_type: ["assignment", "transfer", "suspension"],
      baptized_sub_level: ["leader", "worker", "disciple"],
      convert_status: [
        "pending_branch_review",
        "pending_district_review",
        "approved_for_baptism",
        "baptized",
      ],
      coverage_type: ["global", "department", "ministry", "committee", "task"],
      event_level_type: ["NATIONAL", "DISTRICT", "BRANCH"],
      event_scope: ["local", "district", "national"],
      event_status: [
        "draft",
        "published",
        "cancelled",
        "upcoming",
        "active",
        "ended",
      ],
      event_visibility: ["public", "private"],
      first_timer_status: ["new", "contacted", "followed_up", "converted"],
      follow_up_status: ["pending", "called", "visited", "completed"],
      gender: ["male", "female"],
      job_status: ["pending", "processing", "done", "error"],
      leader_role: [
        "pastor",
        "assistant_pastor",
        "department_head",
        "ministry_head",
      ],
      marital_status: ["single", "married", "widowed", "divorced"],
      member_status: ["active", "inactive", "suspended", "transferred"],
      membership_level: ["baptized", "convert", "visitor"],
      permission_action: ["view", "create", "update", "delete", "manage"],
      priority_level: ["low", "medium", "high"],
      provision_type: ["auto_baptized", "admin_initiated"],
      role_type: ["account", "member", "leader", "admin", "pastor", "worker"],
      scope_type_v2: ["global", "branch"],
      stream_platform: ["youtube", "facebook", "vimeo", "custom", "supabase"],
      stream_privacy: ["public", "members_only", "private"],
      stream_status: ["scheduled", "live", "ended", "archived"],
      task_status: ["backlog", "in_progress", "done"],
      training_status: ["not_started", "in_progress", "completed"],
      training_type: [
        "discipleship_1",
        "discipleship_2",
        "discipleship_3",
        "leadership",
        "pastoral",
      ],
    },
  },
} as const
