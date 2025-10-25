import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SB_URL')!;
const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceKey);

type Payload = {
  member_id: string;
  type?: 'admin_initiated' | 'auto_baptized';
  delivery_method?: 'invite' | 'temp_password';
};

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const body = (await req.json()) as Payload;
    if (!body?.member_id) {
      return new Response(JSON.stringify({ error: 'member_id is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const type = body.type ?? 'admin_initiated';
    const delivery_method = body.delivery_method ?? 'temp_password';

    const { data, error } = await supabase
      .from('account_provisioning_jobs')
      .insert({ member_id: body.member_id, type, status: 'pending', reason: `new:${delivery_method}:${new Date().toISOString()}` } as any)
      .select('*')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
