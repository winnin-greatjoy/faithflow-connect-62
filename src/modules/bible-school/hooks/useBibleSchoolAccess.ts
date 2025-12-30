// src/modules/bible-school/hooks/useBibleSchoolAccess.ts
// Hook to determine user's access level for Bible School features
import { useMemo } from 'react';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { useAuthz } from '@/hooks/useAuthz';
import { useAdminContext } from '@/context/AdminContext';

export interface BibleSchoolAccessLevel {
    // Can view Bible School module at all
    canView: boolean;

    // Full management access (super_admin or district_admin)
    isFullAdmin: boolean;

    // Branch admin - can manage Foundation only
    isBranchAdmin: boolean;

    // Read-only viewer (for non-Foundation programs)
    isReadOnly: boolean;

    // Current user's branch ID (for filtering)
    userBranchId: string | null;

    // Foundation program level_order for comparison
    foundationLevel: number;

    // Check if user can manage a specific program level
    canManageProgram: (levelOrder: number) => boolean;

    // Check if user can create cohorts for a program
    canCreateCohort: (programLevelOrder: number) => boolean;

    // Check if user can edit a cohort
    canEditCohort: (cohortBranchId: string | null, programLevelOrder: number) => boolean;
}

export function useBibleSchoolAccess(): BibleSchoolAccessLevel {
    const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
    const { hasRole, can } = useAuthz();
    const { selectedBranchId } = useAdminContext();

    const accessLevel = useMemo<BibleSchoolAccessLevel>(() => {
        // Foundation is level 1
        const FOUNDATION_LEVEL = 1;

        // Super admin has full access to everything
        const isFullAdmin = isSuperadmin || hasRole('district_admin');

        // Branch admin role
        const isBranchAdmin = hasRole('admin') && !isSuperadmin;

        // Can view if any of the above or has bible_school view permission
        const canView = isFullAdmin || isBranchAdmin || can('bible_school', 'view');

        // Read-only is true for branch admins viewing non-Foundation programs
        const isReadOnly = isBranchAdmin && !isFullAdmin;

        // Get user's branch ID
        const userBranchId = selectedBranchId || null;

        return {
            canView,
            isFullAdmin,
            isBranchAdmin,
            isReadOnly,
            userBranchId,
            foundationLevel: FOUNDATION_LEVEL,

            // Check if user can manage a specific program level
            canManageProgram: (levelOrder: number) => {
                if (isFullAdmin) return true;
                if (isBranchAdmin) {
                    // Branch admins can only manage Foundation (level 1)
                    return levelOrder === FOUNDATION_LEVEL;
                }
                return false;
            },

            // Check if user can create cohorts for a program
            canCreateCohort: (programLevelOrder: number) => {
                if (isFullAdmin) return true;
                if (isBranchAdmin) {
                    // Branch admins can only create cohorts for Foundation
                    return programLevelOrder === FOUNDATION_LEVEL;
                }
                return false;
            },

            // Check if user can edit a cohort
            canEditCohort: (cohortBranchId: string | null, programLevelOrder: number) => {
                if (isFullAdmin) return true;
                if (isBranchAdmin) {
                    // Branch admin can edit if:
                    // 1. It's a Foundation program
                    // 2. The cohort belongs to their branch
                    return programLevelOrder === FOUNDATION_LEVEL &&
                        cohortBranchId === userBranchId;
                }
                return false;
            },
        };
    }, [isSuperadmin, hasRole, can, selectedBranchId]);

    return accessLevel;
}
