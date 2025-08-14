
// Women's Ministry Mock Data
export const mockWomensMinistryData = {
  stats: {
    totalMembers: 156,
    activeGroups: 12,
    upcomingEvents: 5,
    activeCases: 8,
    monthlyBudget: 3500,
    spent: 2100,
    publications: 6,
    completionRate: 89
  },
  groups: [
    {
      id: 1,
      name: 'Prayer Warriors',
      leader: 'Sister Mary Johnson',
      members: 15,
      nextMeeting: '2024-02-05',
      type: 'Prayer Group'
    },
    {
      id: 2,
      name: 'Young Mothers Circle',
      leader: 'Sister Grace Addo',
      members: 22,
      nextMeeting: '2024-02-07',
      type: 'Fellowship'
    }
  ],
  programs: [
    {
      id: 1,
      name: 'Discipleship Class Level 1',
      participants: 25,
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      status: 'active',
      completionRate: 85
    }
  ]
};

// Youth Ministry Mock Data
export const mockYouthMinistryData = {
  stats: {
    totalYouth: 248,
    teens: 89,
    youth: 102,
    youngAdults: 57,
    activeGroups: 8,
    upcomingEvents: 7,
    leadershipPipeline: 15,
    completionRate: 78
  },
  programs: [
    {
      id: 1,
      name: 'Leadership Development Track',
      participants: 15,
      ageGroup: '18-30',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      status: 'active',
      completionRate: 85,
      level: 'Advanced'
    }
  ],
  events: [
    {
      id: 1,
      title: 'Youth Retreat 2024',
      date: '2024-03-15',
      endDate: '2024-03-17',
      location: 'Camp Galilee',
      registered: 85,
      capacity: 100,
      type: 'Retreat'
    }
  ]
};

// Children's Ministry Mock Data
export const mockChildrensMinistryData = {
  stats: {
    totalChildren: 156,
    toddlers: 28,
    preschool: 45,
    primary: 63,
    juniors: 20,
    checkedInToday: 89,
    volunteersOnDuty: 12,
    incidentsThisMonth: 2
  },
  classes: [
    {
      id: 1,
      name: 'Tiny Tots (2-3 years)',
      teacher: 'Sister Mary Johnson',
      assistants: ['Brother Paul Wilson'],
      capacity: 15,
      enrolled: 14,
      avgAttendance: 12,
      nextClass: '2024-02-04T10:00:00Z'
    }
  ],
  volunteers: [
    {
      id: 1,
      name: 'Sister Mary Johnson',
      role: 'Lead Teacher',
      dbsStatus: 'valid',
      dbsExpiry: '2025-06-15',
      assignments: ['Tiny Tots'],
      hoursThisMonth: 24
    }
  ]
};
