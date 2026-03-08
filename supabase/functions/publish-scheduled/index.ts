import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find all scheduled posts that are due
    const now = new Date().toISOString();
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (fetchError) throw fetchError;

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ success: true, published: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ids = posts.map(p => p.id);
    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: 'published', published_at: now })
      .in('id', ids);

    if (updateError) throw updateError;

    console.log(`[publish-scheduled] Published ${posts.length} post(s):`, posts.map(p => p.slug));

    return new Response(JSON.stringify({
      success: true,
      published: posts.length,
      slugs: posts.map(p => p.slug),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[publish-scheduled]', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
