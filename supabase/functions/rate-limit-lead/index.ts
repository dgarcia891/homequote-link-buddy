import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Max leads allowed per phone or email within the window
const MAX_LEADS = 3;
const WINDOW_MINUTES = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone } = await req.json();

    if (!email && !phone) {
      return new Response(
        JSON.stringify({ rateLimited: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const windowStart = new Date(
      Date.now() - WINDOW_MINUTES * 60 * 1000
    ).toISOString();

    let rateLimited = false;

    // Check by normalized phone
    if (phone) {
      const normalized = phone.replace(/\D/g, "").slice(-10);
      if (normalized.length === 10) {
        const { count } = await supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("phone_normalized", normalized)
          .gte("created_at", windowStart);
        if ((count ?? 0) >= MAX_LEADS) {
          rateLimited = true;
        }
      }
    }

    // Check by normalized email
    if (!rateLimited && email) {
      const normalized = email.toLowerCase().trim();
      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("email_normalized", normalized)
        .gte("created_at", windowStart);
      if ((count ?? 0) >= MAX_LEADS) {
        rateLimited = true;
      }
    }

    return new Response(
      JSON.stringify({ rateLimited }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Rate limit check error:", err);
    // Fail open — don't block real users on errors
    return new Response(
      JSON.stringify({ rateLimited: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
