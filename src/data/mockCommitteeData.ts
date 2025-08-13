
import { CommitteeTask, CommitteeMeeting, CommitteeDocument, CommitteeExpense, CommitteePublication, CommitteeWorkspace } from '@/types/committee';

export const mockCommitteeTasks: CommitteeTask[] = [
  {
    id: 1,
    title: 'Prepare Monthly Financial Report',
    description: 'Compile all contributions and expenses for January 2024',
    status: 'in_progress',
    assigneeId: 3,
    assigneeName: 'David Clark',
    dueDate: '2024-01-31',
    priority: 'high',
    tags: ['finance', 'monthly', 'report'],
    attachments: ['january_receipts.pdf'],
    checklist: [
      { id: 1, text: 'Gather all receipts', completed: true },
      { id: 2, text: 'Reconcile bank statements', completed: true },
      { id: 3, text: 'Create summary report', completed: false },
      { id: 4, text: 'Get approval from committee head', completed: false }
    ],
    comments: [
      { id: 1, authorName: 'David Clark', text: 'Working on the reconciliation', timestamp: '2024-01-25T10:30:00Z' }
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25'
  },
  {
    id: 2,
    title: 'Organize Men\'s Retreat Registration',
    description: 'Set up registration system and coordinate logistics',
    status: 'backlog',
    assigneeId: 2,
    assigneeName: 'Michael Brown',
    dueDate: '2024-02-01',
    priority: 'medium',
    tags: ['event', 'registration'],
    attachments: [],
    checklist: [
      { id: 1, text: 'Create registration form', completed: false },
      { id: 2, text: 'Set up payment processing', completed: false },
      { id: 3, text: 'Coordinate with venue', completed: false }
    ],
    comments: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 3,
    title: 'Review Welfare Support Cases',
    description: 'Weekly review of active welfare support cases and follow-ups',
    status: 'done',
    assigneeId: 1,
    assigneeName: 'Pastor John Williams',
    dueDate: '2024-01-22',
    priority: 'high',
    tags: ['welfare', 'review'],
    attachments: ['case_summary.pdf'],
    checklist: [
      { id: 1, text: 'Review active cases', completed: true },
      { id: 2, text: 'Schedule follow-up visits', completed: true },
      { id: 3, text: 'Update case notes', completed: true }
    ],
    comments: [
      { id: 1, authorName: 'Pastor John Williams', text: 'All cases reviewed. 3 require follow-up visits this week.', timestamp: '2024-01-22T14:15:00Z' }
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-22'
  }
];

export const mockCommitteeMeetings: CommitteeMeeting[] = [
  {
    id: 1,
    title: 'Finance Committee Monthly Meeting',
    date: '2024-02-03',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Church Conference Room',
    agenda: [
      { id: 1, item: 'Review January Financial Report', duration: 20, presenter: 'David Clark' },
      { id: 2, item: 'Discuss Building Fund Progress', duration: 15, presenter: 'Pastor John Williams' },
      { id: 3, item: 'Budget Planning for Q1 Events', duration: 30, presenter: 'Michael Brown' },
      { id: 4, item: 'New Business', duration: 25, presenter: 'All' }
    ],
    attendees: [
      { memberId: 1, name: 'Pastor John Williams', status: 'present' },
      { memberId: 3, name: 'David Clark', status: 'present' },
      { memberId: 5, name: 'Robert Wilson', status: 'present' }
    ],
    minutes: '',
    decisions: [],
    followUpTasks: [],
    status: 'scheduled'
  },
  {
    id: 2,
    title: 'Education Committee Planning Session',
    date: '2024-01-21',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Church Library',
    agenda: [
      { id: 1, item: 'Review Student Performance Reports', duration: 30, presenter: 'James Thompson' },
      { id: 2, item: 'Determine Support Packages', duration: 45, presenter: 'All' },
      { id: 3, item: 'Budget Allocation', duration: 15, presenter: 'James Thompson' }
    ],
    attendees: [
      { memberId: 4, name: 'James Thompson', status: 'present' },
      { memberId: 1, name: 'Pastor John Williams', status: 'present' }
    ],
    minutes: 'Reviewed 12 student reports. Identified 3 top performers for support packages. Allocated £500 budget for educational materials.',
    decisions: [
      { id: 1, decision: 'Award £200 to Sarah Mensah for excellent GCSE results', responsible: 'James Thompson', deadline: '2024-01-30' },
      { id: 2, decision: 'Purchase study materials for identified students', responsible: 'James Thompson', deadline: '2024-02-15' }
    ],
    followUpTasks: [1, 2],
    status: 'completed'
  }
];

export const mockCommitteeDocuments: CommitteeDocument[] = [
  {
    id: 1,
    title: 'Finance Committee Procedures Manual',
    type: 'policy',
    fileUrl: '/docs/finance_procedures.pdf',
    uploadedBy: 'Pastor John Williams',
    uploadedAt: '2024-01-10',
    version: 2,
    tags: ['finance', 'procedures', 'manual'],
    accessLevel: 'committee'
  },
  {
    id: 2,
    title: 'Monthly Report Template',
    type: 'template',
    fileUrl: '/docs/monthly_report_template.docx',
    uploadedBy: 'David Clark',
    uploadedAt: '2024-01-15',
    version: 1,
    tags: ['template', 'report'],
    accessLevel: 'committee'
  },
  {
    id: 3,
    title: 'Welfare Support Guidelines',
    type: 'policy',
    fileUrl: '/docs/welfare_guidelines.pdf',
    uploadedBy: 'Pastor John Williams',
    uploadedAt: '2024-01-05',
    version: 1,
    tags: ['welfare', 'guidelines', 'policy'],
    accessLevel: 'leadership'
  }
];

export const mockCommitteeExpenses: CommitteeExpense[] = [
  {
    id: 1,
    description: 'Printing and stationery for meeting materials',
    amount: 45.50,
    requestedBy: 'David Clark',
    requestedAt: '2024-01-20',
    approvedBy: 'Pastor John Williams',
    approvedAt: '2024-01-21',
    status: 'approved',
    category: 'Office Supplies',
    receiptUrl: '/receipts/receipt_001.jpg',
    notes: 'Regular monthly printing expenses'
  },
  {
    id: 2,
    description: 'Refreshments for committee meetings',
    amount: 25.00,
    requestedBy: 'Michael Brown',
    requestedAt: '2024-01-22',
    status: 'pending',
    category: 'Hospitality',
    notes: 'Tea, coffee, and biscuits for February meetings'
  },
  {
    id: 3,
    description: 'Educational materials for students',
    amount: 150.00,
    requestedBy: 'James Thompson',
    requestedAt: '2024-01-25',
    status: 'pending',
    category: 'Education',
    notes: 'Books and supplies for top-performing students'
  }
];

export const mockCommitteePublications: CommitteePublication[] = [
  {
    id: 1,
    title: 'February 2024 Finance Update',
    content: 'We are pleased to announce that the Men\'s Ministry has successfully raised £2,500 toward our quarterly goals...',
    authorId: 3,
    authorName: 'David Clark',
    status: 'approved',
    audience: 'ministry_only',
    publishDate: '2024-02-01',
    reviewedBy: 'Pastor John Williams',
    tags: ['finance', 'update', 'progress'],
    createdAt: '2024-01-28',
    updatedAt: '2024-01-30'
  },
  {
    id: 2,
    title: 'Men\'s Ministry Educational Support Program',
    content: 'The Education Committee is launching a new initiative to support our brightest young minds...',
    authorId: 4,
    authorName: 'James Thompson',
    status: 'review',
    audience: 'church_wide',
    reviewNotes: 'Please add more details about application process',
    tags: ['education', 'program', 'announcement'],
    createdAt: '2024-01-26',
    updatedAt: '2024-01-28'
  }
];

export const mockCommitteeWorkspaces: CommitteeWorkspace[] = [
  {
    id: 1,
    name: 'Finance Committee',
    description: 'Managing financial resources and budgeting',
    stats: {
      totalTasks: 15,
      completedTasks: 8,
      pendingTasks: 5,
      overdueTasks: 2,
      upcomingMeetings: 1,
      monthlyBudget: 2000,
      spent: 1245,
      publications: 3
    }
  },
  {
    id: 2,
    name: 'Education Committee',
    description: 'Supporting educational excellence in our community',
    stats: {
      totalTasks: 8,
      completedTasks: 6,
      pendingTasks: 2,
      overdueTasks: 0,
      upcomingMeetings: 0,
      monthlyBudget: 500,
      spent: 200,
      publications: 1
    }
  },
  {
    id: 3,
    name: 'Welfare Committee',
    description: 'Providing support and care for members in need',
    stats: {
      totalTasks: 12,
      completedTasks: 9,
      pendingTasks: 2,
      overdueTasks: 1,
      upcomingMeetings: 0,
      monthlyBudget: 1000,
      spent: 750,
      publications: 0
    }
  }
];

// Add the missing exports that CommitteeFinance is trying to import
export const mockContributions = [
  { id: 1, amount: 500, contributor: 'John Smith', date: '2024-01-15', method: 'Bank Transfer' },
  { id: 2, amount: 250, contributor: 'Mary Johnson', date: '2024-01-20', method: 'Cash' },
  { id: 3, amount: 750, contributor: 'David Wilson', date: '2024-01-25', method: 'Card' }
];

export const mockPledges = [
  { id: 1, pledger: 'Robert Brown', amount: 1000, pledged: '2024-01-01', due: '2024-12-31', paid: 300 },
  { id: 2, pledger: 'Sarah Davis', amount: 500, pledged: '2024-01-15', due: '2024-06-30', paid: 500 }
];
