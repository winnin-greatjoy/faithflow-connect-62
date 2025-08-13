
export interface CommitteeTask {
  id: number;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done';
  assigneeId: number;
  assigneeName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  attachments: string[];
  checklist: { id: number; text: string; completed: boolean }[];
  comments: { id: number; authorName: string; text: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CommitteeMeeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  agenda: { id: number; item: string; duration: number; presenter: string }[];
  attendees: { memberId: number; name: string; status: 'present' | 'absent' | 'late' }[];
  minutes: string;
  decisions: { id: number; decision: string; responsible: string; deadline?: string }[];
  followUpTasks: number[]; // task IDs
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface CommitteeDocument {
  id: number;
  title: string;
  type: 'policy' | 'template' | 'report' | 'other';
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  tags: string[];
  accessLevel: 'public' | 'committee' | 'leadership';
}

export interface CommitteeExpense {
  id: number;
  description: string;
  amount: number;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  category: string;
  receiptUrl?: string;
  notes: string;
}

export interface CommitteePublication {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  audience: 'ministry_only' | 'church_wide';
  publishDate?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommitteeWorkspace {
  id: number;
  name: string;
  description: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    upcomingMeetings: number;
    monthlyBudget: number;
    spent: number;
    publications: number;
  };
}
