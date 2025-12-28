export type MembershipLevel = 'baptized' | 'convert' | 'visitor';
export type BaptizedSubLevel = 'leader' | 'worker' | 'disciple';
export type LeaderRole = 'pastor' | 'assistant_pastor' | 'department_head' | 'ministry_head';
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';
export type Gender = 'male' | 'female';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'transferred';
export type FollowUpStatus = 'pending' | 'called' | 'visited' | 'completed';

export interface Child {
  id?: string;
  name: string;
  age?: number;
  dateOfBirth?: string;
  gender?: Gender;
  notes?: string;
}

export interface Member {
  id: string; // UUID from database
  // Personal Info
  fullName: string;
  profilePhoto?: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  spouseName?: string;
  numberOfChildren: number;
  children: Child[];

  // Contact Info
  email: string;
  phone: string;
  community: string;
  area: string;
  street: string;
  publicLandmark: string;

  // Church Info
  branchId: string; // UUID from database
  dateJoined: string;
  membershipLevel: MembershipLevel;
  baptizedSubLevel?: BaptizedSubLevel;
  leaderRole?: LeaderRole;
  baptismDate?: string;
  joinDate: string;
  lastVisit: string;
  progress: number;
  baptismOfficiator?: string;
  spiritualMentor?: string;
  discipleshipClass1: boolean;
  discipleshipClass2: boolean;
  discipleshipClass3: boolean;
  assignedDepartment?: string;
  status: MemberStatus;

  // Auto-generated ministry based on age/gender
  ministry: string;

  // Notes
  prayerNeeds: string;
  pastoralNotes: string;

  // Metadata
  lastAttendance: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberFormProps {
  member: Member | null;
  onSave: (member: Member) => void;
  onCancel: () => void;
}

export interface FirstTimerFormProps {
  firstTimer: FirstTimer | null;
  onSave: (firstTimer: FirstTimer) => void;
  onCancel: () => void;
}

export interface FirstTimer {
  id: string; // UUID from database
  fullName: string;
  community: string;
  area: string;
  street: string;
  publicLandmark: string;
  phone?: string;
  email?: string;
  serviceDate: string;
  invitedBy?: string;
  followUpStatus: FollowUpStatus;
  branchId: string; // UUID from database
  firstVisit: string;
  visitDate: string;
  status: 'new' | 'contacted' | 'followed_up' | 'converted';
  followUpNotes?: string;
  notes: string;
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  headAdminId?: string;
  createdAt: string;
}

export interface Branch {
  id: string | number;
  name: string;
  address: string;
  phone: string;
  pastorName: string;
  isMain: boolean;
  districtId?: string;
  districtName?: string;
  isDistrictHq?: boolean;
}

export interface DepartmentAssignment {
  id: string;
  memberId: string;
  departmentName: string;
  assignedBy: string;
  assignedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'assignment' | 'transfer' | 'suspension';
  reason: string;
}
