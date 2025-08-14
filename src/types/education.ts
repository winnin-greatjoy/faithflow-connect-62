
export interface Student {
  id: number;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  linkedMemberId?: number;
  schoolName: string;
  currentLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentGuardian {
  id: number;
  studentId: number;
  memberId: number;
  relationship: string;
  primaryContact: boolean;
}

export interface AcademicYear {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  isOpenForSubmissions: boolean;
  submissionDeadline: string;
}

export interface ReportCard {
  id: number;
  studentId: number;
  academicYearId: number;
  schoolName: string;
  level: string;
  fileUrl: string;
  submittedByMemberId: number;
  consentPublish: boolean;
  consentVerify: boolean;
  status: 'submitted' | 'under_review' | 'verified' | 'ranked' | 'awarded' | 'rejected';
  reviewerId?: number;
  notes: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface ReportCardSubject {
  id: number;
  reportCardId: number;
  subject: string;
  rawMark?: number;
  rawGrade?: string;
  isCore: boolean;
}

export interface NormalizedScore {
  id: number;
  reportCardId: number;
  normalizedAvg: number;
  coreWeightedAvg: number;
  scaleUsed: string;
}

export interface GradingScheme {
  id: number;
  name: string;
  scaleType: 'letters' | 'percent' | 'gpa';
  mappingJson: Record<string, number>;
}

export interface CoreSubject {
  id: number;
  name: string;
  weight: number;
}

export interface Ranking {
  id: number;
  academicYearId: number;
  level: string;
  studentId: number;
  rank: number;
  score: number;
  tieBreakerMeta: Record<string, any>;
}

export interface AwardPackage {
  id: number;
  name: string;
  description: string;
  minScore: number;
  maxRecipients: number;
  benefitJson: Record<string, any>;
  budgetCap: number;
  isActive: boolean;
}

export interface Award {
  id: number;
  studentId: number;
  packageId: number;
  academicYearId: number;
  status: 'proposed' | 'approved' | 'fulfilled' | 'cancelled';
  amount: number;
  notes: string;
  proposedAt: string;
  approvedAt?: string;
  fulfilledAt?: string;
}

export interface BudgetDraft {
  id: number;
  academicYearId: number;
  committeeId: number;
  total: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: number;
}

export interface BudgetItem {
  id: number;
  draftId: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vendor?: string;
  total: number;
}

export interface Disbursement {
  id: number;
  awardId: number;
  type: 'cash' | 'in_kind' | 'voucher';
  amount: number;
  receiptUrl?: string;
  fulfilledOn?: string;
  notes: string;
}

export interface EducationStats {
  totalSubmissions: number;
  verifiedSubmissions: number;
  averageScore: number;
  budgetRequested: number;
  budgetApproved: number;
  budgetSpent: number;
  totalAwardees: number;
  pendingReviews: number;
}
