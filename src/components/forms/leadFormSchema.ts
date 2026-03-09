import { z } from "zod";

export const BLOCKED_EMAIL_DOMAINS = [
  "example.com", "test.com", "mailinator.com", "guerrillamail.com",
  "tempmail.com", "throwaway.email", "fakeinbox.com", "yopmail.com",
  "sharklasers.com", "grr.la", "guerrillamailblock.com", "pokemail.net",
  "spam4.me", "trashmail.com", "dispostable.com", "maildrop.cc",
  "10minutemail.com", "temp-mail.org", "getnada.com",
];

export const leadFormSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required").refine((email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return !BLOCKED_EMAIL_DOMAINS.includes(domain);
  }, "Please use a real email address"),
  zip_code: z.string().min(5, "ZIP code required"),
  city: z.string().min(1, "City is required"),
  service_type: z.string().min(1, "Service type is required"),
  urgency: z.string().min(1, "Urgency is required"),
  description: z.string().min(10, "Please describe the issue (at least 10 characters)"),
  preferred_contact_method: z.string().default("call"),
  consent_to_contact: z.literal(true, { errorMap: () => ({ message: "You must agree to be contacted" }) }),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FORM_STEPS = [
  { label: "Service", fields: ["service_type", "urgency"] as const },
  { label: "Location", fields: ["city", "zip_code"] as const },
  { label: "Contact", fields: ["full_name", "phone", "email", "description", "preferred_contact_method", "consent_to_contact"] as const },
];

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function normalizeEmail(email: string | undefined): string | undefined {
  if (!email) return undefined;
  return email.toLowerCase().trim();
}

// Bot protection
export const MIN_FILL_TIME_MS = 3000;
export const RATE_LIMIT_MS = 30000;
export const SUSPICION_THRESHOLD = 2;

export function generateMathChallenge() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b}`, answer: a + b };
}
