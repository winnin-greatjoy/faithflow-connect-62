import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MemberOperationRequest {
    operation: 'create' | 'update' | 'delete' | 'bulk_transfer';
    target: 'members' | 'first_timers';
    data?: any;
    id?: string;
    ids?: string[];
    targetBranchId?: string;
}

interface UserProfile {
    id: string;
    role: 'superadmin' | 'branch_admin' | 'member';
    branch_id: string | null;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create Supabase client with user's token
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Client for auth validation (using user token)
        const token = authHeader.replace('Bearer ', '');
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
            },
        });

        // Verify user authentication
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid authentication token' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get user profile and role
        const { data: profile, error: profileError } = await supabaseClient
            .from('admin_users')
            .select('id, role, branch_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return new Response(
                JSON.stringify({ error: 'User profile not found or not an admin' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parse request body
        const body: MemberOperationRequest = await req.json();
        const { operation, target, data, id, ids, targetBranchId } = body;

        // Validate permissions
        const canPerform = validatePermissions(profile as UserProfile, operation, target, data, targetBranchId);
        if (!canPerform.allowed) {
            return new Response(
                JSON.stringify({ error: canPerform.reason }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Perform the operation
        let result;
        const tableName = target === 'members' ? 'members' : 'first_timers';

        switch (operation) {
            case 'create':
                // Validate required fields
                if (!data) {
                    throw new Error('Missing data for create operation');
                }

                // Ensure branch_id is set correctly
                if (profile.role === 'branch_admin' && !data.branch_id) {
                    data.branch_id = profile.branch_id;
                }

                const { data: created, error: createError } = await supabaseClient
                    .from(tableName)
                    .insert(data)
                    .select()
                    .single();

                if (createError) throw createError;
                result = created;

                // Log audit trail
                await logAudit(supabaseClient, {
                    user_id: user.id,
                    action: 'create',
                    table: tableName,
                    record_id: created.id,
                    details: { data },
                });
                break;

            case 'update':
                if (!id || !data) {
                    throw new Error('Missing id or data for update operation');
                }

                const { data: updated, error: updateError } = await supabaseClient
                    .from(tableName)
                    .update(data)
                    .eq('id', id)
                    .select()
                    .single();

                if (updateError) throw updateError;
                result = updated;

                // Log audit trail
                await logAudit(supabaseClient, {
                    user_id: user.id,
                    action: 'update',
                    table: tableName,
                    record_id: id,
                    details: { data },
                });
                break;

            case 'delete':
                if (!id) {
                    throw new Error('Missing id for delete operation');
                }

                const { error: deleteError } = await supabaseClient
                    .from(tableName)
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;
                result = { success: true, id };

                // Log audit trail
                await logAudit(supabaseClient, {
                    user_id: user.id,
                    action: 'delete',
                    table: tableName,
                    record_id: id,
                    details: {},
                });
                break;

            case 'bulk_transfer':
                if (!ids || !targetBranchId) {
                    throw new Error('Missing ids or targetBranchId for bulk transfer');
                }

                const { data: transferred, error: transferError } = await supabaseClient
                    .from(tableName)
                    .update({ branch_id: targetBranchId })
                    .in('id', ids)
                    .select();

                if (transferError) throw transferError;
                result = { success: true, transferred: transferred.length, records: transferred };

                // Log audit trail
                await logAudit(supabaseClient, {
                    user_id: user.id,
                    action: 'bulk_transfer',
                    table: tableName,
                    record_id: null,
                    details: { ids, targetBranchId, count: transferred.length },
                });
                break;

            default:
                throw new Error(`Unknown operation: ${operation}`);
        }

        return new Response(
            JSON.stringify({ success: true, data: result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in member-operations:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * Validate if user has permission to perform the operation
 */
function validatePermissions(
    profile: UserProfile,
    operation: string,
    target: string,
    data?: any,
    targetBranchId?: string
): { allowed: boolean; reason?: string } {
    // Superadmins can do anything
    if (profile.role === 'superadmin') {
        return { allowed: true };
    }

    // Branch admins have restrictions
    if (profile.role === 'branch_admin') {
        // Can only work with their own branch
        if (data && data.branch_id && data.branch_id !== profile.branch_id) {
            return { allowed: false, reason: 'Branch admins can only modify records in their branch' };
        }

        if (targetBranchId && targetBranchId !== profile.branch_id) {
            return { allowed: false, reason: 'Branch admins cannot transfer to other branches' };
        }

        // Can perform all operations within their branch
        return { allowed: true };
    }

    // Regular members cannot perform write operations
    return { allowed: false, reason: 'Insufficient permissions' };
}

/**
 * Log audit trail for the operation
 */
async function logAudit(
    supabaseClient: any,
    audit: {
        user_id: string;
        action: string;
        table: string;
        record_id: string | null;
        details: any;
    }
) {
    try {
        await supabaseClient
            .from('audit_logs')
            .insert({
                user_id: audit.user_id,
                action: audit.action,
                table_name: audit.table,
                record_id: audit.record_id,
                details: audit.details,
                created_at: new Date().toISOString(),
            });
    } catch (error) {
        console.error('Failed to log audit trail:', error);
        // Don't fail the operation if audit logging fails
    }
}
