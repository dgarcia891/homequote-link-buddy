export const SCV_CITIES = [
  "Santa Clarita",
  "Valencia",
  "Saugus",
  "Canyon Country",
  "Newhall",
  "Stevenson Ranch",
  "Other / Outside SCV",
] as const;

export const SERVICE_TYPES = [
  "General Plumbing",
  "Drain Cleaning",
  "Water Heater",
  "Leak Detection",
  "Sewer Line",
  "Repiping",
  "Fixture Installation",
  "Emergency Plumbing",
  "Other",
] as const;

export const URGENCY_LEVELS = [
  { value: "emergency", label: "Emergency — Need help now" },
  { value: "urgent", label: "Urgent — Within 24 hours" },
  { value: "soon", label: "Soon — This week" },
  { value: "flexible", label: "Flexible — Just getting quotes" },
] as const;

export const LEAD_STATUSES = [
  "new",
  "duplicate",
  "pending_review",
  "routed",
  "accepted",
  "rejected",
  "sold",
  "refunded",
  "archived",
  "spam",
] as const;

export const CONTACT_METHODS = [
  { value: "call", label: "Phone Call" },
  { value: "text", label: "Text Message" },
  { value: "email", label: "Email" },
] as const;
