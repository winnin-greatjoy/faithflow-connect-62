// src/utils/memberOperations.ts
import { supabase } from '@/integrations/supabase/client';
import { Member, FirstTimer } from '@/types/membership';

export type OperationType = 'create' | 'update' | 'delete' | 'bulk_transfer';
export type TargetType = 'members' | 'first_timers';

interface MemberOperationRequest {
    operation: OperationType;
    target: TargetType;
    data?: any;
    id?: string;
    ids?: string[];
    targetBranchId?: string;
}

interface MemberOperationResponse {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Call the member-operations Edge Function with proper error handling
 */
export async function callMemberOperation(
    request: MemberOperationRequest
): Promise<MemberOperationResponse> {
    try {
        const { data, error } = await supabase.functions.invoke('member-operations', {
            body: request,
        });

        if (error) {
            console.error('Edge Function error:', error);
            return {
                success: false,
                error: error.message || 'Unknown error occurred',
            };
        }

        return data;
    } catch (error: any) {
        console.error('Failed to call member-operations:', error);
        return {
            success: false,
            error: error.message || 'Failed to connect to server',
        };
    }
}

/**
 * Create a new member
 */
export async function createMember(data: Partial<Member>): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'create',
        target: 'members',
        data,
    });
}

/**
 * Update an existing member
 */
export async function updateMember(
    id: string,
    data: Partial<Member>
): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'update',
        target: 'members',
        id,
        data,
    });
}

/**
 * Delete a member
 */
export async function deleteMember(id: string): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'delete',
        target: 'members',
        id,
    });
}

/**
 * Create a new first-timer
 */
export async function createFirstTimer(
    data: Partial<FirstTimer>
): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'create',
        target: 'first_timers',
        data,
    });
}

/**
 * Update an existing first-timer
 */
export async function updateFirstTimer(
    id: string,
    data: Partial<FirstTimer>
): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'update',
        target: 'first_timers',
        id,
        data,
    });
}

/**
 * Delete a first-timer
 */
export async function deleteFirstTimer(id: string): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'delete',
        target: 'first_timers',
        id,
    });
}

/**
 * Bulk transfer members to a different branch
 */
export async function bulkTransferMembers(
    ids: string[],
    targetBranchId: string
): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'bulk_transfer',
        target: 'members',
        ids,
        targetBranchId,
    });
}

/**
 * Bulk transfer first-timers to a different branch
 */
export async function bulkTransferFirstTimers(
    ids: string[],
    targetBranchId: string
): Promise<MemberOperationResponse> {
    return callMemberOperation({
        operation: 'bulk_transfer',
        target: 'first_timers',
        ids,
        targetBranchId,
    });
}
