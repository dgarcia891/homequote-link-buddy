import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminCounts() {
  return useQuery({
    queryKey: ["admin-counts"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

      const [leads, applications, reviews, spam] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("buyer_profiles").select("id", { count: "exact", head: true }).is("buyer_id", null),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_verified", false),
        supabase.from("spam_events").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
      ]);

      return {
        "/admin": leads.count ?? 0,
        "/admin/applications": applications.count ?? 0,
        "/admin/reviews": reviews.count ?? 0,
        "/admin/spam": spam.count ?? 0,
      } as Record<string, number>;
    },
  });
}
