// src/modules/members/hooks/useMemberFilters.ts
import { useState, useMemo } from 'react';
import { filterMembers, filterFirstTimers } from '@/utils/memberFilters';
import type { Member, FirstTimer } from '@/types/membership';
import type { TabType, MemberFilters, MemberStats, PaginationConfig } from '../types';

const ITEMS_PER_PAGE = 20;

export interface UseMemberFiltersResult {
    // Filter state
    search: string;
    setSearch: (s: string) => void;
    activeTab: TabType;
    setActiveTab: (t: TabType) => void;
    membershipFilter: string;
    setMembershipFilter: (f: string) => void;
    branchFilter: string;
    setBranchFilter: (f: string) => void;

    // Pagination
    currentPage: number;
    setCurrentPage: (p: number) => void;
    pagination: PaginationConfig;

    // Applied filters
    filters: MemberFilters;

    // Filtering functions
    getFilteredMembers: (members: Member[]) => Member[];
    getFilteredFirstTimers: (firstTimers: FirstTimer[]) => FirstTimer[];

    // Statistics
    calculateStats: (members: Member[], firstTimers: FirstTimer[]) => MemberStats;
}

/**
 * Hook for managing all filtering, searching, and pagination logic
 */
export function useMemberFilters(initialBranchId?: string): UseMemberFiltersResult {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [membershipFilter, setMembershipFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState(initialBranchId || 'all');
    const [currentPage, setCurrentPage] = useState(1);

    // Combined filters object
    const filters: MemberFilters = useMemo(() => ({
        search,
        activeTab,
        membershipFilter,
        branchFilter,
        currentPage,
    }), [search, activeTab, membershipFilter, branchFilter, currentPage]);

    // Filter members
    const getFilteredMembers = useMemo(() => (members: Member[]) => {
        return filterMembers(members, activeTab, search, membershipFilter, branchFilter);
    }, [activeTab, search, membershipFilter, branchFilter]);

    // Filter first-timers
    const getFilteredFirstTimers = useMemo(() => (firstTimers: FirstTimer[]) => {
        return filterFirstTimers(firstTimers, search, branchFilter);
    }, [search, branchFilter]);

    // Calculate statistics
    const calculateStats = useMemo(() => (members: Member[], firstTimers: FirstTimer[]): MemberStats => {
        const workers = members.filter(
            (m) => m.membershipLevel === 'baptized' && m.baptizedSubLevel === 'worker'
        ).length;

        const disciples = members.filter(
            (m) => m.membershipLevel === 'baptized' && m.baptizedSubLevel === 'disciple'
        ).length;

        const leaders = members.filter(
            (m) => m.membershipLevel === 'baptized' && m.baptizedSubLevel === 'leader'
        ).length;

        const pastors = members.filter(
            (m) => m.leaderRole === 'pastor' || m.leaderRole === 'assistant_pastor'
        ).length;

        const converts = members.filter((m) => m.membershipLevel === 'convert').length;

        return {
            totalMembers: members.length,
            workers,
            disciples,
            leaders,
            pastors,
            converts,
            firstTimers: firstTimers.length,
        };
    }, []);

    // Pagination config - will be calculated based on filtered data
    const pagination: PaginationConfig = {
        currentPage,
        totalPages: 1, // To be calculated by consumer
        itemsPerPage: ITEMS_PER_PAGE,
        totalItems: 0, // To be calculated by consumer
    };

    return {
        search,
        setSearch,
        activeTab,
        setActiveTab,
        membershipFilter,
        setMembershipFilter,
        branchFilter,
        setBranchFilter,
        currentPage,
        setCurrentPage,
        pagination,
        filters,
        getFilteredMembers,
        getFilteredFirstTimers,
        calculateStats,
    };
}
