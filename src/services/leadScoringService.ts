import type { LeadInsert } from "@/types";

const URGENCY_SCORES: Record<string, number> = {
  emergency: 40,
  urgent: 25,
  soon: 10,
  flexible: 0,
};

const SERVICE_TYPE_SCORES: Record<string, number> = {
  "Sewer Line": 20,
  "Repiping": 20,
  "Water Heater": 15,
  "Leak Detection": 15,
  "Emergency Plumbing": 15,
  "Drain Cleaning": 5,
  "Fixture Installation": 5,
  "General Plumbing": 5,
  "Other": 0,
};

function scoreUrgency(urgency: string): number {
  return URGENCY_SCORES[urgency] ?? 0;
}

function scoreServiceType(serviceType: string): number {
  return SERVICE_TYPE_SCORES[serviceType] ?? 0;
}

function scoreDataCompleteness(lead: LeadInsert): number {
  let score = 0;
  if (lead.email) score += 10;
  const descLen = (lead.description ?? "").length;
  if (descLen >= 50) score += 10;
  else if (descLen >= 20) score += 5;
  return score;
}

function scoreSourceQuality(lead: LeadInsert): number {
  if (!lead.utm_source) return 10; // direct / organic
  if (lead.gclid) return 5; // paid search
  return 0;
}

export function scoreLead(lead: LeadInsert): number {
  return (
    scoreUrgency(lead.urgency) +
    scoreServiceType(lead.service_type) +
    scoreDataCompleteness(lead) +
    scoreSourceQuality(lead)
  );
}
