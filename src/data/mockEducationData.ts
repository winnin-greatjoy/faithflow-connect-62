
import { 
  Student, 
  AcademicYear, 
  ReportCard, 
  AwardPackage, 
  Award, 
  Ranking, 
  GradingScheme,
  CoreSubject,
  EducationStats 
} from '@/types/education';

export const mockAcademicYears: AcademicYear[] = [
  {
    id: 1,
    label: '2023/2024 Academic Year',
    startDate: '2023-09-01',
    endDate: '2024-07-31',
    isOpenForSubmissions: true,
    submissionDeadline: '2024-08-31'
  },
  {
    id: 2,
    label: '2022/2023 Academic Year',
    startDate: '2022-09-01',
    endDate: '2023-07-31',
    isOpenForSubmissions: false,
    submissionDeadline: '2023-08-31'
  }
];

export const mockStudents: Student[] = [
  {
    id: 1,
    name: 'Sarah Mensah',
    dateOfBirth: '2008-03-15',
    gender: 'female',
    linkedMemberId: 15,
    schoolName: 'Ghana International School',
    currentLevel: 'SSS2',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-25'
  },
  {
    id: 2,
    name: 'Emmanuel Asante',
    dateOfBirth: '2010-07-22',
    gender: 'male',
    linkedMemberId: 18,
    schoolName: 'Achimota School',
    currentLevel: 'JSS3',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    name: 'Grace Osei',
    dateOfBirth: '2006-11-08',
    gender: 'female',
    linkedMemberId: 22,
    schoolName: 'University of Ghana',
    currentLevel: 'Year 2',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-28'
  }
];

export const mockReportCards: ReportCard[] = [
  {
    id: 1,
    studentId: 1,
    academicYearId: 1,
    schoolName: 'Ghana International School',
    level: 'SSS2',
    fileUrl: '/reports/sarah_mensah_report_2024.pdf',
    submittedByMemberId: 15,
    consentPublish: true,
    consentVerify: true,
    status: 'verified',
    reviewerId: 4,
    notes: 'Excellent performance across all subjects',
    submittedAt: '2024-01-20',
    reviewedAt: '2024-01-25'
  },
  {
    id: 2,
    studentId: 2,
    academicYearId: 1,
    schoolName: 'Achimota School',
    level: 'JSS3',
    fileUrl: '/reports/emmanuel_asante_report_2024.pdf',
    submittedByMemberId: 18,
    consentPublish: true,
    consentVerify: true,
    status: 'under_review',
    notes: 'Strong performance in mathematics and science',
    submittedAt: '2024-01-22'
  },
  {
    id: 3,
    studentId: 3,
    academicYearId: 1,
    schoolName: 'University of Ghana',
    level: 'Year 2',
    fileUrl: '/reports/grace_osei_transcript_2024.pdf',
    submittedByMemberId: 22,
    consentPublish: false,
    consentVerify: true,
    status: 'ranked',
    reviewerId: 4,
    notes: 'Outstanding academic record',
    submittedAt: '2024-01-18',
    reviewedAt: '2024-01-23'
  }
];

export const mockGradingSchemes: GradingScheme[] = [
  {
    id: 1,
    name: 'Ghana WAEC Grading',
    scaleType: 'letters',
    mappingJson: {
      'A1': 95,
      'B2': 85,
      'B3': 80,
      'C4': 75,
      'C5': 70,
      'C6': 65,
      'D7': 60,
      'E8': 55,
      'F9': 45
    }
  },
  {
    id: 2,
    name: 'Percentage Scale',
    scaleType: 'percent',
    mappingJson: {
      '90-100': 95,
      '80-89': 85,
      '70-79': 75,
      '60-69': 65,
      '50-59': 55,
      '0-49': 25
    }
  },
  {
    id: 3,
    name: 'University GPA (4.0)',
    scaleType: 'gpa',
    mappingJson: {
      '4.0': 100,
      '3.5-3.9': 90,
      '3.0-3.4': 80,
      '2.5-2.9': 70,
      '2.0-2.4': 60,
      '1.5-1.9': 50,
      '1.0-1.4': 40,
      '0.0-0.9': 20
    }
  }
];

export const mockCoreSubjects: CoreSubject[] = [
  { id: 1, name: 'Mathematics', weight: 1.3 },
  { id: 2, name: 'English Language', weight: 1.3 },
  { id: 3, name: 'Science', weight: 1.2 },
  { id: 4, name: 'Physics', weight: 1.2 },
  { id: 5, name: 'Chemistry', weight: 1.2 },
  { id: 6, name: 'Biology', weight: 1.2 }
];

export const mockAwardPackages: AwardPackage[] = [
  {
    id: 1,
    name: 'Gold Package',
    description: 'Top performer award - laptop or cash grant',
    minScore: 90,
    maxRecipients: 2,
    benefitJson: {
      type: 'choice',
      options: ['Laptop (up to GH₵3000)', 'Cash Grant GH₵2500', 'Book Grant GH₵1500']
    },
    budgetCap: 3000,
    isActive: true
  },
  {
    id: 2,
    name: 'Silver Package',
    description: 'Excellent performance award - tablet or book grant',
    minScore: 80,
    maxRecipients: 4,
    benefitJson: {
      type: 'choice',
      options: ['Tablet (up to GH₵1500)', 'Book Grant GH₵1000', 'School Supply Package GH₵800']
    },
    budgetCap: 1500,
    isActive: true
  },
  {
    id: 3,
    name: 'Bronze Package',
    description: 'Good performance award - book bundle',
    minScore: 70,
    maxRecipients: 6,
    benefitJson: {
      type: 'fixed',
      items: ['Book Bundle', 'Stationery Set', 'Merit Certificate']
    },
    budgetCap: 500,
    isActive: true
  }
];

export const mockRankings: Ranking[] = [
  {
    id: 1,
    academicYearId: 1,
    level: 'SSS2',
    studentId: 1,
    rank: 1,
    score: 94.5,
    tieBreakerMeta: { coreAverage: 96.2, totalAs: 8 }
  },
  {
    id: 2,
    academicYearId: 1,
    level: 'JSS3',
    studentId: 2,
    rank: 2,
    score: 87.3,
    tieBreakerMeta: { coreAverage: 89.1, totalAs: 5 }
  },
  {
    id: 3,
    academicYearId: 1,
    level: 'Year 2',
    studentId: 3,
    rank: 1,
    score: 92.1,
    tieBreakerMeta: { coreAverage: 93.8, totalAs: 6 }
  }
];

export const mockAwards: Award[] = [
  {
    id: 1,
    studentId: 1,
    packageId: 1,
    academicYearId: 1,
    status: 'approved',
    amount: 2500,
    notes: 'Cash grant approved for top SSS2 performer',
    proposedAt: '2024-01-25',
    approvedAt: '2024-01-28'
  },
  {
    id: 2,
    studentId: 3,
    packageId: 1,
    academicYearId: 1,
    status: 'proposed',
    amount: 3000,
    notes: 'Laptop proposed for top tertiary performer',
    proposedAt: '2024-01-26'
  },
  {
    id: 3,
    studentId: 2,
    packageId: 2,
    academicYearId: 1,
    status: 'proposed',
    amount: 1000,
    notes: 'Book grant for strong JSS3 performance',
    proposedAt: '2024-01-27'
  }
];

export const mockEducationStats: EducationStats = {
  totalSubmissions: 12,
  verifiedSubmissions: 8,
  averageScore: 82.4,
  budgetRequested: 15000,
  budgetApproved: 12000,
  budgetSpent: 5500,
  totalAwardees: 8,
  pendingReviews: 4
};
