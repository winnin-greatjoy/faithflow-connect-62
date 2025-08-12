
export type CommitteeType = 'Finance' | 'Education' | 'Welfare' | 'Audit' | 'Sincerity' | 'Public Relations' | 'Treasury';

export type MinistryRole = 'head' | 'vice_head' | 'committee_head' | 'committee_member' | 'member';

export type ContributionType = 'monthly_dues' | 'pledge' | 'special_offering' | 'event_contribution';

export type PublicationStatus = 'draft' | 'published' | 'archived';

export type PublicationScope = 'ministry_only' | 'church_wide';

export interface MinistryMember {
  id: number;
  memberId: number; // References main member ID
  fullName: string;
  email: string;
  phone: string;
  role: MinistryRole;
  committeeAssignments: string[];
  dateJoined: string;
  isActive: boolean;
  leadershipPosition?: string;
}

export interface Committee {
  id: number;
  name: string;
  description: string;
  headId?: number; // MinistryMember ID
  members: number[]; // Array of MinistryMember IDs
  meetingSchedule?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MinistryContribution {
  id: number;
  memberId: number;
  type: ContributionType;
  amount: number;
  date: string;
  description: string;
  pledgeId?: number; // If this is a pledge payment
  eventId?: number; // If this is for a specific event
  createdAt: string;
}

export interface Pledge {
  id: number;
  memberId: number;
  campaignName: string;
  totalAmount: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'overdue';
  notes?: string;
  createdAt: string;
}

export interface MinistryPublication {
  id: number;
  title: string;
  content: string;
  authorId: number; // MinistryMember ID
  scope: PublicationScope;
  status: PublicationStatus;
  publishDate?: string;
  imageUrl?: string;
  attachments?: string[];
  tags: string[];
  approvedBy?: number; // For church-wide publications
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MinistryEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  organizerId: number; // MinistryMember ID
  attendees: number[]; // Array of MinistryMember IDs
  budget?: number;
  expenses?: number;
  isPublic: boolean; // Show on church calendar
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface MinistryFinancialSummary {
  totalContributions: number;
  monthlyDues: number;
  pledgePayments: number;
  specialOfferings: number;
  totalExpenses: number;
  netBalance: number;
  period: string; // e.g., "2024-01" for January 2024
}
