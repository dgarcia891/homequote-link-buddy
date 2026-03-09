export const SITE_URL = "https://homequotelink.com";
export const SITE_NAME = "HomeQuoteLink";
export const SITE_PHONE = "(310) 861-3314";
export const SITE_PHONE_E164 = "+13108613314";
export const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eeda3ab0-0240-43cf-bfec-33f9c0132fc2/id-preview-1ad2cd53--2be06244-1b45-4531-bf8f-a430691ac172.lovable.app-1772304743071.png";

export const VERTICALS = {
  plumbing: {
    label: "Plumbing",
    slug: "plumbing",
    serviceTypes: [
      "General Plumbing",
      "Drain Cleaning",
      "Water Heater",
      "Leak Detection",
      "Sewer Line",
      "Repiping",
      "Fixture Installation",
      "Emergency Plumbing",
      "Other",
    ],
    professionalLabel: "plumber",
    professionalLabelPlural: "plumbers",
  },
  hvac: {
    label: "HVAC / AC",
    slug: "hvac",
    serviceTypes: [
      "AC Repair",
      "AC Installation",
      "Furnace Repair",
      "Furnace Installation",
      "Duct Cleaning",
      "Heat Pump",
      "Thermostat Installation",
      "Emergency HVAC",
      "Other",
    ],
    professionalLabel: "HVAC technician",
    professionalLabelPlural: "HVAC technicians",
  },
  landscaping: {
    label: "Yard & Landscaping",
    slug: "landscaping",
    serviceTypes: [
      "Lawn Care",
      "Tree Trimming",
      "Sprinkler Systems",
      "Landscape Design",
      "Hardscaping",
      "Fence Installation",
      "Garden Maintenance",
      "Other",
    ],
    professionalLabel: "landscaper",
    professionalLabelPlural: "landscapers",
  },
  electrical: {
    label: "Electrical",
    slug: "electrical",
    serviceTypes: [
      "General Electrical",
      "Panel Upgrade",
      "Outlet & Switch Install",
      "Lighting Installation",
      "Ceiling Fan Install",
      "EV Charger Install",
      "Emergency Electrical",
      "Other",
    ],
    professionalLabel: "electrician",
    professionalLabelPlural: "electricians",
  },
} as const;

export type VerticalKey = keyof typeof VERTICALS;

/** Flat list of all service types across all verticals */
export const ALL_SERVICE_TYPES = Object.values(VERTICALS).flatMap((v) => v.serviceTypes);

/** Get service types for a specific vertical */
export function getServiceTypes(vertical?: string): readonly string[] {
  if (vertical && vertical in VERTICALS) {
    return VERTICALS[vertical as VerticalKey].serviceTypes;
  }
  return ALL_SERVICE_TYPES;
}

/** Get vertical config by key */
export function getVertical(key: string) {
  return VERTICALS[key as VerticalKey] ?? VERTICALS.plumbing;
}

/** Get vertical key from a service type */
export function verticalFromServiceType(serviceType: string): VerticalKey {
  for (const [key, config] of Object.entries(VERTICALS)) {
    if ((config.serviceTypes as readonly string[]).includes(serviceType)) {
      return key as VerticalKey;
    }
  }
  return "plumbing";
}

// Legacy exports for backward compatibility
export const SERVICE_TYPES = VERTICALS.plumbing.serviceTypes;

export const SCV_CITIES = [
  "Santa Clarita",
  "Valencia",
  "Saugus",
  "Canyon Country",
  "Newhall",
  "Stevenson Ranch",
  "Other / Outside SCV",
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
