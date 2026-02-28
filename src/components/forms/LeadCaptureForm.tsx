import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useInsertLead } from "@/hooks/useLeads";
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
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
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

export function LeadCaptureForm() {
  const navigate = useNavigate();
  const tracking = useTrackingParams();
  const insertLead = useInsertLead();

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
    };

    try {
      await insertLead.mutateAsync(leadData);
      navigate("/thank-you");
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again or call us directly.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="zip_code" render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code *</FormLabel>
              <FormControl><Input placeholder="91354" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="service_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Service Needed *</FormLabel>
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
              <FormLabel>Urgency *</FormLabel>
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

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Describe the Issue *</FormLabel>
            <FormControl><Textarea rows={4} placeholder="Tell us what's going on…" {...field} /></FormControl>
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

        <Button
          type="submit"
          size="lg"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base"
          disabled={insertLead.isPending}
        >
          {insertLead.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Get My Free Quote"}
        </Button>
      </form>
    </Form>
  );
}
