import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Extract client IP from various headers (in priority order)
function getClientIp(req: Request): string {
  // Cloudflare
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // Standard real IP header
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // X-Forwarded-For (first IP in the chain)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  // Fastly
  const fastlyIp = req.headers.get('fastly-client-ip');
  if (fastlyIp) return fastlyIp.trim();

  // True-Client-IP (Akamai, Cloudflare enterprise)
  const trueClientIp = req.headers.get('true-client-ip');
  if (trueClientIp) return trueClientIp.trim();

  return 'unknown';
}

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

    // Hash IP for privacy using robust extraction
    const ip = getClientIp(req);
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
