import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpgradeRequest {
    memberId: string;
    newLevel?: 'baptized' | 'convert' | 'visitor';
    email?: string;
    password?: string;
    sendWelcomeEmail?: boolean;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const token = authHeader.replace('Bearer ', '');

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });

        // Verify user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid authentication' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, branch_id')
            .eq('id', user.id)
            .single();

        if (!profile || !['super_admin', 'admin', 'pastor'].includes(profile.role)) {
            return new Response(
                JSON.stringify({ error: 'Insufficient permissions' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const body: UpgradeRequest = await req.json();
        const { memberId, newLevel, email, password, sendWelcomeEmail } = body;

        if (!memberId) {
            return new Response(
                JSON.stringify({ error: 'memberId is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get member
        const { data: member, error: memberError } = await supabase
            .from('members')
            .select('*, branch:church_branches(name)')
            .eq('id', memberId)
            .single();

        if (memberError || !member) {
            return new Response(
                JSON.stringify({ error: 'Member not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // If upgrading to baptized, create account
        if (newLevel === 'baptized' && !member.profile_id) {
            if (!email) {
                return new Response(
                    JSON.stringify({ error: 'Email is required for baptized members' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Generate password if not provided
            const finalPassword = password || generateTempPassword();

            // Create auth user
            const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
                email: email,
                password: finalPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: member.full_name,
                    member_id: memberId,
                    branch_id: member.branch_id,
                    role: 'member',
                }
            });

            if (authCreateError) {
                console.error('Auth creation error:', authCreateError);
                return new Response(
                    JSON.stringify({ error: `Failed to create account: ${authCreateError.message}` }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Profile is auto-created by trigger, but let's ensure member is linked
            await supabase
                .from('members')
                .update({
                    profile_id: authData.user.id,
                    membership_level: 'baptized',
                    email: email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', memberId);

            // Optionally send password reset email so user can set their own password
            if (sendWelcomeEmail) {
                await supabase.auth.admin.generateLink({
                    type: 'recovery',
                    email: email,
                });
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Member upgraded to baptized and account created',
                    accountCreated: true,
                    tempPassword: password ? undefined : finalPassword, // Only return if auto-generated
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Just update membership level (no account creation needed)
        const { error: updateError } = await supabase
            .from('members')
            .update({
                membership_level: newLevel || member.membership_level,
                updated_at: new Date().toISOString()
            })
            .eq('id', memberId);

        if (updateError) {
            return new Response(
                JSON.stringify({ error: updateError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Member status updated' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
