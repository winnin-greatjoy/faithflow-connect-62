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
    role: 'super_admin' | 'admin' | 'pastor' | 'leader' | 'worker' | 'member';
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
            .from('profiles')
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

                // Extract account creation, children data, and admin role data
                const {
                    createAccount, username, password, children,
                    assignAdminRole, adminRole, adminBranchId, adminDistrictId,
                } = data;

                // Build memberData with only valid columns for the members table
                // This prevents errors from extra form fields that don't exist in the table
                const memberData: any = {
                    full_name: data.full_name,
                    email: data.email || null,
                    phone: data.phone || null,
                    date_of_birth: data.date_of_birth || null,
                    gender: data.gender || null,
                    marital_status: data.marital_status || null,
                    branch_id: data.branch_id || null,
                    membership_level: data.membership_level || 'baptized',
                    join_date: data.join_date || new Date().toISOString().split('T')[0],
                };

                // Ensure branch_id is set correctly for branch admins
                if (profile.role === 'branch_admin' && !memberData.branch_id) {
                    memberData.branch_id = profile.branch_id;
                }

                console.log('Step 1: Built memberData:', JSON.stringify(memberData));

                // Handle account creation if requested
                let authUserId = null;
                if (createAccount && username && password && target === 'members') {
                    console.log('Step 2: Starting account creation for:', username);
                    try {
                        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
                            email: username,
                            password: password,
                            email_confirm: true,
                            user_metadata: {
                                full_name: memberData.full_name,
                                branch_id: memberData.branch_id,
                            }
                        });

                        if (authError) {
                            console.error('Step 2a: Account creation error:', JSON.stringify(authError));
                            // Continue without account if it fails
                        } else {
                            authUserId = authData.user.id;
                            console.log('Step 2b: Auth user created with ID:', authUserId);

                            // Determine role for profile based on admin assignment
                            const profileRole = assignAdminRole && adminRole ? adminRole : 'member';
                            console.log('Step 3: Creating profile with role:', profileRole);

                            // Create profile for the new user
                            const { error: profileError } = await supabaseClient.from('profiles').insert({
                                id: authUserId,
                                first_name: memberData.full_name.split(' ')[0] || '',
                                last_name: memberData.full_name.split(' ').slice(1).join(' ') || '',
                                phone: memberData.phone,
                                branch_id: memberData.branch_id,
                                role: profileRole,
                            });

                            if (profileError) {
                                console.error('Step 3a: Profile creation error:', JSON.stringify(profileError));
                            } else {
                                console.log('Step 3b: Profile created successfully');
                            }

                            // Create user_roles entry if admin role is assigned
                            if (assignAdminRole && adminRole) {
                                console.log('Step 4: Creating user_roles entry for role:', adminRole);
                                const userRoleData: any = {
                                    user_id: authUserId,
                                    role: adminRole,
                                };

                                // Set branch_id for branch-specific roles
                                if (adminRole === 'admin' || adminRole === 'pastor') {
                                    userRoleData.branch_id = adminBranchId || memberData.branch_id || null;
                                }

                                // Set district_id for district-specific roles (if column exists)
                                if (adminRole === 'district_admin' || adminRole === 'district_overseer') {
                                    userRoleData.district_id = adminDistrictId || null;
                                }

                                const { error: roleError } = await supabaseClient.from('user_roles').insert(userRoleData);
                                if (roleError) {
                                    console.error('Step 4a: user_roles insert error:', JSON.stringify(roleError));
                                } else {
                                    console.log('Step 4b: user_roles created successfully');
                                }
                            }
                        }
                    } catch (accountError) {
                        console.error('Step 2-CATCH: Account creation failed:', accountError);
                        // Continue creating member without account
                    }
                }

                // Create member/first-timer record
                console.log('Step 5: Inserting into', tableName, 'with data:', JSON.stringify(memberData));
                const { data: created, error: createError } = await supabaseClient
                    .from(tableName)
                    .insert(memberData)
                    .select()
                    .single();

                if (createError) {
                    console.error('Step 5a: Member insert error:', JSON.stringify(createError));
                    throw createError;
                }
                console.log('Step 5b: Member created successfully:', JSON.stringify(created));
                result = created;

                // Handle children records if provided
                if (children && Array.isArray(children) && children.length > 0 && target === 'members') {
                    const childRows = children.map((c: any) => ({
                        member_id: created.id,
                        name: c.name,
                        date_of_birth: c.dateOfBirth,
                        gender: c.gender,
                        notes: c.notes || null,
                    }));

                    await supabaseClient.from('children').insert(childRows);
                }

                // Log audit trail
                await logAudit(supabaseClient, {
                    user_id: user.id,
                    action: 'create',
                    table: tableName,
                    record_id: created.id,
                    details: { data: memberData, accountCreated: !!authUserId, childrenCount: children?.length || 0 },
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
        console.error('Error in member-operations:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return new Response(
            JSON.stringify({ error: errorMessage, details: String(error) }),
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
    if (profile.role === 'super_admin') {
        return { allowed: true };
    }

    // Branch admins (admin role) have restrictions
    if (profile.role === 'admin' || profile.role === 'pastor') {
        // Can only work with their own branch
        if (data && data.branch_id && data.branch_id !== profile.branch_id) {
            return { allowed: false, reason: 'Admins can only modify records in their branch' };
        }

        if (targetBranchId && targetBranchId !== profile.branch_id) {
            return { allowed: false, reason: 'Admins cannot transfer to other branches' };
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
