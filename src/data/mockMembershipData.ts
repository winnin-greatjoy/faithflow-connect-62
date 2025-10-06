
import { Member, FirstTimer, Branch, DepartmentAssignment, MembershipLevel, Gender, MaritalStatus } from '@/types/membership';

export const mockBranches: Branch[] = [
  {
    id: 1,
    name: 'Beccle St Branch (Main)',
    address: 'Beccle Street, London',
    phone: '+44 20 1234 5678',
    pastorName: 'Pastor John Williams',
    isMain: true
  },
  {
    id: 2,
    name: 'North London Branch',
    address: 'High Street, North London',
    phone: '+44 20 8765 4321',
    pastorName: 'Pastor Sarah Johnson',
    isMain: false
  },
  {
    id: 3,
    name: 'East London Branch',
    address: 'Church Lane, East London',
    phone: '+44 20 5555 1234',
    pastorName: 'Pastor Michael Brown',
    isMain: false
  }
];

const generateMinistry = (dateOfBirth: string, gender: Gender): string => {
  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  
  if (age >= 13 && age <= 30) {
    return 'Youth & Young Adults Ministry';
  } else if (gender === 'male' && age >= 18) {
    return "Men's Ministry";
  } else if (gender === 'female' && age >= 18) {
    return "Women's Ministry";
  }
  return 'Children Ministry';
};

export const mockMembers: Member[] = [
  {
    id: 1,
    fullName: 'Pastor John Williams',
    dateOfBirth: '1975-03-15',
    gender: 'male',
    maritalStatus: 'married',
    spouseName: 'Mary Williams',
    numberOfChildren: 2,
    children: [
      { name: 'David Williams', age: 15 },
      { name: 'Grace Williams', age: 12 }
    ],
    email: 'pastor.john@fhbc.org',
    phone: '+44 7123 456789',
    community: 'Central London',
    area: 'Westminster',
    street: 'Church Street, 25',
    publicLandmark: 'Near Westminster Abbey',
    branchId: 1,
    dateJoined: '2010-01-15',
    membershipLevel: 'baptized',
    baptizedSubLevel: 'leader',
    leaderRole: 'pastor',
    baptismDate: '2005-12-25',
    discipleshipClass1: true,
    discipleshipClass2: true,
    discipleshipClass3: true,
    assignedDepartment: 'Leadership',
    status: 'active',
    ministry: generateMinistry('1975-03-15', 'male'),
    prayerNeeds: 'Wisdom in church leadership',
    pastoralNotes: 'Senior Pastor, excellent leadership',
    lastAttendance: '2024-01-07',
    createdAt: '2010-01-15',
    updatedAt: '2024-01-07'
  },
  {
    id: 2,
    fullName: 'Sarah Johnson',
    dateOfBirth: '1985-07-22',
    gender: 'female',
    maritalStatus: 'married',
    spouseName: 'Peter Johnson',
    numberOfChildren: 1,
    children: [
      { name: 'Emma Johnson', age: 8 }
    ],
    email: 'sarah.johnson@email.com',
    phone: '+44 7234 567890',
    community: 'North London',
    area: 'Camden',
    street: 'Oak Avenue, 12',
    publicLandmark: 'Near Camden Market',
    branchId: 1,
    dateJoined: '2018-05-10',
    membershipLevel: 'baptized',
    baptizedSubLevel: 'worker',
    baptismDate: '2019-04-21',
    discipleshipClass1: true,
    discipleshipClass2: true,
    discipleshipClass3: true,
    assignedDepartment: 'Worship',
    status: 'active',
    ministry: generateMinistry('1985-07-22', 'female'),
    prayerNeeds: 'Family unity and growth',
    pastoralNotes: 'Active in worship ministry, great voice',
    lastAttendance: '2024-01-07',
    createdAt: '2018-05-10',
    updatedAt: '2024-01-07'
  },
  {
    id: 3,
    fullName: 'Michael Brown',
    dateOfBirth: '1995-11-30',
    gender: 'male',
    maritalStatus: 'single',
    numberOfChildren: 0,
    children: [],
    email: 'michael.brown@email.com',
    phone: '+44 7345 678901',
    community: 'South London',
    area: 'Bermondsey',
    street: 'River Walk, 8',
    publicLandmark: 'Near London Bridge',
    branchId: 1,
    dateJoined: '2022-08-15',
    membershipLevel: 'baptized',
    baptizedSubLevel: 'worker',
    baptismDate: '2023-02-14',
    discipleshipClass1: true,
    discipleshipClass2: true,
    discipleshipClass3: false,
    assignedDepartment: 'Youth',
    status: 'active',
    ministry: generateMinistry('1995-11-30', 'male'),
    prayerNeeds: 'Career guidance and future spouse',
    pastoralNotes: 'Very active in youth ministry',
    lastAttendance: '2024-01-07',
    createdAt: '2022-08-15',
    updatedAt: '2024-01-07'
  },
  {
    id: 4,
    fullName: 'Emma Wilson',
    dateOfBirth: '2000-04-18',
    gender: 'female',
    maritalStatus: 'single',
    numberOfChildren: 0,
    children: [],
    email: 'emma.wilson@email.com',
    phone: '+44 7456 789012',
    community: 'East London',
    area: 'Hackney',
    street: 'Victoria Road, 45',
    publicLandmark: 'Near Hackney Downs',
    branchId: 2,
    dateJoined: '2023-01-20',
    membershipLevel: 'convert',
    discipleshipClass1: true,
    discipleshipClass2: false,
    discipleshipClass3: false,
    status: 'active',
    ministry: generateMinistry('2000-04-18', 'female'),
    prayerNeeds: 'Spiritual growth and baptism preparation',
    pastoralNotes: 'Regular attender, preparing for baptism',
    lastAttendance: '2024-01-05',
    createdAt: '2023-01-20',
    updatedAt: '2024-01-05'
  },
  {
    id: 5,
    fullName: 'David Clark',
    dateOfBirth: '1988-12-03',
    gender: 'male',
    maritalStatus: 'divorced',
    numberOfChildren: 1,
    children: [
      { name: 'Joshua Clark', age: 10 }
    ],
    email: 'david.clark@email.com',
    phone: '+44 7567 890123',
    community: 'West London',
    area: 'Kensington',
    street: 'Royal Gardens, 22',
    publicLandmark: 'Near Kensington Palace',
    branchId: 3,
    dateJoined: '2023-06-10',
    membershipLevel: 'visitor',
    discipleshipClass1: false,
    discipleshipClass2: false,
    discipleshipClass3: false,
    status: 'active',
    ministry: generateMinistry('1988-12-03', 'male'),
    prayerNeeds: 'Healing from divorce, single parenting',
    pastoralNotes: 'Regular visitor, needs pastoral care',
    lastAttendance: '2024-01-03',
    createdAt: '2023-06-10',
    updatedAt: '2024-01-03'
  }
];

