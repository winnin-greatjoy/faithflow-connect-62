import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SB_URL')!;
const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceKey);

async function handleProvision() {
  const { data: jobs, error } = await supabase
    .from('account_provisioning_jobs')
    .select('id, member_id, status, type')
    .eq('status', 'pending')
    .limit(10);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });

  let processed = 0;
  for (const job of jobs || []) {
    try {
      // Mark as processing
      await supabase
        .from('account_provisioning_jobs')
        .update({ status: 'processing', reason: null })
        .eq('id', job.id);

      // Load member
      const { data: member, error: mErr } = await supabase
        .from('members')
        .select('id, email, full_name, branch_id, membership_level, baptized_sub_level')
        .eq('id', job.member_id)
        .single();
      if (mErr || !member) throw new Error(mErr?.message || 'Member not found');
      if (!member.email) throw new Error('Member has no email');
      if (!member.branch_id) throw new Error('Member missing branch_id');

      // Resolve branch slug
      const { data: branch, error: bErr } = await supabase
        .from('church_branches')
        .select('slug')
        .eq('id', member.branch_id)
        .single();
      if (bErr || !branch?.slug) throw new Error('Branch slug not found');

      // Compute names
      const parts = String(member.full_name || '').trim().split(/\s+/);
      const first_name = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || 'User';
      const last_name = parts.length > 1 ? parts[parts.length - 1] : '';

      // Map role from baptized_sub_level
      const sub = (member as any).baptized_sub_level as 'leader' | 'worker' | 'disciple' | null;
      const role = sub === 'leader' ? 'leader' : sub === 'worker' ? 'worker' : 'member';
      const is_baptized = String(member.membership_level) === 'baptized';

      // Generate a temporary password
      const password = generateTempPassword();

      // Create auth user & profile via RPC
      const { data: newUserId, error: rpcErr } = await (supabase as any).rpc('create_user_with_profile', {
        branch_slug: branch.slug,
        email: member.email,
        first_name,
        is_baptized,
        last_name,
        password,
        role,
      });
      if (rpcErr || !newUserId) throw new Error(rpcErr?.message || 'RPC create_user_with_profile failed');

      // Assign scoped role to branch (optional but useful)
      const { error: urErr } = await supabase
        .from('user_roles')
        .insert({
          user_id: String(newUserId),
          role: role,
          branch_id: member.branch_id,
        } as any);
      if (urErr) throw new Error('Failed to assign user role: ' + urErr.message);

      // Done
      await supabase
        .from('account_provisioning_jobs')
        .update({ status: 'done', reason: null, processed_at: new Date().toISOString() })
        .eq('id', job.id);
      processed += 1;
    } catch (e: any) {
      await supabase
        .from('account_provisioning_jobs')
        .update({ status: 'error', reason: String(e?.message || e), processed_at: new Date().toISOString() })
        .eq('id', job.id);
    }
  }

  return new Response(JSON.stringify({ processed }), { headers: { "Content-Type": "application/json" } });
}

serve((_req) => handleProvision());

function generateTempPassword(length = 16) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}
