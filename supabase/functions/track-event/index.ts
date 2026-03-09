import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const {
      event_type,
      event_name,
      page_path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      gclid,
      session_id,
      visitor_id,
      user_agent,
      screen_width,
      screen_height,
      metadata,
    } = payload;

    if (!event_type) {
      return new Response(JSON.stringify({ error: 'event_type required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Hash IP for privacy (same approach as track-view)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(ip + 'hql_salt_2024'));
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 16);

    const { error } = await supabase.from('analytics_events').insert({
      event_type,
      event_name: event_name || null,
      page_path: page_path || null,
      referrer: referrer || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      gclid: gclid || null,
      session_id: session_id || null,
      visitor_id: visitor_id || null,
      user_agent: user_agent || null,
      screen_width: screen_width || null,
      screen_height: screen_height || null,
      metadata: metadata || null,
      ip_hash: ipHash,
    });

    if (error) {
      console.error('[track-event] Insert error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[track-event] Error:', err);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
