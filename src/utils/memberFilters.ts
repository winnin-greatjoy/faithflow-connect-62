// src/utils/memberFilters.ts
import { Member, FirstTimer, MembershipLevel } from '@/types/membership';
import type { TabType } from '@/modules/members/types';

/**
 * Check if a member matches the given tab filter
 */
export function memberMatchesTab(
    member: Member,
    tab: TabType
): boolean {
    switch (tab) {
        case 'all':
            return true;
        case 'workers':
            return (
                member.membershipLevel === 'baptized' &&
                ['worker', 'disciple'].includes(member.baptizedSubLevel ?? '')
            );
        case 'disciples':
            return member.membershipLevel === 'baptized' && member.baptizedSubLevel === 'disciple';
        case 'leaders':
            return member.membershipLevel === 'baptized' && member.baptizedSubLevel === 'leader';
        case 'pastors':
            return member.leaderRole === 'pastor' || member.leaderRole === 'assistant_pastor';
        case 'converts':
            return member.membershipLevel === 'convert';
        case 'visitors':
            return member.membershipLevel === 'visitor';
        case 'first_timers':
            return false; // First timers are in a separate data set
        default:
            return false;
    }
}

/**
 * Filter members based on tab, search term, membership level, and branch
 */
export function filterMembers(
    members: Member[],
    filters: {
        tab: TabType;
        searchTerm: string;
        membershipLevel?: string;
        branchId?: string;
    }
): Member[] {
    const q = (filters.searchTerm || '').toLowerCase();

    return members.filter((member) => {
        // Tab filtering
        const matchesTab = memberMatchesTab(member, filters.tab);

        // Search filtering
        const matchesSearch =
            !filters.searchTerm ||
            member.fullName?.toLowerCase().includes(q) ||
            (member.email && member.email.toLowerCase().includes(q)) ||
            (member.phone && member.phone.includes(filters.searchTerm));

        // Membership level filtering
        const matchesMembership =
            !filters.membershipLevel ||
            filters.membershipLevel === 'all' ||
            member.membershipLevel === filters.membershipLevel;

        // Branch filtering
        const matchesBranch =
            !filters.branchId ||
            filters.branchId === 'all' ||
            member.branchId === filters.branchId;

        return matchesTab && matchesSearch && matchesMembership && matchesBranch;
    });
}

/**
 * Filter first timers based on search term and branch
 */
export function filterFirstTimers(
    firstTimers: FirstTimer[],
    filters: {
        searchTerm: string;
        branchId?: string;
    }
): FirstTimer[] {
    const q = (filters.searchTerm || '').toLowerCase();

    return firstTimers.filter((ft) => {
        // Search filtering
        const matchesSearch =
            !filters.searchTerm ||
            ft.fullName?.toLowerCase().includes(q) ||
            (ft.phone && ft.phone.includes(filters.searchTerm));

        // Branch filtering
        const matchesBranch =
            !filters.branchId ||
            filters.branchId === 'all' ||
            ft.branchId === filters.branchId;

        return matchesSearch && matchesBranch;
    });
}
