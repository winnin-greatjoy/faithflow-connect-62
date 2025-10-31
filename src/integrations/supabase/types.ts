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
      church_branches: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_main: boolean | null
          name: string
          pastor_name: string | null
          phone: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_main?: boolean | null
          name: string
          pastor_name?: string | null
          phone?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_main?: boolean | null
          name?: string
          pastor_name?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
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
          branch_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          location: string | null
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          location?: string | null
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          location?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "church_branches"
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
        ]
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
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string | null
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
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      has_branch_access: { Args: { p_branch_id: string }; Returns: boolean }
      has_role:
        | { Args: { role: string; user_id: string }; Returns: boolean }
        | {
            Args: {
              role: Database["public"]["Enums"]["app_role"]
              user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_user_baptized: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "pastor"
        | "leader"
        | "worker"
        | "member"
      assignment_status: "pending" | "approved" | "rejected"
      assignment_type: "assignment" | "transfer" | "suspension"
      baptized_sub_level: "leader" | "worker" | "disciple"
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
      stream_platform: "youtube" | "facebook" | "vimeo" | "custom" | "supabase"
      stream_privacy: "public" | "members_only" | "private"
      stream_status: "scheduled" | "live" | "ended" | "archived"
      task_status: "backlog" | "in_progress" | "done"
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
      ],
      assignment_status: ["pending", "approved", "rejected"],
      assignment_type: ["assignment", "transfer", "suspension"],
      baptized_sub_level: ["leader", "worker", "disciple"],
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
      stream_platform: ["youtube", "facebook", "vimeo", "custom", "supabase"],
      stream_privacy: ["public", "members_only", "private"],
      stream_status: ["scheduled", "live", "ended", "archived"],
      task_status: ["backlog", "in_progress", "done"],
    },
  },
} as const
