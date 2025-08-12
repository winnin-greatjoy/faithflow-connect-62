
export type MembershipLevel = 'baptized' | 'convert' | 'visitor';
export type BaptizedSubLevel = 'leader' | 'worker';
export type LeaderRole = 'pastor' | 'assistant_pastor' | 'department_head' | 'ministry_head';
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';
export type Gender = 'male' | 'female';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'transferred';
export type FollowUpStatus = 'pending' | 'called' | 'visited' | 'completed';

export interface Child {
  name: string;
  age: number;
}

export interface Member {
  id: number;
  // Personal Info
  fullName: string;
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
  branchId: number;
  dateJoined: string;
  membershipLevel: MembershipLevel;
  baptizedSubLevel?: BaptizedSubLevel;
  leaderRole?: LeaderRole;
  baptismDate?: string;
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

export interface FirstTimer {
  id: number;
  fullName: string;
  community: string;
  area: string;
  street: string;
  publicLandmark: string;
  phone: string;
  serviceDate: string;
  invitedBy?: string;
  followUpStatus: FollowUpStatus;
  branchId: number;
  notes: string;
  createdAt: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  pastorName: string;
  isMain: boolean;
}

export interface DepartmentAssignment {
  id: number;
  memberId: number;
  departmentName: string;
  assignedBy: number;
  assignedDate: string;
  approvedBy?: number;
  approvedDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'assignment' | 'transfer' | 'suspension';
  reason: string;
}
