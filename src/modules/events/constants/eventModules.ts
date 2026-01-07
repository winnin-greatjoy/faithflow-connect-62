import {
    Users,
    CheckCircle2,
    ClipboardList,
    Bed,
    Users2,
    ShieldCheck,
    Music2,
    Package,
    Heart,
    MessageSquare,
    Wallet,
    BarChart3,
    CalendarDays,
    Activity,
    Stethoscope
} from 'lucide-react';

export interface EventModuleDefinition {
    id: string;
    label: string;
    category: 'Operations' | 'Workforce' | 'Program' | 'Engagement' | 'Finance' | 'Safety';
    description: string;
    icon: any;
    rolesRequired?: string[];
}

export const FEATURE_LIBRARY: EventModuleDefinition[] = [
    // Event Operations & Crowd Management
    {
        id: 'attendance',
        label: 'Attendance Manager',
        category: 'Operations',
        description: 'Digital check-ins (QR/NFC), real-time attendance tracking, and live headcounts.',
        icon: Activity,
    },
    {
        id: 'registration',
        label: 'Registration System',
        category: 'Operations',
        description: 'Customizable registration forms, ticketing, and capacity limits.',
        icon: ClipboardList,
    },
    {
        id: 'queue',
        label: 'Queue Manager',
        category: 'Operations',
        description: 'Virtual queuing, crowd flow monitoring, and wait-time notifications.',
        icon: CheckCircle2,
    },
    {
        id: 'accommodation',
        label: 'Accommodation Manager',
        category: 'Operations',
        description: 'Room allocation, occupancy tracking, guest assignments, and lodging logistics.',
        icon: Bed,
    },

    // Workforce & Volunteer Management
    {
        id: 'roster',
        label: 'Roster Manager',
        category: 'Workforce',
        description: 'Staff scheduling, shift assignments, and task tracking.',
        icon: Users2,
    },
    {
        id: 'safeguarding',
        label: 'Safeguarding Status',
        category: 'Safety',
        description: 'Tracks WWCC, police clearances, and safeguarding status for personnel.',
        icon: ShieldCheck,
    },
    {
        id: 'healthcare',
        label: 'Healthcare & First Aid',
        category: 'Safety',
        description: 'Incident reporting, medical team coordination, and dynamic first aid mapping.',
        icon: Stethoscope,
    },

    // Worship & Program Planning
    {
        id: 'worship_planner',
        label: 'Worship Planner',
        category: 'Program',
        description: 'End-to-end service flow, setlists, chord charts, and technical run sheets.',
        icon: Music2,
    },
    {
        id: 'assets',
        label: 'Asset Manager',
        category: 'Program',
        description: 'Tracks AV equipment, instruments, and furniture to prevent double-booking.',
        icon: Package,
    },

    // Child Safety
    {
        id: 'child_safety',
        label: 'Child Safety & Guardian',
        category: 'Safety',
        description: 'Matching security tags, medical notes, and automated guardian alerts.',
        icon: Heart,
    },

    // Member Engagement
    {
        id: 'pathways',
        label: 'Growth Pathways',
        category: 'Engagement',
        description: 'Tracks member milestones: baptism, leadership training, and onboarding.',
        icon: CalendarDays,
    },
    {
        id: 'prayer_manager',
        label: 'Prayer Request Manager',
        category: 'Engagement',
        description: 'Centralized prayer submission portal with assignment workflows.',
        icon: Heart,
    },

    // Giving & Finance
    {
        id: 'giving',
        label: 'Event Giving',
        category: 'Finance',
        description: 'Integrated giving forms for offerings, tithes, and pledges.',
        icon: Wallet,
    },
    {
        id: 'finance_reporting',
        label: 'Financial Reporting',
        category: 'Finance',
        description: 'Transparent fund accounting and departmentalized financial reports.',
        icon: BarChart3,
    },

    // Communication
    {
        id: 'staff_chat',
        label: 'Team Communication',
        category: 'Engagement',
        description: 'Event- and shift-specific communication channels for staff.',
        icon: MessageSquare,
    },
];
