import { usePageTracking } from "@/hooks/usePageTracking";

/**
 * Invisible component that tracks page views.
 * Must be rendered inside <BrowserRouter>.
 */
export function PageTracker() {
  usePageTracking();
  return null;
}
