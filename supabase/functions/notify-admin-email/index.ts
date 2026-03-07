import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SMTP_TIMEOUT_MS = 10_000;
const IMAP_PORTS = [993, 995];

/* ── HTML helpers ─────────────────────────────────────────────── */

function htmlWrapper(title: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0;">
<tr><td align="center">
<!-- Header -->
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:#2563eb;padding:20px 28px;border-radius:12px 12px 0 0;">
<span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">HomeQuoteLink</span>
</td></tr>
<!-- Body card -->
<tr><td style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
${innerHtml}
</td></tr>
</table>
<!-- Footer -->
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:16px;">
<tr><td style="text-align:center;color:#999;font-size:12px;padding:8px;">
© ${new Date().getFullYear()} HomeQuoteLink &middot; ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr>
<td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">${label}</td>
<td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">${value}</td>
</tr>`;
}

function badge(text: string, bg: string, fg = "#fff"): string {
  return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:${bg};color:${fg};font-size:12px;font-weight:600;">${text}</span>`;
}

function ctaButton(text: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
<tr><td style="background:#f97316;border-radius:8px;">
<a href="${href}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">${text}</a>
</td></tr></table>`;
}

function sectionTitle(text: string): string {
  return `<h2 style="margin:20px 0 8px;font-size:15px;font-weight:700;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;display:inline-block;">${text}</h2>`;
}

/* ── Email body builders ──────────────────────────────────────── */

function buildNewLeadHtml(d: Record<string, string>): { subject: string; html: string } {
  const isEmergency = d.urgency === "emergency";
  const subject = `${isEmergency ? "🚨 EMERGENCY — " : ""}New Lead — ${d.urgency} — ${d.full_name} in ${d.city}`;

  const urgencyBadge = isEmergency
    ? badge("🚨 EMERGENCY", "#dc2626")
    : badge(d.urgency, "#2563eb");

  const outOfArea = d.city === "Other / Outside SCV"
    ? `<p style="margin:12px 0;padding:10px 14px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;font-size:13px;">⚠️ Out-of-area lead — manual review required.</p>`
    : "";

  const inner = `
<h1 style="margin:0 0 4px;font-size:18px;font-weight:700;">New Lead Received</h1>
<p style="margin:0 0 16px;color:#666;font-size:13px;">${urgencyBadge}</p>
${outOfArea}
<table width="100%" cellpadding="0" cellspacing="0">
${row("Name", d.full_name)}
${row("Phone", `<a href="tel:${d.phone}" style="color:#2563eb;text-decoration:none;">${d.phone}</a>`)}
${d.email ? row("Email", `<a href="mailto:${d.email}" style="color:#2563eb;text-decoration:none;">${d.email}</a>`) : ""}
${row("City", d.city)}
${row("ZIP", d.zip_code)}
${row("Service", d.service_type)}
${row("Urgency", d.urgency)}
${row("Contact Pref", d.preferred_contact_method)}
</table>
${sectionTitle("Description")}
<p style="margin:8px 0;font-size:14px;line-height:1.5;color:#333;">${(d.description || "").replace(/\n/g, "<br>")}</p>
${ctaButton("View in CRM →", `https://homequotelink.com/admin/leads/${d.id}`)}`;

  return { subject, html: htmlWrapper(subject, inner) };
}

function buildBuyerNotificationHtml(d: Record<string, string>): { subject: string; html: string } {
  const subject = `New Plumbing Lead — ${d.service_type} in ${d.city}`;

  const urgencyMap: Record<string, string> = {
    emergency: "Emergency — needs immediate help",
    same_day: "Same-day service requested",
    next_few_days: "Within the next few days",
    flexible: "Flexible timeline",
  };
  const urgencyText = urgencyMap[d.urgency] || d.urgency;
  const isEmergency = d.urgency === "emergency";

  const inner = `
<h1 style="margin:0 0 4px;font-size:18px;font-weight:700;">New Lead for You</h1>
<p style="margin:0 0 16px;color:#666;font-size:14px;">Hi ${d.buyerContactName}, you have a new plumbing lead.</p>
${isEmergency ? `<p style="margin:0 0 12px;">${badge("🚨 EMERGENCY", "#dc2626")}</p>` : ""}
<table width="100%" cellpadding="0" cellspacing="0">
${row("Customer", d.full_name)}
${row("Phone", `<a href="tel:${d.phone}" style="color:#2563eb;text-decoration:none;font-weight:600;">${d.phone}</a>`)}
${d.email ? row("Email", `<a href="mailto:${d.email}" style="color:#2563eb;text-decoration:none;">${d.email}</a>`) : ""}
${row("City", d.city)}
${row("Service", d.service_type)}
${row("Urgency", urgencyText)}
</table>
${sectionTitle("Customer's Description")}
<p style="margin:8px 0;font-size:14px;line-height:1.5;color:#333;background:#f9fafb;padding:12px 16px;border-radius:8px;border-left:3px solid #2563eb;">"${(d.description || "").replace(/\n/g, "<br>")}"</p>
${ctaButton(`Call ${d.full_name} →`, `tel:${d.phone}`)}
<p style="margin:4px 0 0;font-size:12px;color:#999;">Please reach out as soon as possible.</p>`;

  return { subject, html: htmlWrapper(subject, inner) };
}

function buildBuyerInquiryHtml(d: Record<string, string | string[]>): { subject: string; html: string } {
  const cityCoverage = (d.service_areas as string[] || []).join(", ");
  const serviceTypes = (d.service_types as string[] || []).join(", ");
  const subject = `New Buyer Application — ${d.business_name} — ${cityCoverage}`;

  const inner = `
<h1 style="margin:0 0 16px;font-size:18px;font-weight:700;">New Plumber Application</h1>
${sectionTitle("Business Info")}
<table width="100%" cellpadding="0" cellspacing="0">
${row("Business", d.business_name as string)}
${row("Contact", d.full_name as string)}
${row("Phone", `<a href="tel:${d.phone}" style="color:#2563eb;text-decoration:none;">${d.phone}</a>`)}
${row("Email", `<a href="mailto:${d.email}" style="color:#2563eb;text-decoration:none;">${d.email}</a>`)}
${row("Years in Business", (d.years_in_business as string) || "Not specified")}
</table>
${sectionTitle("Service Coverage")}
<table width="100%" cellpadding="0" cellspacing="0">
${row("Areas", cityCoverage || "None specified")}
${row("Service Types", serviceTypes || "None specified")}
</table>
${sectionTitle("Message")}
<p style="margin:8px 0;font-size:14px;line-height:1.5;color:#333;">${((d.message as string) || "None provided").replace(/\n/g, "<br>")}</p>`;

  return { subject, html: htmlWrapper(subject, inner) };
}

function buildTestHtml(config: { smtpHost: string; smtpPort: number; fromEmail: string }): { subject: string; html: string } {
  const subject = "HomeQuoteLink — Test Email";
  const inner = `
<h1 style="margin:0 0 8px;font-size:18px;font-weight:700;">✅ SMTP Working</h1>
<p style="margin:0 0 16px;color:#666;font-size:14px;">Your email configuration is set up correctly.</p>
<table width="100%" cellpadding="0" cellspacing="0">
${row("SMTP Host", config.smtpHost)}
${row("SMTP Port", String(config.smtpPort))}
${row("From", config.fromEmail)}
${row("Timestamp", new Date().toISOString())}
</table>`;

  return { subject, html: htmlWrapper(subject, inner) };
}

/* ── Main handler ─────────────────────────────────────────────── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notificationType, leadData, eventData, buyerInquiry } = await req.json();

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
      smtpHost: string; smtpPort: number; smtpUsername: string; smtpPassword: string;
      fromEmail: string; fromName: string; adminNotificationEmail: string; enabled: boolean;
    };

    if (!config.enabled) {
      return new Response(
        JSON.stringify({ success: false, error: "Email notifications are disabled in settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (IMAP_PORTS.includes(config.smtpPort)) {
      const msg = `Port ${config.smtpPort} is an IMAP/POP3 port. Use port 465 (SSL) or 587 (STARTTLS) for sending.`;
      return new Response(
        JSON.stringify({ success: false, error: msg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let html = "";
    let toEmail = "";

    if (notificationType === "new_lead") {
      const result = buildNewLeadHtml(leadData);
      subject = result.subject;
      html = result.html;
      toEmail = config.adminNotificationEmail;
    } else if (notificationType === "buyer_notification") {
      const result = buildBuyerNotificationHtml(eventData);
      subject = result.subject;
      html = result.html;
      toEmail = eventData.buyerEmail;
    } else if (notificationType === "buyer_inquiry") {
      const result = buildBuyerInquiryHtml(buyerInquiry);
      subject = result.subject;
      html = result.html;
      toEmail = config.adminNotificationEmail;
    } else if (notificationType === "test") {
      const result = buildTestHtml(config);
      subject = result.subject;
      html = result.html;
      toEmail = config.adminNotificationEmail;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: `Unknown notification type: ${notificationType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const useTls = config.smtpPort === 465;
    console.log(`Connecting to ${config.smtpHost}:${config.smtpPort} (tls: ${useTls})…`);

    const client = new SMTPClient({
      connection: {
        hostname: config.smtpHost,
        port: config.smtpPort,
        tls: useTls,
        auth: { username: config.smtpUsername, password: config.smtpPassword },
      },
    });

    const sendPromise = (async () => {
      await client.send({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: toEmail,
        subject,
        html,
      });
      await client.close();
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`SMTP connection timed out after ${SMTP_TIMEOUT_MS / 1000}s.`)), SMTP_TIMEOUT_MS)
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
