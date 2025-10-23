import { Database } from '@/integrations/supabase/types';

// Base API Response Types
export interface ApiResponse<T = any> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export type ApiResult<T = any> = ApiResponse<T> | ApiError;

// Base Database Types
export type DepartmentRow = Database['public']['Tables']['departments']['Row'];
export type DepartmentAssignmentRow = Database['public']['Tables']['department_assignments']['Row'];
export type MemberRow = Database['public']['Tables']['members']['Row'];
export type EventRow = Database['public']['Tables']['events']['Row'];
export type FinanceRecordRow = Database['public']['Tables']['finance_records']['Row'];

// Department Types
export interface Department extends DepartmentRow {
  head?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  };
  memberCount?: number;
  activeMemberCount?: number;
  recentActivities?: number;
}

export interface DepartmentMember extends DepartmentAssignmentRow {
  member: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    date_joined: string;
    status: Database['public']['Enums']['member_status'];
  };
}

export interface DepartmentStats {
  totalMembers: number;
  activeMembers: number;
  upcomingEvents: number;
  completedActivities: number;
  monthlyGrowth: number;
  budgetUtilization?: number;
}

// Ministry Types
export interface Ministry {
  id: string;
  name: string;
  description: string;
  leader: string;
  members: number;
  activities: number;
  status: 'active' | 'inactive';
  category: 'men' | 'women' | 'youth' | 'children' | 'general';
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface MinistryMember {
  id: string;
  member_id: string;
  ministry_id: string;
  role: 'leader' | 'coordinator' | 'member';
  joined_date: string;
  status: 'active' | 'inactive';
  member: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    date_joined: string;
  };
}

export interface MinistryEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  ministry_id: string;
  created_by: string;
  branch_id: string;
  attendance_count?: number;
  status: 'planned' | 'completed' | 'cancelled';
}

// Department-specific Types

// Choir Department
export interface ChoirMember extends DepartmentMember {
  voice_part: 'soprano' | 'alto' | 'tenor' | 'bass';
  years_experience: number;
  attendance_rate: number;
  performance_history?: ChoirPerformance[];
}

export interface ChoirPerformance {
  id: string;
  title: string;
  date: string;
  type: 'service' | 'concert' | 'rehearsal' | 'special_event';
  songs: string[];
  attendance: number;
  notes?: string;
}

export interface ChoirRepertoire {
  id: string;
  title: string;
  composer?: string;
  arranger?: string;
  category: 'hymn' | 'gospel' | 'contemporary' | 'classical' | 'traditional';
  difficulty: 'easy' | 'medium' | 'hard';
  key_signature?: string;
  performance_count: number;
  last_performed?: string;
}

// Ushering Department
export interface UsherMember extends DepartmentMember {
  station: string;
  experience_years: number;
  availability: string[];
  certifications?: string[];
  shift_history?: UsherShift[];
}

export interface UsherShift {
  id: string;
  service_date: string;
  service_time: string;
  station: string;
  attendance_count: number;
  notes?: string;
  assigned_by: string;
}

export interface UsherStation {
  id: string;
  name: string;
  description: string;
  capacity: number;
  requirements: string[];
  equipment?: string[];
  is_active: boolean;
}

// Prayer Team Department
export interface PrayerTeamMember extends DepartmentMember {
  specialization: string;
  prayer_hours_weekly: number;
  requests_handled: number;
  certifications?: string[];
  availability: string[];
}

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  requester_name?: string;
  requester_contact?: string;
  category: 'health' | 'family' | 'career' | 'finance' | 'ministry' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'answered' | 'closed';
  assigned_to?: string;
  date_received: string;
  date_updated: string;
  follow_up_notes?: string[];
  answered_date?: string;
}

export interface PrayerSession {
  id: string;
  title: string;
  description?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  type: 'group' | 'intercession' | 'healing' | 'special';
  attendees: number;
  leader: string;
  notes?: string;
  requests_covered?: string[];
}

// Evangelism Department
export interface EvangelismMember extends DepartmentMember {
  outreach_area: string;
  conversions: number;
  events_led: number;
  follow_ups_pending: number;
  training_completed?: string[];
}

export interface OutreachEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location: string;
  type: 'street' | 'door_to_door' | 'community' | 'campus' | 'special';
  target_audience: string;
  expected_attendees: number;
  actual_attendees?: number;
  conversions: number;
  led_by: string;
  team_members: string[];
  materials_used?: string[];
  follow_up_required: boolean;
  notes?: string;
}

