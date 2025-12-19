import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SB_URL');
const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SB_URL or SB_SERVICE_ROLE_KEY');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function randomKey(len = 24) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => (b % 36).toString(36))
    .join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const isJson = (req.headers.get('content-type') || '').includes('application/json');
    const body = (isJson ? await req.json() : {}) as {
      action?: string;
      streamId?: string;
      id?: string;
      rtmp_server?: string;
    };
    const action = body.action;
    const streamId = body.streamId || body.id;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const supabaseUser = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authErr,
    } = await supabaseUser.auth.getUser();

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // role check: super_admin, admin, pastor, leader
    const roles = ['super_admin', 'admin', 'pastor', 'leader'];
    let allowed = false;

    for (const role of roles) {
      const { data: ok, error } = await supabaseAdmin.rpc('has_role', {
        _user_id: user.id,
        _role: role,
      } as any);
      if (!error && ok) {
        allowed = true;
        break;
      }
    }

    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'get_credentials') {
      if (!streamId) {
        return new Response(JSON.stringify({ error: 'Missing streamId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const { data, error } = await supabaseAdmin
        .from('streams')
        .select('stream_key, rtmp_server')
        .eq('id', streamId)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify(data || {}), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'regenerate_key') {
      if (!streamId) {
        return new Response(JSON.stringify({ error: 'Missing streamId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const key = randomKey(24);
      const { error } = await supabaseAdmin
        .from('streams')
        .update({ stream_key: key })
        .eq('id', streamId)
        .select('id')
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ stream_key: key }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'set_rtmp_server') {
      if (!streamId || !body.rtmp_server) {
        return new Response(JSON.stringify({ error: 'Missing streamId or rtmp_server' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const { error } = await supabaseAdmin
        .from('streams')
        .update({ rtmp_server: body.rtmp_server })
        .eq('id', streamId)
        .select('id')
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SB_URL')!;
const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function randomKey(len = 24) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => (b % 36).toString(36))
    .join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const isJson = (req.headers.get('content-type') || '').includes('application/json');
    const body: any = isJson ? await req.json() : {};
    const action = body.action as string | undefined;
    const streamId = body.streamId || body.id;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const supabaseUser = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authErr,
    } = await supabaseUser.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // role check: super_admin, admin, pastor, leader
    const roles = ['super_admin', 'admin', 'pastor', 'leader'];
    let allowed = false;
    for (const role of roles) {
      const { data: ok, error } = await (supabaseAdmin as any).rpc('has_role', {
        role,
        user_id: user.id,
      });
      if (!error && ok) {
        allowed = true;
        break;
      }
    }
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'get_credentials') {
      if (!streamId) {
        return new Response(JSON.stringify({ error: 'Missing streamId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      const { data, error } = await supabaseAdmin
        .from('streams')
        .select('stream_key, rtmp_server')
        .eq('id', streamId)
        .single();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      return new Response(JSON.stringify(data || {}), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'regenerate_key') {
      if (!streamId) {
        return new Response(JSON.stringify({ error: 'Missing streamId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      const key = randomKey(24);
      const { error } = await supabaseAdmin
        .from('streams')
        .update({ stream_key: key })
        .eq('id', streamId)
        .select('id')
        .single();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({ stream_key: key }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'set_rtmp_server') {
      if (!streamId || !body.rtmp_server) {
        return new Response(JSON.stringify({ error: 'Missing streamId or rtmp_server' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      const { error } = await supabaseAdmin
        .from('streams')
        .update({ rtmp_server: body.rtmp_server })
        .eq('id', streamId)
        .select('id')
        .single();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
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
