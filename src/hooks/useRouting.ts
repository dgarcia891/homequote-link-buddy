import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoutingSettingInsert, RoutingSettingUpdate } from "@/types";

export function useRoutingSettings() {
  return useQuery({
    queryKey: ["routing_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("routing_settings").select("*, buyers(business_name)").order("city");
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertRoutingSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (setting: RoutingSettingInsert) => {
      const { data, error } = await supabase.from("routing_settings").insert(setting).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routing_settings"] }),
  });
}

export function useUpdateRoutingSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: RoutingSettingUpdate & { id: string }) => {
      const { data, error } = await supabase.from("routing_settings").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routing_settings"] }),
  });
}

export function useDeleteRoutingSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("routing_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routing_settings"] }),
  });
}
