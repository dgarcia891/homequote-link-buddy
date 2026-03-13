import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useIsProvider() {
  const { user, loading: authLoading } = useAuth();

  const { data: isProvider, isLoading: providerLoading } = useQuery({
    queryKey: ["is_provider", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buyer_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    isProvider: isProvider ?? false,
    loading: authLoading || (!!user && providerLoading),
    user,
  };
}
