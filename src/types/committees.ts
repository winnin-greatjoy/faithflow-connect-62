
// Finance Committee Types
export interface BudgetEnvelope {
  id: number;
  name: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  fiscalYear: string;
  status: 'active' | 'closed' | 'over_budget';
}

export interface IncomeTransaction {
  id: number;
  receiptNo: string;
  amount: number;
  source: 'dues' | 'pledge' | 'offering' | 'donation' | 'other';
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  memberId?: number;
  memberName?: string;
  description: string;
  recordedBy: string;
  recordedAt: string;
  envelopeId?: number;
}

export interface ExpenseRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  envelopeId: number;
  envelopeName: string;
  description: string;
  amount: number;
  vendor?: string;
  quoteUrl?: string;
  receiptUrl?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  approvals: ApprovalStep[];
  submittedAt?: string;
  paidAt?: string;
  notes: string;
}

export interface ApprovalStep {
  id: number;
  approverId: number;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp?: string;
}

// Treasury Committee Types
export interface CashAccount {
  id: number;
  name: string;
  type: 'bank' | 'mobile_wallet' | 'petty_cash' | 'cash_box';
  accountNumber?: string;
  balance: number;
  lastReconciled?: string;
}

export interface Receipt {
  id: number;
  receiptNo: string;
  amount: number;
  payerName: string;
  purpose: string;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  issuedBy: string;
  issuedAt: string;
  batchId?: number;
}

export interface Disbursement {
  id: number;
  beneficiaryName: string;
  amount: number;
  purpose: string;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
  accountId: number;
  approvedBy: string;
  disbursedBy: string;
  receiptUrl?: string;
  disbursedAt: string;
  notes: string;
}

// Welfare Committee Types
export interface WelfareCase {
  id: number;
  requesterId: number;
  requesterName: string;
  caseType: 'illness' | 'bereavement' | 'hardship' | 'emergency' | 'other';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assessment' | 'approved' | 'disbursed' | 'closed' | 'rejected';
  assignedTo?: string;
  estimatedAmount?: number;
  approvedAmount?: number;
  disbursedAmount?: number;
  privacyLevel: 'open' | 'committee_only' | 'leadership_only';
  submittedAt: string;
  lastUpdated: string;
  notes: string;
}

export interface CaseVisit {
  id: number;
  caseId: number;
  visitorName: string;
  visitDate: string;
  visitType: 'home' | 'phone' | 'hospital' | 'office';
  findings: string;
  recommendations: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

// PR Committee Types
export interface Publication {
  id: number;
  title: string;
  content: string;
  type: 'article' | 'announcement' | 'event_promo' | 'newsletter';
  authorId: number;
  authorName: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  audience: 'ministry_only' | 'church_wide' | 'public';
  publishDate?: string;
  expiryDate?: string;
  reviewedBy?: string;
  reviewNotes?: string;  
  tags: string[];
  mediaAssets: string[];
  analytics: {
    views: number;
    clicks: number;
    shares: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: number;
  filename: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  description?: string;
}

// Audit Committee Types
export interface AuditException {
  id: number;
  type: 'duplicate_receipt' | 'missing_receipt' | 'threshold_breach' | 'unauthorized_expense' | 'reconciliation_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityType: 'expense' | 'income' | 'disbursement' | 'budget';
  entityId: number;
  description: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface AuditFinding {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'compliance' | 'operational' | 'governance';
  affectedArea: string;
  evidence: string[];
  recommendations: string[];
  assignedTo: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'overdue';
  createdAt: string;
  resolvedAt?: string;
}

// Ethics Committee Types
export interface EthicsReport {
  id: number;
  reporterName?: string; // null if anonymous
  reporterEmail?: string;
  isAnonymous: boolean;
  subject: string;
  description: string;
  category: 'misconduct' | 'harassment' | 'financial_impropriety' | 'discrimination' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  involvedParties: string[];
  status: 'received' | 'triaged' | 'investigating' | 'resolved' | 'closed';
  assignedInvestigator?: string;
  submittedAt: string;
  lastUpdated: string;
  confidentialityLevel: 'restricted' | 'committee_only' | 'leadership_only';
}

export interface Investigation {
  id: number;
  reportId: number;
  investigatorId: number;
  investigatorName: string;
  status: 'assigned' | 'in_progress' | 'completed';
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  interviews: Interview[];
  evidence: Evidence[];
  findings: string;
  recommendations: string;
}

export interface Interview {
  id: number;
  investigationId: number;
  intervieweeName: string;
  intervieweeRole: string;
  scheduledDate: string;
  completedDate?: string;
  location: string;
  notes: string;
  recordingUrl?: string;
}

export interface Evidence {
  id: number;
  investigationId: number;
  type: 'document' | 'email' | 'recording' | 'photo' | 'testimony';
  description: string;
  fileUrl?: string;
  submittedBy: string;
  submittedAt: string;
  chainOfCustody: string[];
}
