// src/modules/members/types.ts
// Shared types for the members module

import type {
    Member,
    FirstTimer,
    MembershipLevel,
    BaptizedSubLevel,
    LeaderRole,
    Gender,
    MemberStatus
} from '@/types/membership';

// Re-export core types
export type { Member, FirstTimer };

// Tab types
export type TabType =
    | 'all'
    | 'workers'
    | 'disciples'
    | 'leaders'
    | 'pastors'
    | 'converts'
    | 'visitors';

// Filter configuration
export interface MemberFilters {
    search: string;
    activeTab: TabType;
    membershipFilter: string;
    branchFilter: string;
    currentPage: number;
}

// Statistics
export interface MemberStats {
    totalMembers: number;
    workers: number;
    disciples: number;
    leaders: number;
    pastors: number;
    converts: number;
    firstTimers: number;
}

// Pagination
export interface PaginationConfig {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
}

// Action result
export interface ActionResult {
    success: boolean;
    error?: string;
    data?: any;
}

// Selection state
export interface SelectionState {
    selectedMembers: string[];
    selectedFirstTimers: string[];
}
