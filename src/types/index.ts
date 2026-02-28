import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;
export type LeadInsert = TablesInsert<"leads">;
export type LeadUpdate = TablesUpdate<"leads">;

export type Buyer = Tables<"buyers">;
export type BuyerInsert = TablesInsert<"buyers">;
export type BuyerUpdate = TablesUpdate<"buyers">;

export type LeadEvent = Tables<"lead_events">;
export type LeadEventInsert = TablesInsert<"lead_events">;

export type RoutingSetting = Tables<"routing_settings">;
export type RoutingSettingInsert = TablesInsert<"routing_settings">;
export type RoutingSettingUpdate = TablesUpdate<"routing_settings">;
