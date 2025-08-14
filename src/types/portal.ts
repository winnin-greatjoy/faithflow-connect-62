
export interface MemberPortal {
  memberId: number;
  fullName: string;
  membershipLevel: 'baptized' | 'convert' | 'visitor';
  baptizedSubLevel?: 'leader' | 'worker';
  leaderRole?: string;
  ministry: string;
  department?: string;
  profilePhotoUrl?: string;
  lastLogin?: string;
}

export interface PortalContribution {
  id: number;
  memberId: number;
  amount: number;
  type: 'tithe' | 'offering' | 'pledge' | 'ministry' | 'project';
  targetId?: number; // ministry or project ID
  method: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
  receiptNumber: string;
  date: string;
  notes?: string;
}

export interface PortalPledge {
  id: number;
  memberId: number;
  campaignName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'active' | 'completed' | 'overdue';
  installments: {
    id: number;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: 'pending' | 'paid' | 'overdue';
  }[];
}

export interface PortalEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  ministry?: string;
  department?: string;
  registrationRequired: boolean;
  registrationDeadline?: string;
  isRegistered?: boolean;
  checkInCode?: string;
}

export interface PortalTask {
  id: number;
  title: string;
  description: string;
  assignedBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  attachments: string[];
  committee?: string;
  department?: string;
}

export interface PortalNotification {
  id: number;
  memberId: number;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'urgent' | 'celebration';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export interface PrayerRequest {
  id: number;
  memberId: number;
  title: string;
  description: string;
  privacy: 'private' | 'leaders_only' | 'public';
  status: 'active' | 'answered' | 'archived';
  followUpRequired: boolean;
  assignedTo?: number;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
}
