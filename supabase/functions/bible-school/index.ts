
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import {
    apply,
    approveApplication,
    recordAttendance,
    submitExam,
    promoteStudent,
    graduateStudent,
} from './handlers.ts';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { command, data } = await req.json();
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Command Router
        switch (command) {
            case 'APPLY':
                return await apply(supabase, user, data);

            case 'APPROVE_APPLICATION':
                return await approveApplication(supabase, user, data);

            case 'RECORD_ATTENDANCE':
                return await recordAttendance(supabase, user, data);

            case 'SUBMIT_EXAM':
                return await submitExam(supabase, user, data);

            case 'PROMOTE_STUDENT':
                return await promoteStudent(supabase, user, data);

            case 'GRADUATE_STUDENT':
                return await graduateStudent(supabase, user, data);

            default:
                return new Response(JSON.stringify({ error: 'Invalid command' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
    } catch (err: any) {
        console.error('Edge Function Error:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
