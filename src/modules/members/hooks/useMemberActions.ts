// src/modules/members/hooks/useMemberActions.ts
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    createMember as apiCreateMember,
    updateMember as apiUpdateMember,
    deleteMember as apiDeleteMember,
    createFirstTimer as apiCreateFirstTimer,
    updateFirstTimer as apiUpdateFirstTimer,
    deleteFirstTimer as apiDeleteFirstTimer,
} from '@/utils/memberOperations';
import type { ActionResult } from '../types';

export interface UseMemberActionsResult {
    // Member actions
    createMember: (data: any) => Promise<ActionResult>;
    updateMember: (id: string, data: any) => Promise<ActionResult>;
    deleteMember: (id: string) => Promise<ActionResult>;

    // First-timer actions
    createFirstTimer: (data: any) => Promise<ActionResult>;
    updateFirstTimer: (id: string, data: any) => Promise<ActionResult>;
    deleteFirstTimer: (id: string) => Promise<ActionResult>;
}

/**
 * Hook for all CRUD operations via Edge Function
 * Includes toast notifications
 */
export function useMemberActions(): UseMemberActionsResult {
    const { toast } = useToast();

    const createMember = useCallback(async (data: any): Promise<ActionResult> => {
        const result = await apiCreateMember(data);

        if (result.success) {
            toast({
                title: 'Member created',
                description: 'The member has been added successfully.',
            });
        } else {
            toast({
                title: 'Failed to create member',
                description: result.error || 'An error occurred',
                variant: 'destructive',
            });
        }

        return result;
    }, [toast]);

    const updateMember = useCallback(async (id: string, data: any): Promise<ActionResult> => {
        const result = await apiUpdateMember(id, data);

        if (result.success) {
            toast({
                title: 'Member updated',
                description: 'Changes have been saved.',
            });
        } else {
            toast({
                title: 'Failed to update member',
                description: result.error || 'An error occurred',
                variant: 'destructive',
            });
        }

        return result;
    }, [toast]);

    const deleteMember = useCallback(async (id: string): Promise<ActionResult> => {
        const result = await apiDeleteMember(id);

        if (result.success) {
            toast({
                title: 'Member deleted',
                description: 'The member has been removed.',
            });
        } else {
            toast({
                title: 'Failed to delete member',
                description: result.error || 'An error occurred',
                variant: 'destructive',
            });
        }

        return result;
    }, [toast]);

    const createFirstTimer = useCallback(async (data: any): Promise<ActionResult> => {
        const result = await apiCreateFirstTimer(data);

        if (result.success) {
            toast({
                title: 'First-timer added',
                description: 'The visitor has been recorded.',
            });
        } else {
            toast({
                title: 'Failed to add first-timer',
                description: result.error || 'An error occurred',
                variant: 'destructive',
            });
        }

        return result;
    }, [toast]);

    const updateFirstTimer = useCallback(async (id: string, data: any): Promise<ActionResult> => {
        const result = await apiUpdateFirstTimer(id, data);

        if (result.success) {
            toast({
                title: 'First-timer updated',
                description: 'Changes have been saved.',
            });
        } else {
            toast({
                title: 'Failed to update first-timer',
                description: result.error || 'An error occurred',
                variant: 'destructive',
            });
        }

        return result;
    }, [toast]);

    const deleteFirstTimer = useCallback(async (id: string): Promise<ActionResult> => {
        const result = await apiDeleteFirstTimer(id);

        if (result.success) {
            toast({
                title: 'First-timer deleted',
                description: 'The visitor has been removed.',
            });
        } else {
            toast({
                title: 'Failed to delete first-timer',
                description: result.error || 'An error occurred',
                variant: 'destructive',
            });
        }

        return result;
    }, [toast]);

    return {
        createMember,
        updateMember,
        deleteMember,
        createFirstTimer,
        updateFirstTimer,
        deleteFirstTimer,
    };
}
