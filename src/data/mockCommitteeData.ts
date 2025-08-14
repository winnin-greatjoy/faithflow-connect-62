
import { 
  BudgetEnvelope, 
  IncomeTransaction, 
  ExpenseRequest, 
  CashAccount, 
  Receipt, 
  Disbursement,
  WelfareCase,
  CaseVisit,
  Publication,
  MediaAsset,
  AuditException,
  AuditFinding,
  EthicsReport,
  Investigation
} from '@/types/committees';
import { CommitteeTask, CommitteeMeeting, CommitteeExpense, CommitteeWorkspace } from '@/types/committee';

// Committee Workspaces
export const mockCommitteeWorkspaces: CommitteeWorkspace[] = [
  {
    id: 1,
    name: 'Finance Committee',
    description: 'Financial planning, budgets, and reporting',
    stats: {
      totalTasks: 12,
      completedTasks: 8,
      pendingTasks: 3,
      overdueTasks: 1,
      upcomingMeetings: 2,
      monthlyBudget: 5000,
      spent: 3750,
      publications: 2
    }
  },
  {
    id: 2,
    name: 'Education Committee',
    description: 'Academic recognition and student awards',
    stats: {
      totalTasks: 8,
      completedTasks: 5,
      pendingTasks: 2,
      overdueTasks: 1,
      upcomingMeetings: 1,
      monthlyBudget: 2500,
      spent: 1800,
      publications: 1
    }
  },
  {
    id: 3,
    name: 'Welfare Committee',
    description: 'Member care and support services',
    stats: {
      totalTasks: 15,
      completedTasks: 10,
      pendingTasks: 4,
      overdueTasks: 1,
      upcomingMeetings: 1,
      monthlyBudget: 3000,
      spent: 2200,
      publications: 0
    }
  },
  {
    id: 4,
    name: 'Treasury Committee',
    description: 'Cash management and disbursement',
    stats: {
      totalTasks: 6,
      completedTasks: 4,
      pendingTasks: 2,
      overdueTasks: 0,
      upcomingMeetings: 1,
      monthlyBudget: 1500,
      spent: 900,
      publications: 0
    }
  }
];

// Committee Tasks
export const mockCommitteeTasks: CommitteeTask[] = [
  {
    id: 1,
    title: 'Prepare Monthly Budget Report',
    description: 'Compile income and expense report for January 2024',
    status: 'in_progress',
    assigneeId: 1,
    assigneeName: 'David Clark',
    dueDate: '2024-02-05',
    priority: 'high',
    tags: ['finance', 'report', 'monthly'],
    attachments: ['/files/budget_template.xlsx'],
    checklist: [
      { id: 1, text: 'Gather income statements', completed: true },
      { id: 2, text: 'Categorize expenses', completed: true },
      { id: 3, text: 'Calculate variances', completed: false },
      { id: 4, text: 'Create summary report', completed: false }
    ],
    comments: [
      {
        id: 1,
        authorName: 'Pastor John Williams',
        text: 'Please include breakdown by ministry',
        timestamp: '2024-01-28T14:30:00Z'
      }
    ],
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-28T16:45:00Z'
  },
  {
    id: 2,
    title: 'Review Welfare Support Requests',
    description: 'Assess pending welfare cases for Q1 support',
    status: 'backlog',
    assigneeId: 2,
    assigneeName: 'Michael Brown',
    dueDate: '2024-02-10',
    priority: 'medium',
    tags: ['welfare', 'assessment'],
    attachments: [],
    checklist: [
      { id: 1, text: 'Review 5 pending cases', completed: false },
      { id: 2, text: 'Conduct home visits', completed: false },
      { id: 3, text: 'Submit recommendations', completed: false }
    ],
    comments: [],
    createdAt: '2024-01-26T11:15:00Z',
    updatedAt: '2024-01-26T11:15:00Z'
  },
  {
    id: 3,
    title: 'Update Ministry Website Content',
    description: 'Refresh Men\'s Ministry page with recent activities',
    status: 'done',
    assigneeId: 3,
    assigneeName: 'Emmanuel Tetteh',
    dueDate: '2024-01-30',
    priority: 'low',
    tags: ['PR', 'website', 'content'],
    attachments: ['/files/content_draft.docx'],
    checklist: [
      { id: 1, text: 'Write new content', completed: true },
      { id: 2, text: 'Add photos', completed: true },
      { id: 3, text: 'Get approval', completed: true },
      { id: 4, text: 'Publish updates', completed: true }
    ],
    comments: [
      {
        id: 1,
        authorName: 'Pastor John Williams',
        text: 'Great work on the content!',
        timestamp: '2024-01-30T10:00:00Z'
      }
    ],
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-30T15:20:00Z'
  }
];

