// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  try {
    const { action, id, data } = await req.json();
    if (!action || !data || (action === 'update' && !id)) {
      return new Response(JSON.stringify({ error: 'Missing action/data or id' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    if (action === 'insert') {
      const { data: row, error } = await supabase
        .from('members')
        .insert(data)
        .select('id, full_name, email, phone, profile_photo, status, membership_level')
        .single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      return new Response(JSON.stringify({ ok: true, data: row }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    if (action === 'update') {
      const { data: row, error } = await supabase
        .from('members')
        .update(data)
        .eq('id', id)
        .select('id, full_name, email, phone, profile_photo, status, membership_level')
        .single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      return new Response(JSON.stringify({ ok: true, data: row }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
