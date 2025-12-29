// src/utils/memberFilters.ts
import { Member, FirstTimer, MembershipLevel } from '@/types/membership';

export type TabType = 'workers' | 'converts' | 'visitors';

/**
 * Check if a member matches the given tab filter
 */
export function memberMatchesTab(
    member: Member,
    tab: TabType
): boolean {
    switch (tab) {
        case 'workers':
            return (
                member.membershipLevel === 'baptized' &&
                ['worker', 'disciple'].includes(member.baptizedSubLevel ?? '')
            );
        case 'converts':
            return member.membershipLevel === 'convert';
        case 'visitors':
            // Visitors are handled separately as FirstTimers
            return false;
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