export interface FollowUpContact {
  id: string;
  contact_name: string;
  contact_info: string;
  source_event?: string;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested';
  assigned_to: string;
  last_contact_date: string;
  next_contact_date?: string;
  notes: string[];
  conversion_date?: string;
  church_integration?: string;
}

// Finance Department
export interface FinanceMember extends DepartmentMember {
  specialization: 'budgeting' | 'reporting' | 'bookkeeping' | 'audit' | 'compliance';
  transactions_processed: number;
  accuracy_rate: number;
  certifications?: string[];
  access_level: 'read' | 'write' | 'admin';
}

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  transaction_date: string;
  recorded_by: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  receipt_url?: string;
  notes?: string;
  member_id?: string;
  event_id?: string;
  branch_id: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: 'under_budget' | 'on_budget' | 'over_budget';
  department_id?: string;
  ministry_id?: string;
  branch_id: string;
}

// Technical Department
export interface TechnicalMember extends DepartmentMember {
  specialization: 'av_systems' | 'lighting' | 'streaming' | 'network' | 'maintenance' | 'support';
  certifications: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tickets_resolved: number;
  uptime_hours: number;
  availability: string[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  category: 'audio' | 'video' | 'lighting' | 'streaming' | 'network' | 'other';
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  status: 'operational' | 'maintenance' | 'repair' | 'offline' | 'retired';
  location: string;
  assigned_to?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  notes?: string;
  specifications?: Record<string, any>;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'hardware' | 'software' | 'network' | 'av' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  requester: string;
  assigned_to?: string;
  created_date: string;
  updated_date: string;
  resolved_date?: string;
  resolution_notes?: string;
  equipment_id?: string;
  event_id?: string;
  estimated_time?: number;
  actual_time?: number;
}

export interface MaintenanceSchedule {
  id: string;
  title: string;
  description?: string;
  equipment_id: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  type: 'preventive' | 'corrective' | 'inspection' | 'upgrade';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string;
  estimated_duration: number;
  actual_duration?: number;
  notes?: string;
  next_maintenance?: string;
  recurring?: boolean;
  recurring_interval?: number; // days
}

// Ministry-specific Types

// Men's Ministry
export interface MensMinistryMember extends MinistryMember {
  leadership_role?: 'elder' | 'deacon' | 'mentor';
  mentoring_pairs?: number;
  discipleship_groups?: number;
  retreat_attendance?: number;
}

export interface MensEvent extends MinistryEvent {
  speaker?: string;
  topic?: string;
  format: 'breakfast' | 'dinner' | 'retreat' | 'workshop' | 'fellowship';
  target_age_group?: string;
  registration_required: boolean;
  max_attendees?: number;
}

// Women's Ministry
export interface WomensMinistryMember extends MinistryMember {
  ministry_focus?: 'prayer' | 'fellowship' | 'service' | 'discipleship' | 'mentoring';
  small_groups?: string[];
  retreat_attendance?: number;
  service_projects?: number;
}

export interface WomensEvent extends MinistryEvent {
  speaker?: string;
  topic?: string;
  format: 'conference' | 'retreat' | 'workshop' | 'fellowship' | 'service';
  childcare_provided: boolean;
  age_restrictions?: string;
  registration_fee?: number;
}

// Youth Ministry
export interface YouthMinistryMember extends MinistryMember {
  age: number;
  grade_level?: number;
  school?: string;
  parent_contact?: string;
  small_group?: string;
  camp_attendance?: number;
  baptism_status?: boolean;
}

export interface YouthEvent extends MinistryEvent {
  age_range: string;
  format: 'meeting' | 'camp' | 'retreat' | 'mission_trip' | 'fellowship';
  permission_slip_required: boolean;
  transportation_provided: boolean;
  cost?: number;
  chaperone_ratio: number;
}

// Children's Ministry
export interface ChildrensMinistryMember extends MinistryMember {
  age: number;
  parent_id: string;
  parent_name: string;
  allergies?: string[];
  emergency_contact: string;
  classroom?: string;
  check_in_time?: string;
  check_out_time?: string;
}

export interface ChildrensEvent extends MinistryEvent {
  age_range: string;
  format: 'sunday_school' | 'vacation_bible_school' | 'camp' | 'party';
  parent_permission_required: boolean;
  snack_provided: boolean;
  teacher_ratio: number;
  curriculum?: string;
}

// API Request/Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  branchId?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Generic CRUD operations
export interface CreateRequest<T> {
  data: Omit<T, 'id' | 'created_at' | 'updated_at'>;
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;
}

export interface DeleteRequest {
  id: string;
}

export interface ListRequest {
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}