// Committee Meetings
export const mockCommitteeMeetings: CommitteeMeeting[] = [
  {
    id: 1,
    title: 'Monthly Finance Review',
    date: '2024-02-03',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Church Conference Room',
    agenda: [
      { id: 1, item: 'Budget Review', duration: 30, presenter: 'David Clark' },
      { id: 2, item: 'Q1 Projections', duration: 20, presenter: 'Michael Brown' },
      { id: 3, item: 'Welfare Requests', duration: 25, presenter: 'James Thompson' },
      { id: 4, item: 'Equipment Needs', duration: 15, presenter: 'Robert Wilson' }
    ],
    attendees: [
      { memberId: 1, name: 'Pastor John Williams', status: 'present' },
      { memberId: 2, name: 'David Clark', status: 'present' },
      { memberId: 3, name: 'Michael Brown', status: 'present' },
      { memberId: 4, name: 'James Thompson', status: 'late' },
      { memberId: 5, name: 'Robert Wilson', status: 'absent' }
    ],
    minutes: 'Meeting focused on Q1 budget allocations and upcoming welfare needs. All committee heads reported satisfactory progress on assigned tasks.',
    decisions: [
      {
        id: 1,
        decision: 'Approve additional £500 for welfare emergency fund',
        responsible: 'David Clark',
        deadline: '2024-02-10'
      },
      {
        id: 2,
        decision: 'Schedule equipment assessment for sound system',
        responsible: 'Robert Wilson',
        deadline: '2024-02-15'
      }
    ],
    followUpTasks: [1, 2],
    status: 'completed'
  },
  {
    id: 2,
    title: 'Quarterly Planning Session',
    date: '2024-02-17',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Church Hall',
    agenda: [
      { id: 1, item: 'Q2 Goals Setting', duration: 45, presenter: 'Pastor John Williams' },
      { id: 2, item: 'Committee Reports', duration: 30, presenter: 'All Heads' },
      { id: 3, item: 'Resource Planning', duration: 30, presenter: 'David Clark' },
      { id: 4, item: 'Action Items', duration: 15, presenter: 'Secretary' }
    ],
    attendees: [
      { memberId: 1, name: 'Pastor John Williams', status: 'present' },
      { memberId: 2, name: 'David Clark', status: 'present' },
      { memberId: 3, name: 'Michael Brown', status: 'present' },
      { memberId: 4, name: 'James Thompson', status: 'present' },
      { memberId: 5, name: 'Robert Wilson', status: 'present' }
    ],
    minutes: '',
    decisions: [],
    followUpTasks: [],
    status: 'scheduled'
  }
];

// Committee Expenses
export const mockCommitteeExpenses: CommitteeExpense[] = [
  {
    id: 1,
    description: 'Refreshments for Monthly Meeting',
    amount: 150.00,
    requestedBy: 'James Thompson',
    requestedAt: '2024-01-25T14:30:00Z',
    approvedBy: 'Pastor John Williams',
    approvedAt: '2024-01-26T09:15:00Z',
    status: 'paid',
    category: 'Meetings & Events',
    receiptUrl: '/receipts/meeting_refreshments_jan.pdf',
    notes: 'Catering for 25 attendees at monthly committee meeting'
  },
  {
    id: 2,
    description: 'Office Supplies - Stationery',
    amount: 85.50,
    requestedBy: 'Michael Brown',
    requestedAt: '2024-01-28T11:00:00Z',
    status: 'pending',
    category: 'Office Supplies',
    notes: 'Pens, notebooks, and folders for committee work'
  },
  {
    id: 3,
    description: 'Welfare Emergency Support',
    amount: 300.00,
    requestedBy: 'Robert Wilson',
    requestedAt: '2024-01-29T16:45:00Z',
    approvedBy: 'Pastor John Williams',
    approvedAt: '2024-01-30T08:30:00Z',
    status: 'approved',
    category: 'Welfare Support',
    receiptUrl: '/receipts/medical_assistance_receipt.jpg',
    notes: 'Emergency medical assistance for Brother Samuel'
  }
];

