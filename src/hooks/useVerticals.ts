import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Vertical {
  id: string;
  slug: string;
  label: string;
  professional_label: string;
  professional_label_plural: string;
  service_types: string[];
  is_active: boolean;
  sort_order: number;
  icon_name: string | null;
  hero_title: string | null;
  hero_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export function useVerticals() {
  return useQuery({
    queryKey: ["verticals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verticals" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Vertical[];
    },
  });
}

export function useActiveVerticals() {
  return useQuery({
    queryKey: ["verticals", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verticals" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Vertical[];
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}

export function useUpdateVertical() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vertical> & { id: string }) => {
      const { data, error } = await supabase
        .from("verticals" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Vertical;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
    },
  });
}

export function useInsertVertical() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vertical: Omit<Vertical, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("verticals" as any)
        .insert(vertical)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Vertical;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
    },
  });
}

export function useDeleteVertical() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("verticals" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
    },
  });
}
