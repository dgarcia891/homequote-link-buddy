import { supabase } from "@/integrations/supabase/client";

// Persistent anonymous visitor ID
function getVisitorId(): string {
  const key = "hql_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Session ID — resets after 30 min of inactivity
function getSessionId(): string {
  const key = "hql_session_id";
  const tsKey = "hql_session_ts";
  const TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();
  const lastTs = parseInt(localStorage.getItem(tsKey) || "0", 10);
  let id = localStorage.getItem(key);

  if (!id || now - lastTs > TIMEOUT) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  localStorage.setItem(tsKey, String(now));
  return id;
}

// Extract UTM params from current URL
function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
    gclid: params.get("gclid") || null,
  };
}

interface TrackEventOptions {
  eventType: "page_view" | "click" | "form_step" | "conversion";
  eventName?: string;
  pagePath?: string;
  metadata?: Record<string, unknown>;
}

export async function trackEvent({ eventType, eventName, pagePath, metadata }: TrackEventOptions) {
  try {
    const utmParams = getUtmParams();
    await supabase.from("analytics_events").insert([{
      event_type: eventType,
      event_name: eventName || null,
      page_path: pagePath || window.location.pathname,
      referrer: document.referrer || null,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      gclid: utmParams.gclid,
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      user_agent: navigator.userAgent,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      metadata: metadata ? (metadata as any) : null,
    }]);
  } catch (e) {
    // Silent fail — analytics should never break the app
    console.error("Analytics track error:", e);
  }
}

export function trackPageView(pagePath?: string) {
  trackEvent({ eventType: "page_view", pagePath });
}

export function trackClick(eventName: string, metadata?: Record<string, unknown>) {
  trackEvent({ eventType: "click", eventName, metadata });
}

export function trackFormStep(stepName: string, metadata?: Record<string, unknown>) {
  trackEvent({ eventType: "form_step", eventName: stepName, metadata });
}

export function trackConversion(eventName: string, metadata?: Record<string, unknown>) {
  trackEvent({ eventType: "conversion", eventName, metadata });
}
