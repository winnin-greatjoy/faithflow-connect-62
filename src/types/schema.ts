import { Database } from "@/integrations/supabase/types";

export type ConvertStatus =
    | 'pending_branch_review'
    | 'pending_district_review'
    | 'approved_for_baptism'
    | 'baptized';

export type TrainingType =
    | 'foundation_class'
    | 'discipleship_1'
    | 'discipleship_2'
    | 'discipleship_3'
    | 'leadership'
    | 'pastoral';

export type TrainingStatus =
    | 'not_started'
    | 'in_progress'
    | 'completed';

export interface ConvertProcess {
    id: string;
    member_id: string;
    status: ConvertStatus;
    branch_approved_by?: string | null;
    branch_approval_date?: string | null;
    district_approved_by?: string | null;
    district_approval_date?: string | null;
    national_approved_by?: string | null;
    national_approval_date?: string | null;
    baptism_date?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface MemberTraining {
    id: string;
    member_id: string;
    training_type: TrainingType;
    status: TrainingStatus;
    started_at?: string | null;
    completed_at?: string | null;
    instructor_id?: string | null;
    remarks?: string | null;
    created_at: string;
    updated_at: string;
}

// Extend existing Member type if needed
type MemberRow = Database['public']['Tables']['members']['Row'];

export interface MemberWithWorkflow extends MemberRow {
    convert_process?: ConvertProcess[];
    member_training?: MemberTraining[];
}
