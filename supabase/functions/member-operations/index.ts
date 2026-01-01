// supabase/functions/member-operations/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* ============================================================================
   1. TYPES & CONSTANTS
   ============================================================================ */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type MemberCommand =
  | 'MEMBER_CREATE'
  | 'MEMBER_UPDATE'
  | 'MEMBER_DELETE'
  | 'MEMBER_BULK_TRANSFER'
  | 'ADMIN_CREATE'
  | 'FIRST_TIMER_CREATE'
  | 'FIRST_TIMER_UPDATE'
  | 'FIRST_TIMER_DELETE'
  | 'FIRST_TIMER_BULK_TRANSFER';

interface CommandRequest<T = any> {
  command: MemberCommand;
  payload: T;
}

interface CommandResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

/* ============================================================================
   2. BOOTSTRAP
   ============================================================================ */

const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SB_URL')!;
const serviceKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SB_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SB_ANON_KEY')!;

const adminClient = createClient(supabaseUrl, serviceKey);

/* ============================================================================
   3. HELPERS
   ============================================================================ */

function ok<T>(data?: T): CommandResponse<T> {
  return { success: true, data };
}

function fail(error: string, details?: string): CommandResponse {
  return { success: false, error, details };
}

async function getAuthUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const anonClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await anonClient.auth.getUser(token);

  if (error) {
    console.error('Auth User Error:', error);
    return null;
  }
  return data?.user ?? null;
}

async function getUserProfile(user_id: string) {
  const { data, error } = await adminClient
    .from('profiles')
    .select('*') // Be resilient to missing district_id
    .eq('id', user_id)
    .single();

  if (error) throw error;
  return data;
}

function assertScope(actor: any, payload: { branch_id?: string; district_id?: string }) {
  if (actor.role === 'super_admin') return;

  if (actor.role === 'district_admin') {
    if (payload.district_id && payload.district_id !== actor.district_id) {
      throw new Error('District scope violation');
    }
    return;
  }

  // Branch level actors
  if (['branch_admin', 'admin', 'pastor', 'leader'].includes(actor.role)) {
    if (payload.branch_id && payload.branch_id !== actor.branch_id) {
      throw new Error('Branch scope violation');
    }
    return;
  }

  throw new Error(`Unauthorized role: ${actor.role}`);
}

/**
 * Maps camelCase keys to snake_case and filters out invalid columns
 */
function pickMemberColumns(data: any) {
  const val = (key: string, camelKey: string) =>
    data[key] !== undefined ? data[key] : data[camelKey];

  const result: any = {
    full_name: val('full_name', 'fullName') || 'Unknown',
    email: val('email', 'email') || null,
    phone: val('phone', 'phone') || 'N/A',
    date_of_birth: val('date_of_birth', 'dateOfBirth') || new Date().toISOString().split('T')[0],
    gender: val('gender', 'gender') || 'male',
    marital_status: val('marital_status', 'maritalStatus') || 'single',
    branch_id: val('branch_id', 'branchId') || null,
    membership_level: val('membership_level', 'membershipLevel') || 'baptized',
    community: val('community', 'community') || 'N/A',
    area: val('area', 'area') || 'N/A',
    street: val('street', 'street') || 'N/A',
    date_joined: val('date_joined', 'joinDate') || new Date().toISOString().split('T')[0],
    status: val('status', 'status') || 'active',
    assigned_department: val('assigned_department', 'assignedDepartment') || null,
  };

  // Optional fields
  if (val('spouse_name', 'spouseName')) result.spouse_name = val('spouse_name', 'spouseName');
  if (val('number_of_children', 'numberOfChildren') !== undefined)
    result.number_of_children = Number(val('number_of_children', 'numberOfChildren')) || 0;
  if (val('public_landmark', 'publicLandmark'))
    result.public_landmark = val('public_landmark', 'publicLandmark');
  if (val('baptized_sub_level', 'baptizedSubLevel'))
    result.baptized_sub_level = val('baptized_sub_level', 'baptizedSubLevel');
  if (val('leader_role', 'leaderRole')) result.leader_role = val('leader_role', 'leaderRole');
  if (val('baptism_date', 'baptismDate')) result.baptism_date = val('baptism_date', 'baptismDate');
  if (val('baptism_officiator', 'baptismOfficiator'))
    result.baptism_officiator = val('baptism_officiator', 'baptismOfficiator');
  if (val('spiritual_mentor', 'spiritualMentor'))
    result.spiritual_mentor = val('spiritual_mentor', 'spiritualMentor');
  if (val('discipleship_class_1', 'discipleshipClass1') !== undefined)
    result.discipleship_class_1 = !!val('discipleship_class_1', 'discipleshipClass1');
  if (val('discipleship_class_2', 'discipleshipClass2') !== undefined)
    result.discipleship_class_2 = !!val('discipleship_class_2', 'discipleshipClass2');
  if (val('discipleship_class_3', 'discipleshipClass3') !== undefined)
    result.discipleship_class_3 = !!val('discipleship_class_3', 'discipleshipClass3');
  if (val('ministry', 'ministry')) result.ministry = val('ministry', 'ministry');
  if (val('prayer_needs', 'prayerNeeds')) result.prayer_needs = val('prayer_needs', 'prayerNeeds');
  if (val('pastoral_notes', 'pastoralNotes'))
    result.pastoral_notes = val('pastoral_notes', 'pastoralNotes');
  if (val('last_attendance', 'lastAttendance'))
    result.last_attendance = val('last_attendance', 'lastAttendance');

  return result;
}

