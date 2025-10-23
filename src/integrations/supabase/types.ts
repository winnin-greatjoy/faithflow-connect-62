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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
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
      departments: {
        Row: {
          branch_id: string
          created_at: string | null
          description: string | null
          head_id: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name?: string
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
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
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
      leader_role:
        | "pastor"
        | "assistant_pastor"
        | "department_head"
        | "ministry_head"
      marital_status: "single" | "married" | "widowed" | "divorced"
      member_status: "active" | "inactive" | "suspended" | "transferred"
      membership_level: "baptized" | "convert" | "visitor"
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
      leader_role: [
        "pastor",
        "assistant_pastor",
        "department_head",
        "ministry_head",
      ],
      marital_status: ["single", "married", "widowed", "divorced"],
      member_status: ["active", "inactive", "suspended", "transferred"],
      membership_level: ["baptized", "convert", "visitor"],
    },
  },
} as const
