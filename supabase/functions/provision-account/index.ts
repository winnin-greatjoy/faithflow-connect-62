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

  for (const job of jobs || []) {
    await supabase
      .from('account_provisioning_jobs')
      .update({ status: 'error', reason: 'provisioner not implemented', processed_at: new Date().toISOString() })
      .eq('id', job.id);
  }

  return new Response(JSON.stringify({ processed: jobs?.length || 0 }), { headers: { "Content-Type": "application/json" } });
}

serve((_req) => handleProvision());
