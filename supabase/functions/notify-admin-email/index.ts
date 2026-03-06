import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SMTP_TIMEOUT_MS = 10_000;
const IMAP_PORTS = [993, 995];

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
      console.error("Failed to read SMTP settings:", settingsError.message);
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

    // Debug logging (no password)
    console.log("SMTP config:", {
      host: config.smtpHost,
      port: config.smtpPort,
      username: config.smtpUsername,
      from: config.fromEmail,
      fromName: config.fromName,
      adminEmail: config.adminNotificationEmail,
      enabled: config.enabled,
      tls: config.smtpPort === 465,
    });

    if (!config.enabled) {
      return new Response(
        JSON.stringify({ success: false, error: "Email notifications are disabled in settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Port validation
    if (IMAP_PORTS.includes(config.smtpPort)) {
      const msg = `Port ${config.smtpPort} is an IMAP/POP3 port (for receiving email). Use port 465 (SSL) or 587 (STARTTLS) for sending.`;
      console.error(msg);
      return new Response(
        JSON.stringify({ success: false, error: msg }),
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

    // Send email via SMTP with timeout
    const useTls = config.smtpPort === 465;
    console.log(`Connecting to ${config.smtpHost}:${config.smtpPort} (tls: ${useTls})…`);

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

    // Race send against timeout
    const sendPromise = (async () => {
      await client.send({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: toEmail,
        subject,
        content: body,
      });
      await client.close();
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`SMTP connection timed out after ${SMTP_TIMEOUT_MS / 1000}s. Check host/port.`)), SMTP_TIMEOUT_MS)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log(`Email sent successfully to ${toEmail}`);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("notify-admin-email error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
