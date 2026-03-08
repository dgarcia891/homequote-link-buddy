import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useInsertLead, useUpdateLead } from "@/hooks/useLeads";
import { useTrackingParams } from "@/hooks/useTrackingParams";
import { scoreLead } from "@/services/leadScoringService";
import { checkDuplicate } from "@/services/duplicateDetectionService";
import { SCV_CITIES, SERVICE_TYPES, URGENCY_LEVELS, CONTACT_METHODS } from "@/lib/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const BLOCKED_EMAIL_DOMAINS = [
  "example.com", "test.com", "mailinator.com", "guerrillamail.com",
  "tempmail.com", "throwaway.email", "fakeinbox.com", "yopmail.com",
  "sharklasers.com", "grr.la", "guerrillamailblock.com", "pokemail.net",
  "spam4.me", "trashmail.com", "dispostable.com", "maildrop.cc",
  "10minutemail.com", "temp-mail.org", "getnada.com",
];

const schema = z.object({
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

type FormValues = z.infer<typeof schema>;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function normalizeEmail(email: string | undefined): string | undefined {
  if (!email) return undefined;
  return email.toLowerCase().trim();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = [
  { label: "Service", fields: ["service_type", "urgency"] as const },
  { label: "Location", fields: ["city", "zip_code"] as const },
  { label: "Contact", fields: ["full_name", "phone", "email", "description", "preferred_contact_method", "consent_to_contact"] as const },
];

export function LeadCaptureForm() {
  const navigate = useNavigate();
  const tracking = useTrackingParams();
  const insertLead = useInsertLead();
  const updateLead = useUpdateLead();
  const partialLeadId = useRef<string | null>(null);
  const savingPartial = useRef(false);
  const [step, setStep] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      zip_code: "",
      city: "",
      service_type: "",
      urgency: "",
      description: "",
      preferred_contact_method: "call",
      consent_to_contact: undefined as unknown as true,
    },
  });

  const watchedPhone = form.watch("phone");
  const watchedEmail = form.watch("email");

  // Progressive save: create partial lead when we have valid contact info
  useEffect(() => {
    if (partialLeadId.current || savingPartial.current) return;

    const phoneDigits = watchedPhone?.replace(/\D/g, "") || "";
    const hasValidPhone = phoneDigits.length >= 10;
    const hasValidEmail = EMAIL_REGEX.test(watchedEmail || "");

    if (!hasValidPhone || !hasValidEmail) return;

    savingPartial.current = true;

    const values = form.getValues();
    const generatedId = crypto.randomUUID();
    const partialData = {
      id: generatedId,
      phone: watchedPhone,
      phone_normalized: normalizePhone(watchedPhone),
      email: watchedEmail,
      email_normalized: normalizeEmail(watchedEmail) || null,
      full_name: values.full_name || null,
      zip_code: values.zip_code || null,
      city: values.city || null,
      service_type: values.service_type || null,
      urgency: values.urgency || null,
      description: values.description || null,
      preferred_contact_method: values.preferred_contact_method || "call",
      consent_to_contact: false,
      status: "partial",
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      gclid: tracking.gclid,
      landing_page: tracking.landing_page,
      referrer: tracking.referrer,
    };

    supabase
      .from("leads")
      .insert(partialData)
      .then(({ error }) => {
        if (!error) {
          partialLeadId.current = generatedId;
        } else {
          console.error("Partial save failed:", error);
        }
        savingPartial.current = false;
      });
  }, [watchedPhone, watchedEmail]);

  async function validateStep(): Promise<boolean> {
    const fields = STEPS[step].fields;
    const result = await form.trigger(fields as any);
    return result;
  }

  async function handleNext() {
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: FormValues) {
    const leadData = {
      full_name: values.full_name,
      phone: values.phone,
      email: values.email || null,
      zip_code: values.zip_code,
      city: values.city,
      service_type: values.service_type,
      urgency: values.urgency,
      description: values.description,
      preferred_contact_method: values.preferred_contact_method,
      consent_to_contact: true,
      phone_normalized: normalizePhone(values.phone),
      email_normalized: normalizeEmail(values.email) || null,
      lead_score: scoreLead(values as any),
      duplicate_flag: checkDuplicate(values as any).isDuplicate,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      gclid: tracking.gclid,
      landing_page: tracking.landing_page,
      referrer: tracking.referrer,
      status: "new",
    };

    try {
      let resultId: string;

      if (partialLeadId.current) {
        const { data, error } = await supabase
          .from("leads")
          .update(leadData)
          .eq("id", partialLeadId.current)
          .select("id")
          .single();
        if (error) throw error;
        resultId = data.id;
      } else {
        const result = await insertLead.mutateAsync(leadData);
        resultId = result.id;
      }

      try {
        await supabase.functions.invoke("notify-admin-email", {
          body: { notificationType: "new_lead", leadData: { ...leadData, id: resultId } },
        });
      } catch (e) {
        console.error("Admin email notification failed:", e);
      }

      // Fire-and-forget AI authenticity analysis
      supabase.functions.invoke("analyze-lead", { body: { leadId: resultId } }).catch((e) =>
        console.error("AI analysis failed:", e)
      );

      navigate("/thank-you");
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again or call us directly.",
        variant: "destructive",
      });
    }
  }

  const progressValue = ((step + 1) / STEPS.length) * 100;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            {STEPS.map((s, i) => (
              <span key={s.label} className={i <= step ? "text-accent font-semibold" : ""}>
                {s.label}
              </span>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Step 1: Service */}
        {step === 0 && (
          <div className="space-y-4">
            <FormField control={form.control} name="service_type" render={({ field }) => (
              <FormItem>
                <FormLabel>What do you need help with? *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SERVICE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="urgency" render={({ field }) => (
              <FormItem>
                <FormLabel>How urgent is this? *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="How urgent?" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {URGENCY_LEVELS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SCV_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {form.watch("city") === "Other / Outside SCV" && (
              <p className="text-sm text-muted-foreground bg-muted rounded-md p-3">
                We're currently focused on the Santa Clarita Valley but expanding soon. Submit your request and we'll do our best to help or point you in the right direction.
              </p>
            )}

            <FormField control={form.control} name="zip_code" render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code *</FormLabel>
                <FormControl><Input placeholder="91354" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}

        {/* Step 3: Contact */}
        {step === 2 && (
          <div className="space-y-4">
            <FormField control={form.control} name="full_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl><Input placeholder="John Smith" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl><Input type="tel" placeholder="(661) 555-0000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Describe the Issue *</FormLabel>
                <FormControl><Textarea rows={3} placeholder="Tell us what's going on…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="preferred_contact_method" render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Contact Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CONTACT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="consent_to_contact" render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-sm">
                    I agree to be contacted about my plumbing request. *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base"
              disabled={insertLead.isPending}
            >
              {insertLead.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Get My Free Quote"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
