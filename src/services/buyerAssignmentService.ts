import type { LeadInsert } from "@/types";

/**
 * STUB: Buyer assignment service.
 * Reads routing_settings and returns a suggested buyer ID.
 * Does NOT auto-assign — admin does that manually.
 */
export function suggestBuyer(_lead: LeadInsert): string | null {
  console.log("[buyerAssignmentService] Stub — no auto-assignment in v1");
  return null;
}
