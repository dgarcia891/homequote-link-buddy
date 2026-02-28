import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BuyerInsert, BuyerUpdate } from "@/types";

export function useBuyers() {
  return useQuery({
    queryKey: ["buyers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("buyers").select("*").order("business_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertBuyer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (buyer: BuyerInsert) => {
      const { data, error } = await supabase.from("buyers").insert(buyer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyers"] }),
  });
}

export function useUpdateBuyer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: BuyerUpdate & { id: string }) => {
      const { data, error } = await supabase.from("buyers").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyers"] }),
  });
}

export function useDeleteBuyer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("buyers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyers"] }),
  });
}
