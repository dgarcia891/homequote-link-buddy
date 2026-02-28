import type { Lead } from "@/types";

/**
 * STUB: Webhook service for sending lead data to external systems (e.g. n8n).
 * Replace with actual HTTP POST when ready.
 */
export async function sendLeadWebhook(lead: Lead): Promise<void> {
  console.log("[webhookService] Stub — would POST lead to webhook:", lead.id);
}
