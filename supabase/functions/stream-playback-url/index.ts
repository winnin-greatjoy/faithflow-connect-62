import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SB_URL')!;
const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const isJson = (req.headers.get('content-type') || '').includes('application/json');
    let body: any = {};
    try { body = isJson ? await req.json() : {}; } catch { body = {}; }

    const url = new URL(req.url);
    const streamId = body.streamId || body.id || url.searchParams.get('streamId') || url.searchParams.get('id');

    if (!streamId) {
      return new Response(JSON.stringify({ error: 'Missing streamId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Admin client for privileged DB/storage ops
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    // User-aware client to read current user from the bearer token
    const supabaseUser = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const [{ data: userRes }, { data: stream, error: streamErr }] = await Promise.all([
      supabaseUser.auth.getUser(),
      supabaseAdmin.from('streams').select('*').eq('id', streamId).single()
    ]);

    if (streamErr || !stream) {
      return new Response(JSON.stringify({ error: streamErr?.message || 'Stream not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const user = userRes?.user || null;

    // Authorization rules matched to RLS logic
    let allowed = false;
    if (stream.privacy === 'public') {
      allowed = true;
    } else if (stream.privacy === 'members_only') {
      allowed = !!user;
    } else if (stream.privacy === 'private') {
      if (user) {
        // Check if user has any privileged role
        const roles = ['super_admin', 'admin', 'pastor', 'leader'];
        for (const role of roles) {
          const { data: hasRole, error } = await (supabaseAdmin as any).rpc('has_role', { role, user_id: user.id });
          if (!error && !!hasRole) { allowed = true; break; }
        }
      }
    }

    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Determine playback URL
    // Priority: explicit embed -> explicit video url -> signed storage url
    if (stream.embed_url) {
      return new Response(JSON.stringify({ url: stream.embed_url }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (stream.video_url) {
      return new Response(JSON.stringify({ url: stream.video_url }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (stream.storage_path) {
      const bucket = stream.privacy === 'public' ? 'public-videos' : 'private-videos';
      // For public bucket, try to return a public URL if object is public; otherwise sign
      if (stream.privacy === 'public') {
        const pub = supabaseAdmin.storage.from(bucket).getPublicUrl(stream.storage_path);
        if (pub?.data?.publicUrl) {
          return new Response(JSON.stringify({ url: pub.data.publicUrl }), { headers: { 'Content-Type': 'application/json' } });
        }
      }
      const { data: signed, error: signErr } = await supabaseAdmin.storage.from(bucket).createSignedUrl(stream.storage_path, 3600);
      if (signErr || !signed?.signedUrl) {
        return new Response(JSON.stringify({ error: signErr?.message || 'Unable to sign URL' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ url: signed.signedUrl }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Fallback: no URL available
    return new Response(JSON.stringify({ url: null }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