// Mock Contributions and Pledges (for Finance Committee)
export const mockContributions = [
  {
    id: 1,
    amount: 500,
    date: '2024-01-15',
    member: 'John Smith',
    type: 'Monthly Dues',
    method: 'Bank Transfer'
  },
  {
    id: 2,
    amount: 250,
    date: '2024-01-20',
    member: 'Michael Brown',
    type: 'Special Offering',
    method: 'Cash'
  }
];

export const mockPledges = [
  {
    id: 1,
    member: 'David Clark',
    amount: 1200,
    pledged: 1200,
    paid: 800,
    remaining: 400,
    dueDate: '2024-12-31'
  }
];

// Finance Committee Mock Data
export const mockBudgetEnvelopes: BudgetEnvelope[] = [
  {
    id: 1,
    name: 'Events & Programs',
    category: 'Operations',
    allocatedAmount: 5000,
    spentAmount: 2750,
    remainingAmount: 2250,
    fiscalYear: '2024',
    status: 'active'
  },
  {
    id: 2,
    name: 'Welfare Support',
    category: 'Ministry',
    allocatedAmount: 3000,
    spentAmount: 1800,
    remainingAmount: 1200,
    fiscalYear: '2024',
    status: 'active'
  },
  {
    id: 3,
    name: 'Equipment & Supplies',
    category: 'Capital',
    allocatedAmount: 2000,
    spentAmount: 2100,
    remainingAmount: -100,
    fiscalYear: '2024',
    status: 'over_budget'
  }
];

export const mockIncomeTransactions: IncomeTransaction[] = [
  {
    id: 1,
    receiptNo: 'MIN-2024-001',
    amount: 500,
    source: 'dues',
    method: 'bank_transfer',
    memberId: 1,
    memberName: 'John Smith',
    description: 'Monthly dues - January 2024',
    recordedBy: 'David Clark',
    recordedAt: '2024-01-15T10:30:00Z',
    envelopeId: 1
  },
  {
    id: 2,
    receiptNo: 'MIN-2024-002',
    amount: 1000,
    source: 'pledge',
    method: 'cash',
    memberId: 2,
    memberName: 'Michael Brown',
    description: 'Building fund pledge payment',
    recordedBy: 'David Clark',
    recordedAt: '2024-01-20T14:15:00Z'
  }
];

export const mockExpenseRequests: ExpenseRequest[] = [
  {
    id: 1,
    requesterId: 3,
    requesterName: 'James Thompson',
    envelopeId: 1,
    envelopeName: 'Events & Programs',
    description: 'Refreshments for quarterly meeting',
    amount: 150,
    vendor: 'City Catering Services',
    quoteUrl: '/files/quote_001.pdf',
    status: 'approved',
    approvals: [
      {
        id: 1,
        approverId: 1,
        approverName: 'Pastor John Williams',
        approverRole: 'Finance Head',
        status: 'approved',
        comments: 'Approved for quarterly meeting',
        timestamp: '2024-01-25T09:00:00Z'
      }
    ],
    submittedAt: '2024-01-22T16:30:00Z',
    notes: 'Required for 50 attendees'
  },
  {
    id: 2,
    requesterId: 4,
    requesterName: 'Robert Wilson',
    envelopeId: 2,
    envelopeName: 'Welfare Support',
    description: 'Emergency medical assistance',
    amount: 500,
    status: 'submitted',
    approvals: [
      {
        id: 2,
        approverId: 1,
        approverName: 'Pastor John Williams',
        approverRole: 'Finance Head',
        status: 'pending'
      }
    ],
    submittedAt: '2024-01-28T11:45:00Z',
    notes: 'Urgent medical assistance for Brother Samuel'
  }
];

// Treasury Committee Mock Data
export const mockCashAccounts: CashAccount[] = [
  {
    id: 1,
    name: 'Main Church Account',
    type: 'bank',
    accountNumber: '****-4532',
    balance: 15750.50,
    lastReconciled: '2024-01-25'
  },
  {
    id: 2,
    name: 'Mobile Money Wallet',
    type: 'mobile_wallet',
    accountNumber: '0244-***-789',
    balance: 2340.00,
    lastReconciled: '2024-01-28'
  },
  {
    id: 3,
    name: 'Petty Cash',
    type: 'petty_cash',
    balance: 500.00,
    lastReconciled: '2024-01-28'
  }
];

