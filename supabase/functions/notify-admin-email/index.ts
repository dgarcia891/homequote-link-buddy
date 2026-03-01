import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const { notificationType, leadData, eventData, buyerInquiry } = await req.json();

    // Fetch SMTP config from admin_settings using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: settingsRow, error: settingsError } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "smtp_config")
      .maybeSingle();

    if (settingsError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to read SMTP settings: " + settingsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settingsRow) {
      return new Response(
        JSON.stringify({ success: false, error: "SMTP not configured. Go to Admin → Settings to set up email." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = settingsRow.setting_value as {
      smtpHost: string;
      smtpPort: number;
      smtpUsername: string;
      smtpPassword: string;
      fromEmail: string;
      fromName: string;
      adminNotificationEmail: string;
      enabled: boolean;
    };

    if (!config.enabled) {
      return new Response(
        JSON.stringify({ success: false, error: "Email notifications are disabled in settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email based on notification type
    let subject = "";
    let body = "";
    let toEmail = "";

    if (notificationType === "new_lead") {
      const d = leadData;
      const isEmergency = d.urgency === "emergency";
      subject = `${isEmergency ? "🚨 EMERGENCY — " : ""}New Lead — ${d.urgency} — ${d.full_name} in ${d.city}`;
      toEmail = config.adminNotificationEmail;
      body = `New lead submitted on HomeQuoteLink:\n\n` +
        `Name: ${d.full_name}\n` +
        `Phone: ${d.phone}\n` +
        `${d.email ? `Email: ${d.email}\n` : ""}` +
        `City: ${d.city}\n` +
        (d.city === "Other / Outside SCV" ? `⚠️ Out-of-area lead — manual review required.\n` : "") +
        `ZIP: ${d.zip_code}\n` +
        `Service Type: ${d.service_type}\n` +
        `Urgency: ${d.urgency}\n` +
        `Preferred Contact: ${d.preferred_contact_method}\n\n` +
        `Description:\n${d.description}\n\n` +
        `View in CRM: https://homequotelink.com/admin/leads/${d.id}`;
    } else if (notificationType === "buyer_notification") {
      const d = eventData;
      subject = `New Plumbing Lead — ${d.service_type} in ${d.city}`;
      toEmail = d.buyerEmail;

      const urgencyMap: Record<string, string> = {
        emergency: "Emergency — needs immediate help",
        same_day: "Same-day service requested",
        next_few_days: "Within the next few days",
        flexible: "Flexible timeline",
      };
      const urgencyText = urgencyMap[d.urgency] || d.urgency;

      body = `Hi ${d.buyerContactName},\n\n` +
        `You have a new plumbing lead from HomeQuoteLink.\n\n` +
        `Customer: ${d.full_name}\n` +
        `Phone: ${d.phone}\n` +
        `${d.email ? `Email: ${d.email}\n` : ""}` +
        `City: ${d.city}\n` +
        `Service: ${d.service_type}\n` +
        `Urgency: ${urgencyText}\n\n` +
        `Customer's description:\n"${d.description}"\n\n` +
        `Please reach out to this customer as soon as possible.\n\n` +
        `— HomeQuoteLink`;
    } else if (notificationType === "buyer_inquiry") {
      const d = buyerInquiry;
      const cityCoverage = (d.service_areas || []).join(", ");
      subject = `New Buyer Application — ${d.business_name} — ${cityCoverage}`;
      toEmail = config.adminNotificationEmail;
      body = `New plumber application submitted on HomeQuoteLink.\n\n` +
        `Business: ${d.business_name}\n` +
        `Contact: ${d.full_name}\n` +
        `Phone: ${d.phone}\n` +
        `Email: ${d.email}\n` +
        `Years in Business: ${d.years_in_business || "Not specified"}\n\n` +
        `Service Areas: ${cityCoverage}\n` +
        `Service Types: ${(d.service_types || []).join(", ")}\n\n` +
        `Message:\n${d.message || "None provided"}\n\n` +
        `Submitted: ${new Date().toISOString()}`;
    } else if (notificationType === "test") {
      subject = "HomeQuoteLink — Test Email";
      toEmail = config.adminNotificationEmail;
      body = `This is a test email from HomeQuoteLink.\n\n` +
        `Your SMTP configuration is working correctly.\n\n` +
        `Timestamp: ${new Date().toISOString()}\n` +
        `SMTP Host: ${config.smtpHost}\n` +
        `SMTP Port: ${config.smtpPort}\n` +
        `From: ${config.fromEmail}`;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: `Unknown notification type: ${notificationType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via SMTP
    const useTls = config.smtpPort === 465;
    const client = new SMTPClient({
      connection: {
        hostname: config.smtpHost,
        port: config.smtpPort,
        tls: useTls,
        auth: {
          username: config.smtpUsername,
          password: config.smtpPassword,
        },
      },
    });

    await client.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: toEmail,
      subject,
      content: body,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
