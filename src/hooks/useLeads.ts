import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadInsert, LeadUpdate } from "@/types";

export function useLeads(filters?: { status?: string; city?: string; service_type?: string; urgency?: string; search?: string; page?: number; pageSize?: number }) {
  const page = filters?.page ?? 0;
  const pageSize = filters?.pageSize ?? 50;

  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*, buyers(business_name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.city) query = query.eq("city", filters.city);
      if (filters?.service_type) query = query.eq("service_type", filters.service_type);
      if (filters?.urgency) query = query.eq("urgency", filters.urgency);
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ["lead", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*, buyers(business_name)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertLead() {
  return useMutation({
    mutationFn: async (lead: LeadInsert) => {
      const { data, error } = await supabase.from("leads").insert(lead).select().single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: LeadUpdate & { id: string }) => {
      const { data, error } = await supabase.from("leads").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", data.id] });
    },
  });
}