export const mockReceipts: Receipt[] = [
  {
    id: 1,
    receiptNo: 'RCP-2024-001',
    amount: 100,
    payerName: 'Sister Mary Johnson',
    purpose: 'Monthly contribution',
    method: 'cash',
    issuedBy: 'David Clark',
    issuedAt: '2024-01-28T09:15:00Z',
    batchId: 1
  },
  {
    id: 2,
    receiptNo: 'RCP-2024-002',
    amount: 250,
    payerName: 'Brother Paul Anderson',
    purpose: 'Event registration',
    method: 'mobile_money',
    issuedBy: 'Michael Brown',
    issuedAt: '2024-01-28T11:30:00Z',
    batchId: 1
  }
];

export const mockDisbursements: Disbursement[] = [
  {
    id: 1,
    beneficiaryName: 'Brother Samuel Osei',
    amount: 300,
    purpose: 'Medical assistance',
    method: 'mobile_money',
    accountId: 2,
    approvedBy: 'Pastor John Williams',
    disbursedBy: 'David Clark',
    receiptUrl: '/receipts/disbursement_001.jpg',
    disbursedAt: '2024-01-26T14:20:00Z',
    notes: 'Emergency medical support approved by welfare committee'
  }
];

// Welfare Committee Mock Data
export const mockWelfareCases: WelfareCase[] = [
  {
    id: 1,
    requesterId: 5,
    requesterName: 'Sister Grace Mensah',
    caseType: 'illness',
    description: 'Chronic diabetes treatment support needed',
    urgency: 'medium',
    status: 'approved',
    assignedTo: 'Brother Daniel Asante',
    estimatedAmount: 800,
    approvedAmount: 600,
    disbursedAmount: 600,
    privacyLevel: 'committee_only',
    submittedAt: '2024-01-15T08:30:00Z',
    lastUpdated: '2024-01-25T16:45:00Z',
    notes: 'Monthly medication support approved for 3 months'
  },
  {
    id: 2,
    requesterId: 6,
    requesterName: 'Brother Joseph Addo',
    caseType: 'bereavement',
    description: 'Funeral expenses support following wife\'s passing',
    urgency: 'high',
    status: 'assessment',
    assignedTo: 'Sister Ruth Owusu',
    estimatedAmount: 1500,
    privacyLevel: 'leadership_only',
    submittedAt: '2024-01-26T12:00:00Z',
    lastUpdated: '2024-01-27T10:15:00Z',
    notes: 'Home visit scheduled for assessment'
  }
];

export const mockCaseVisits: CaseVisit[] = [
  {
    id: 1,
    caseId: 1,
    visitorName: 'Brother Daniel Asante',
    visitDate: '2024-01-18',
    visitType: 'home',
    findings: 'Sister Grace is managing well with current medication but needs continued support',
    recommendations: 'Continue monthly medication allowance for next 3 months',
    followUpRequired: true,
    followUpDate: '2024-02-18'
  }
];

// PR Committee Mock Data
export const mockPublications: Publication[] = [
  {
    id: 1,
    title: 'Men\'s Ministry Quarterly Update - Q1 2024',
    content: 'We are excited to share the progress and achievements of our Men\'s Ministry...',
    type: 'newsletter',
    authorId: 7,
    authorName: 'Brother Emmanuel Tetteh',
    status: 'published',
    audience: 'church_wide',
    publishDate: '2024-01-28',
    reviewedBy: 'Pastor John Williams',
    tags: ['newsletter', 'quarterly', 'ministry-update'],
    mediaAssets: ['/media/mens-ministry-banner.jpg'],
    analytics: {
      views: 156,
      clicks: 23,
      shares: 8
    },
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-01-27T16:20:00Z'
  },
  {
    id: 2,
    title: 'Upcoming Leadership Retreat - Register Now',
    content: 'Join us for an inspiring weekend of fellowship and spiritual growth...',
    type: 'event_promo',
    authorId: 7,
    authorName: 'Brother Emmanuel Tetteh',
    status: 'approved',
    audience: 'ministry_only',
    publishDate: '2024-02-01',
    expiryDate: '2024-02-15',
    reviewedBy: 'Pastor John Williams',
    tags: ['retreat', 'leadership', 'registration'],
    mediaAssets: ['/media/retreat-flyer.png'],
    analytics: {
      views: 89,
      clicks: 34,
      shares: 12
    },
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-28T15:45:00Z'
  }
];

