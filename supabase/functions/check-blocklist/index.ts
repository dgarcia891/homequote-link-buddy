import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let blocked = false;

    if (email) {
      const normalized = email.toLowerCase().trim();
      const { data } = await supabase
        .from("blocked_emails")
        .select("id")
        .eq("email_normalized", normalized)
        .maybeSingle();
      if (data) blocked = true;
    }

    if (!blocked && phone) {
      const normalized = phone.replace(/\D/g, "").slice(-10);
      if (normalized.length === 10) {
        const { data } = await supabase
          .from("blocked_phones")
          .select("id")
          .eq("phone_normalized", normalized)
          .maybeSingle();
        if (data) blocked = true;
      }
    }

    return new Response(JSON.stringify({ blocked }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
