import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadEventInsert } from "@/types";

export function useLeadEvents(leadId: string | undefined) {
  return useQuery({
    queryKey: ["lead_events", leadId],
    enabled: !!leadId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_events")
        .select("*")
        .eq("lead_id", leadId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertLeadEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: LeadEventInsert) => {
      const { data, error } = await supabase.from("lead_events").insert(event).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["lead_events", variables.lead_id] });
    },
  });
}