async function logAudit(
  userId: string,
  action: string,
  table: string,
  recordId: string | null,
  details: any
) {
  try {
    const payload: any = {
      user_id: userId,
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      created_at: new Date().toISOString(),
    };
    payload.table_name = table;
    payload.resource = table;

    if (
      recordId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recordId)
    ) {
      payload.record_id = recordId;
    }

    await adminClient.from('audit_logs').insert(payload);
  } catch (e) {
    console.error('Audit log failed:', e);
  }
}

/* ============================================================================
   4. COMMAND HANDLERS
   ============================================================================ */

const handlers: Record<MemberCommand, (actor: any, payload: any) => Promise<any>> = {
  /* ------------------ MEMBERS ------------------ */

  async MEMBER_CREATE(actor, payload) {
    assertScope(actor, payload);
    const memberData = pickMemberColumns(payload);

    // Auto-fill branch if actor is branch level
    if (!memberData.branch_id && actor.branch_id) {
      memberData.branch_id = actor.branch_id;
    }

    const { error, data } = await adminClient.from('members').insert(memberData).select().single();

    if (error) throw error;
    await logAudit(actor.id, 'create', 'members', data.id, { data: memberData });
    return data;
  },

  async MEMBER_UPDATE(actor, payload) {
    const { id, data } = payload;
    if (!id) throw new Error('Missing ID');

    // Scope check: fetch target if needed or check payload
    const { data: target } = await adminClient
      .from('members')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (!target) throw new Error('Member not found');
    assertScope(actor, { branch_id: target.branch_id });

    const updateData = pickMemberColumns(data);
    const { error, data: updated } = await adminClient
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await logAudit(actor.id, 'update', 'members', id, { data: updateData });
    return updated;
  },

  async MEMBER_DELETE(actor, payload) {
    const { id } = payload;
    if (!id) throw new Error('Missing ID');

    const { data: target } = await adminClient
      .from('members')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (!target) throw new Error('Member not found');
    assertScope(actor, { branch_id: target.branch_id });

    const { error } = await adminClient.from('members').delete().eq('id', id);

    if (error) throw error;
    await logAudit(actor.id, 'delete', 'members', id, {});
    return true;
  },

  async MEMBER_BULK_TRANSFER(actor, payload) {
    const { ids, target_branch_id } = payload;
    if (!ids?.length || !target_branch_id) throw new Error('Missing ids or target_branch_id');

    // Only super/district admins usually do this
    if (!['super_admin', 'district_admin'].includes(actor.role)) {
      throw new Error('Only super/district admins can perform bulk transfers');
    }

    const { error, data } = await adminClient
      .from('members')
      .update({ branch_id: target_branch_id })
      .in('id', ids)
      .select();

    if (error) throw error;
    await logAudit(actor.id, 'bulk_transfer', 'members', null, {
      ids,
      target_branch_id,
      count: data.length,
    });
    return data.length;
  },

  /* ------------------ ADMINS ------------------ */

  async ADMIN_CREATE(actor: any, payload: any) {
    if (actor.role !== 'super_admin') {
      throw new Error('Only super admin can create admins');
    }

    const { email, role, full_name, phone, branch_id, district_id } = payload;
    let { password } = payload;

    if (!email || !role) throw new Error('Missing email or role');

    // Generate random password if missing
    if (!password) {
      password = Math.random().toString(36).slice(-10) + 'A1!';
      console.log(`[ADMIN_CREATE] Generated temporary password for ${email}: ${password}`);
    }

    const { data: user, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, branch_id, district_id },
    });

    if (error) throw error;

    // Profile
    const { error: profileError } = await adminClient.from('profiles').insert({
      id: user.user.id,
      first_name: full_name?.split(' ')[0] || '',
      last_name: full_name?.split(' ').slice(1).join(' ') || '',
      role,
      phone,
      branch_id,
      district_id,
    });
    if (profileError) throw profileError;

    // Roles
    await adminClient.from('user_roles').insert({
      user_id: user.user.id,
      role,
      branch_id,
      district_id,
    });

    await logAudit(actor.id, 'create_admin', 'users', user.user.id, { email, role });
    return user.user;
  },

  /* ------------------ FIRST TIMERS ------------------ */

  async FIRST_TIMER_CREATE(actor, payload) {
    assertScope(actor, payload);

    const { error, data } = await adminClient
      .from('first_timers')
      .insert({
        ...payload,
        branch_id: payload.branch_id ?? actor.branch_id,
      })
      .select()
      .single();

    if (error) throw error;
    await logAudit(actor.id, 'create', 'first_timers', data.id, { data: payload });
    return data;
  },

  async FIRST_TIMER_UPDATE(actor, payload) {
    const { id, data } = payload;
    const { data: target } = await adminClient
      .from('first_timers')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (!target) throw new Error('Record not found');
    assertScope(actor, { branch_id: target.branch_id });

    const { error, data: updated } = await adminClient
      .from('first_timers')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async FIRST_TIMER_DELETE(actor, payload) {
    const { id } = payload;
    const { data: target } = await adminClient
      .from('first_timers')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (!target) throw new Error('Record not found');
    assertScope(actor, { branch_id: target.branch_id });

    const { error } = await adminClient.from('first_timers').delete().eq('id', id);

    if (error) throw error;
    return true;
  },

  async FIRST_TIMER_BULK_TRANSFER(actor, payload) {
    const { ids, target_branch_id } = payload;
    if (!['super_admin', 'district_admin'].includes(actor.role)) {
      throw new Error('Unauthorized for bulk transfer');
    }

    const { error, data } = await adminClient
      .from('first_timers')
      .update({ branch_id: target_branch_id })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data.length;
  },
};

/* ============================================================================
   5. ROUTER
   ============================================================================ */

serve(async (req) => {
  // CORS check
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as CommandRequest;
    if (!body?.command) {
      return new Response(JSON.stringify(fail('Invalid command payload')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = await getAuthUser(req);
    if (!user) {
      return new Response(JSON.stringify(fail('Unauthorized')), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const actor = await getUserProfile(user.id);

    const handler = (handlers as any)[body.command];
    if (!handler) {
      return new Response(JSON.stringify(fail('Unsupported command')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await handler(actor, body.payload);
    return new Response(JSON.stringify(ok(result)), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[MemberOps v2]', err);
    return new Response(JSON.stringify(fail('Operation failed', err.message || String(err))), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
