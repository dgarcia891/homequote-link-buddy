import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/services/analyticsService";

/**
 * Tracks page views on every route change.
 * Place this once inside <BrowserRouter>.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith("/admin")) return;
    // Don't track if admin exclusion is active
    if (localStorage.getItem("hql_ignore_tracking") === "true") return;
    trackPageView(location.pathname);
  }, [location.pathname]);
}
