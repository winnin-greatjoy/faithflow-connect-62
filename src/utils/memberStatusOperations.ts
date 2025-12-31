// src/utils/memberStatusOperations.ts
import { supabase } from '@/integrations/supabase/client';

interface UpgradeTooBaptizedParams {
    memberId: string;
    email: string;
    password?: string;
    sendWelcomeEmail?: boolean;
}

interface UpgradeResult {
    success: boolean;
    message?: string;
    error?: string;
    accountCreated?: boolean;
    tempPassword?: string;
}

/**
 * Upgrade a member to baptized status and create their login account
 */
export async function upgradeMemberToBaptized(
    params: UpgradeTooBaptizedParams
): Promise<UpgradeResult> {
    try {
        const { data, error } = await supabase.functions.invoke('upgrade-member-status', {
            body: {
                memberId: params.memberId,
                newLevel: 'baptized',
                email: params.email,
                password: params.password,
                sendWelcomeEmail: params.sendWelcomeEmail ?? true,
            },
        });

        if (error) {
            console.error('Upgrade function error:', error);
            return {
                success: false,
                error: error.message || 'Failed to upgrade member',
            };
        }

        return data;
    } catch (err: any) {
        console.error('Failed to call upgrade function:', err);
        return {
            success: false,
            error: err.message || 'Failed to connect to server',
        };
    }
}

/**
 * Update member status without account creation
 */
export async function updateMemberStatus(
    memberId: string,
    newLevel: 'baptized' | 'convert' | 'visitor'
): Promise<UpgradeResult> {
    try {
        const { data, error } = await supabase.functions.invoke('upgrade-member-status', {
            body: {
                memberId,
                newLevel,
            },
        });

        if (error) {
            return {
                success: false,
                error: error.message || 'Failed to update status',
            };
        }

        return data;
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to connect to server',
        };
    }
}
