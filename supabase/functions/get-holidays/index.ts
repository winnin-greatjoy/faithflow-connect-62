import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatISO, parseISO } from 'https://esm.sh/date-fns@2.30.0';
import { getRuleBasedHolidays, SIERRA_LEONE_POLICY } from './holidayEngine.ts';
import { applyObservedRule } from './observedRules.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { year, country = 'SL' } = await req.json();

    if (!year || typeof year !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid year' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Check Cache
    const { data: cached } = await supabase
      .from('holiday_cache')
      .select('holidays')
      .eq('year', year)
      .eq('country', country)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ year, holidays: cached.holidays }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Generate Rule-Based Holidays
    const ruleBased = getRuleBasedHolidays(year);

    // 3. Fetch Islamic Holidays
    const { data: islamic } = await supabase
      .from('islamic_holidays')
      .select('title, holiday_date')
      .eq('year', year)
      .eq('country', country);

    const islamicMapped =
      islamic?.flatMap((h: { title: string; holiday_date: string }) => {
        const baseDate = parseISO(h.holiday_date);
        const observedResult = applyObservedRule(baseDate, SIERRA_LEONE_POLICY.defaultRule);

        if (observedResult.observed) {
          return [
            { title: h.title, date: h.holiday_date, isObserved: false },
            {
              title: `${h.title} (Observed)`,
              date: formatISO(observedResult.date, { representation: 'date' }),
              isObserved: true,
            },
          ];
        }
        return [{ title: h.title, date: h.holiday_date, isObserved: false }];
      }) ?? [];

    // 4. Merge + Normalize
    // Map everything to ISO date strings for the cache
    const finalHolidays = [
      ...ruleBased.map((h) => ({
        title: h.title,
        date: h.date.toISOString().slice(0, 10),
        isObserved: h.isObserved,
      })),
      ...islamicMapped,
    ].filter((h, i, arr) => i === arr.findIndex((x) => x.date === h.date && x.title === h.title));

    // 5. Store Cache
    await supabase.from('holiday_cache').upsert({
      year,
      country,
      holidays: finalHolidays,
      generated_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ year, holidays: finalHolidays }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
