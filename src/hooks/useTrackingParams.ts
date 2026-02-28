import { useMemo } from "react";

export function useTrackingParams() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      gclid: params.get("gclid") || undefined,
      landing_page: window.location.pathname,
      referrer: document.referrer || undefined,
    };
  }, []);
}