export const mockMediaAssets: MediaAsset[] = [
  {
    id: 1,
    filename: 'mens-ministry-banner.jpg',
    type: 'image',
    url: '/media/mens-ministry-banner.jpg',
    size: 245760,
    uploadedBy: 'Brother Emmanuel Tetteh',
    uploadedAt: '2024-01-25T13:15:00Z',
    tags: ['banner', 'ministry', 'branding'],
    description: 'Official Men\'s Ministry banner for publications'
  }
];

// Audit Committee Mock Data
export const mockAuditExceptions: AuditException[] = [
  {
    id: 1,
    type: 'threshold_breach',
    severity: 'medium',
    entityType: 'expense',
    entityId: 1,
    description: 'Expense request exceeds envelope allocation',
    detectedAt: '2024-01-28T02:00:00Z',
    status: 'investigating',
    assignedTo: 'Brother Francis Owusu'
  },
  {
    id: 2,
    type: 'missing_receipt',
    severity: 'high',
    entityType: 'disbursement',
    entityId: 1,
    description: 'Disbursement made without proper receipt documentation',
    detectedAt: '2024-01-27T01:30:00Z',
    status: 'open',
    assignedTo: 'Brother Francis Owusu'
  }
];

export const mockAuditFindings: AuditFinding[] = [
  {
    id: 1,
    title: 'Inadequate Documentation for Welfare Disbursements',
    description: 'Several welfare disbursements lack proper beneficiary acknowledgment receipts',
    severity: 'medium',
    category: 'compliance',
    affectedArea: 'Welfare Committee',
    evidence: ['/audit/evidence_001.pdf', '/audit/evidence_002.pdf'],
    recommendations: [
      'Implement mandatory receipt collection for all disbursements',
      'Create standardized disbursement forms',
      'Provide training on documentation requirements'
    ],
    assignedTo: 'Brother Daniel Asante',
    dueDate: '2024-02-15',
    status: 'in_progress',
    createdAt: '2024-01-20T09:00:00Z'
  }
];

// Ethics Committee Mock Data
export const mockEthicsReports: EthicsReport[] = [
  {
    id: 1,
    isAnonymous: true,
    subject: 'Concerns about committee transparency',
    description: 'There are concerns about the transparency of financial decisions in one of the committees...',
    category: 'financial_impropriety',
    severity: 'medium',
    involvedParties: ['Committee Member A', 'Committee Member B'],
    status: 'triaged',
    assignedInvestigator: 'Elder Samuel Adjei',
    submittedAt: '2024-01-22T16:45:00Z',
    lastUpdated: '2024-01-25T11:30:00Z',
    confidentialityLevel: 'leadership_only'
  }
];

export const mockInvestigations: Investigation[] = [
  {
    id: 1,
    reportId: 1,
    investigatorId: 8,
    investigatorName: 'Elder Samuel Adjei',
    status: 'in_progress',
    startDate: '2024-01-25',
    expectedCompletionDate: '2024-02-08',
    interviews: [
      {
        id: 1,
        investigationId: 1,
        intervieweeName: 'Committee Member C',
        intervieweeRole: 'Witness',
        scheduledDate: '2024-01-30T14:00:00Z',
        location: 'Church Office - Room 2',
        notes: 'Initial witness interview scheduled'
      }
    ],
    evidence: [
      {
        id: 1,
        investigationId: 1,
        type: 'document',
        description: 'Committee meeting minutes from December 2023',
        fileUrl: '/evidence/minutes_dec_2023.pdf',
        submittedBy: 'Elder Samuel Adjei',
        submittedAt: '2024-01-26T10:00:00Z',
        chainOfCustody: ['Elder Samuel Adjei']
      }
    ],
    findings: 'Investigation ongoing - preliminary review completed',
    recommendations: 'Pending completion of interviews'
  }
];
