import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SB_URL')!;
    const serviceKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SB_SERVICE_ROLE_KEY')!;

    // Create service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Get current user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseUserClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Fetch caller's profile to verify they are a super_admin or district_admin
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, id')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile) throw new Error('Failed to fetch caller profile');

    const allowedRoles = ['super_admin', 'district_admin'];
    if (!allowedRoles.includes(callerProfile.role)) {
      throw new Error('Forbidden: Insufficient privileges');
    }

    const { action, payload } = await req.json();

    if (!action || !payload) throw new Error('Missing action or payload');

    let result;

    if (action === 'ASSIGN_ROLE') {
      const { userId, role, roleId, branchId, departmentId, ministryId } = payload;

      // Validation
      if (!userId || (!role && !roleId)) throw new Error('Missing userId or role/roleId');

      // Scope checks
      if (callerProfile.role === 'district_admin') {
        if (role === 'super_admin' || role === 'district_admin' || role === 'district_overseer') {
          throw new Error('District Admins cannot assign system level roles');
        }
      }

      // 1. Insert into user_roles
      const insertPayload: any = {
        user_id: userId,
        branch_id: branchId || null,
        department_id: departmentId || null,
        ministry_id: ministryId || null,
      };

      if (role) insertPayload.role = role;
      if (roleId) insertPayload.role_id = roleId;

      const { error: insertError } = await supabaseAdmin.from('user_roles').insert(insertPayload);

      if (insertError) throw insertError;

      // 2. If it's a system role (enum based), update profiles table too
      if (role) {
        const systemRoles = [
          'super_admin',
          'district_admin',
          'district_overseer',
          'general_overseer',
        ];
        if (systemRoles.includes(role)) {
          await supabaseAdmin.from('profiles').update({ role: role }).eq('id', userId);
        }
      }

      // 3. Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        action: 'ASSIGN_ROLE',
        table_name: 'user_roles',
        user_id: user.id,
        details: { message: `Assigned role ${role} to user ${userId}`, payload },
      });

      result = { success: true };
    } else if (action === 'REVOKE_ROLE') {
      const { roleId } = payload;
      if (!roleId) throw new Error('Missing roleId');

      // Fetch role to be deleted to log details and maybe check permissions
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('id', roleId)
        .single();

      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (deleteError) throw deleteError;

      // Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        action: 'REVOKE_ROLE',
        table_name: 'user_roles',
        user_id: user.id,
        record_id: roleId,
        details: {
          message: `Revoked role ${roleData?.role} from user ${roleData?.user_id}`,
          previous_data: roleData,
        },
      });

      result = { success: true };
    } else if (action === 'UPDATE_ROLE') {
      const { roleId, role, branchId } = payload;
      if (!roleId || !role) throw new Error('Missing roleId or role');

      const { error: updateError } = await supabaseAdmin
        .from('user_roles')
        .update({ role, branch_id: branchId })
        .eq('id', roleId);

      if (updateError) throw updateError;

      // Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        action: 'UPDATE_ROLE',
        table_name: 'user_roles',
        user_id: user.id,
        record_id: roleId,
        details: { message: `Updated role ${roleId} to ${role}`, payload },
      });

      result = { success: true };
    } else {
      throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
