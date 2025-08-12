
import { 
  MinistryMember, 
  Committee, 
  MinistryContribution, 
  Pledge, 
  MinistryPublication, 
  MinistryEvent,
  MinistryFinancialSummary 
} from '@/types/ministry';

export const mockMinistryMembers: MinistryMember[] = [
  {
    id: 1,
    memberId: 1, // Pastor John Williams
    fullName: 'Pastor John Williams',
    email: 'pastor.john@fhbc.org',
    phone: '+44 7123 456789',
    role: 'head',
    committeeAssignments: [],
    dateJoined: '2010-01-15',
    isActive: true,
    leadershipPosition: 'Chairman'
  },
  {
    id: 2,
    memberId: 3, // Michael Brown
    fullName: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+44 7345 678901',
    role: 'vice_head',
    committeeAssignments: ['Youth'],
    dateJoined: '2022-08-15',
    isActive: true,
    leadershipPosition: 'Vice Chairman'
  },
  {
    id: 3,
    memberId: 5, // David Clark
    fullName: 'David Clark',
    email: 'david.clark@email.com',
    phone: '+44 7567 890123',
    role: 'committee_head',
    committeeAssignments: ['Finance'],
    dateJoined: '2023-06-10',
    isActive: true,
    leadershipPosition: 'Finance Committee Head'
  },
  {
    id: 4,
    memberId: 6,
    fullName: 'James Thompson',
    email: 'james.thompson@email.com',
    phone: '+44 7111 222333',
    role: 'committee_head',
    committeeAssignments: ['Education'],
    dateJoined: '2021-03-20',
    isActive: true,
    leadershipPosition: 'Education Committee Head'
  },
  {
    id: 5,
    memberId: 7,
    fullName: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    phone: '+44 7222 333444',
    role: 'committee_member',
    committeeAssignments: ['Finance', 'Audit'],
    dateJoined: '2022-01-10',
    isActive: true
  }
];

export const mockCommittees: Committee[] = [
  {
    id: 1,
    name: 'Finance',
    description: 'Manages financial resources, budgeting, and financial planning for the ministry',
    headId: 3,
    members: [3, 5],
    meetingSchedule: 'First Saturday of every month',
    isActive: true,
    createdAt: '2023-01-15'
  },
  {
    id: 2,
    name: 'Education',
    description: 'Organizes educational programs, workshops, and spiritual development activities',
    headId: 4,
    members: [4],
    meetingSchedule: 'Second Sunday after service',
    isActive: true,
    createdAt: '2023-01-15'
  },
  {
    id: 3,
    name: 'Welfare',
    description: 'Handles member welfare, support programs, and community outreach',
    members: [],
    meetingSchedule: 'Third Saturday of every month',
    isActive: true,
    createdAt: '2023-01-15'
  },
  {
    id: 4,
    name: 'Audit',
    description: 'Reviews financial records and ensures transparency in all financial matters',
    members: [5],
    meetingSchedule: 'Quarterly',
    isActive: true,
    createdAt: '2023-01-15'
  },
  {
    id: 5,
    name: 'Public Relations',
    description: 'Manages communications, publications, and public engagement',
    members: [],
    meetingSchedule: 'Monthly',
    isActive: true,
    createdAt: '2023-01-15'
  }
];

export const mockContributions: MinistryContribution[] = [
  {
    id: 1,
    memberId: 1,
    type: 'monthly_dues',
    amount: 50,
    date: '2024-01-01',
    description: 'January 2024 monthly dues',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    memberId: 2,
    type: 'monthly_dues',
    amount: 30,
    date: '2024-01-01',
    description: 'January 2024 monthly dues',
    createdAt: '2024-01-01'
  },
  {
    id: 3,
    memberId: 3,
    type: 'pledge',
    amount: 200,
    date: '2024-01-05',
    description: 'Church building pledge payment',
    pledgeId: 1,
    createdAt: '2024-01-05'
  },
  {
    id: 4,
    memberId: 4,
    type: 'special_offering',
    amount: 100,
    date: '2024-01-07',
    description: 'New Year thanksgiving offering',
    createdAt: '2024-01-07'
  }
];

export const mockPledges: Pledge[] = [
  {
    id: 1,
    memberId: 3,
    campaignName: 'Church Building Fund',
    totalAmount: 1000,
    paidAmount: 200,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    notes: 'Monthly payment of £200',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    memberId: 1,
    campaignName: 'Community Outreach Program',
    totalAmount: 500,
    paidAmount: 500,
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    status: 'completed',
    createdAt: '2023-06-01'
  }
];

export const mockPublications: MinistryPublication[] = [
  {
    id: 1,
    title: 'Men\'s Ministry Monthly Newsletter - January 2024',
    content: 'Welcome to the new year, brothers! This month we focus on spiritual leadership in the home and workplace. Join us for our upcoming men\'s retreat on February 15-17.',
    authorId: 1,
    scope: 'ministry_only',
    status: 'published',
    publishDate: '2024-01-01',
    tags: ['newsletter', 'monthly', 'leadership'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    title: 'Church Building Project Update',
    content: 'The Men\'s Ministry is proud to announce that we have raised £15,000 towards the new church building project. Thank you to all members for your generous contributions.',
    authorId: 3,
    scope: 'church_wide',
    status: 'published',
    publishDate: '2024-01-05',
    approvedBy: 1,
    approvedAt: '2024-01-05',
    tags: ['building', 'fundraising', 'announcement'],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-05'
  },
  {
    id: 3,
    title: 'Upcoming Men\'s Conference 2024',
    content: 'Save the date! Our annual men\'s conference will be held on March 20-22, 2024. Theme: "Men of Valor - Standing Strong in Faith". Registration opens February 1st.',
    authorId: 2,
    scope: 'church_wide',
    status: 'draft',
    tags: ['conference', 'event', 'announcement'],
    createdAt: '2024-01-07',
    updatedAt: '2024-01-07'
  }
];

export const mockMinistryEvents: MinistryEvent[] = [
  {
    id: 1,
    title: 'Men\'s Prayer Breakfast',
    description: 'Monthly prayer breakfast for all men in the ministry. Fellowship, prayer, and encouragement.',
    startDate: '2024-01-13',
    endDate: '2024-01-13',
    location: 'Church Fellowship Hall',
    organizerId: 2,
    attendees: [1, 2, 3, 4, 5],
    budget: 200,
    expenses: 150,
    isPublic: true,
    status: 'completed',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    title: 'Men\'s Retreat 2024',
    description: 'Annual men\'s retreat focusing on spiritual growth, fellowship, and leadership development.',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    location: 'Countryside Retreat Center',
    organizerId: 1,
    attendees: [],
    budget: 5000,
    isPublic: true,
    status: 'planned',
    createdAt: '2024-01-01'
  },
  {
    id: 3,
    title: 'Finance Committee Meeting',
    description: 'Monthly finance committee meeting to review budget and expenses.',
    startDate: '2024-01-20',
    endDate: '2024-01-20',
    location: 'Church Conference Room',
    organizerId: 3,
    attendees: [3, 5],
    isPublic: false,
    status: 'planned',
    createdAt: '2024-01-15'
  }
];

export const mockFinancialSummary: MinistryFinancialSummary = {
  totalContributions: 2380,
  monthlyDues: 480,
  pledgePayments: 1200,
  specialOfferings: 700,
  totalExpenses: 1850,
  netBalance: 530,
  period: '2024-01'
};
