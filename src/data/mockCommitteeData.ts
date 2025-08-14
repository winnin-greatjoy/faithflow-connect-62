
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

// Re-export existing committee data
export * from './mockCommitteeData';
