/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SB_URL')!;
const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Authenticate user
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const supabaseClient = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Check admin role
  const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
    role: 'admin',
    user_id: user.id,
  });

  if (roleError || !isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const { action, id, data, target } = await req.json();
    const table = target === 'first_timers' ? 'first_timers' : 'members';
    if (
      !action ||
      ((action === 'insert' || action === 'update') && !data) ||
      ((action === 'update' || action === 'delete') && !id)
    ) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'insert') {
      // Robust unique email guard
      if (data?.email) {
        const normalizedEmail = String(data.email).trim().toLowerCase();
        const { data: dup, error: dupErr } = await supabase
          .from('members')
          .select('id')
          .ilike('email', normalizedEmail)
          .limit(1);
        if (dupErr) {
          return new Response(
            JSON.stringify({ error: 'Failed to check for duplicate email: ' + dupErr.message }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        if ((dup || []).length > 0) {
          return new Response(
            JSON.stringify({ error: 'A member with this email already exists.' }),
            { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        data.email = normalizedEmail;
      }

      // Extract account creation fields
      const { createAccount, username, password, ...memberData } = data;

      // Create auth account if requested
      let authUserId = null;
      if (createAccount && username && password) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: memberData.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            username: username,
            full_name: memberData.full_name,
          },
        });

        if (authError) {
          return new Response(
            JSON.stringify({ error: 'Failed to create account: ' + authError.message }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        authUserId = authData.user.id;
      }

      // Insert member
      const { data: row, error } = await supabase
        .from('members')
        .insert(memberData)
        .select('id, full_name, email, phone, profile_photo, status, membership_level')
        .single();
      if (error) {
        // Rollback auth user if member creation failed
        if (authUserId) {
          await supabase.auth.admin.deleteUser(authUserId);
        }
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ ok: true, data: row }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'update') {
      const { data: row, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select('*')
        .single();
      if (error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      return new Response(JSON.stringify({ ok: true, data: row }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'delete') {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