export const mockFirstTimers: FirstTimer[] = [
  {
    id: 1,
    fullName: 'James Anderson',
    community: 'Central London',
    area: 'Marylebone',
    street: 'Baker Street, 15',
    publicLandmark: 'Near Baker Street Station',
    phone: '+44 7111 222333',
    serviceDate: '2024-01-07',
    invitedBy: 'Sarah Johnson',
    followUpStatus: 'pending',
    branchId: 1,
    notes: 'Seemed interested in youth programs',
    createdAt: '2024-01-07'
  },
  {
    id: 2,
    fullName: 'Lisa Thompson',
    community: 'North London',
    area: 'Islington',
    street: 'Angel Road, 33',
    publicLandmark: 'Near Angel Tube Station',
    phone: '+44 7222 333444',
    serviceDate: '2024-01-07',
    followUpStatus: 'called',
    branchId: 1,
    notes: 'Single mother, interested in children ministry',
    createdAt: '2024-01-07'
  }
];

export const mockDepartmentAssignments: DepartmentAssignment[] = [
  {
    id: 1,
    memberId: 3,
    departmentName: 'Media Ministry',
    assignedBy: 1,
    assignedDate: '2024-01-05',
    status: 'pending',
    type: 'assignment',
    reason: 'Has skills in video editing and graphics'
  },
  {
    id: 2,
    memberId: 2,
    departmentName: 'Children Ministry',
    assignedBy: 1,
    assignedDate: '2024-01-03',
    approvedBy: 1,
    approvedDate: '2024-01-04',
    status: 'approved',
    type: 'transfer',
    reason: 'Requested transfer to work with children'
  }
];

export const departments = [
  'Worship Ministry',
  'Youth Ministry',
  'Children Ministry',
  'Media Ministry',
  'Ushering',
  'Security',
  'Counseling',
  'Evangelism',
  'Prayer Ministry',
  'Finance',
  'Administration'
];
