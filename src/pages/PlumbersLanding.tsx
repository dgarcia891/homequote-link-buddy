import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { PageMeta } from "@/components/PageMeta";
import { ServiceCard } from "@/components/public/ServiceCard";
import { SCV_CITIES, SERVICE_TYPES } from "@/lib/constants";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DollarSign, MapPin, Zap, ClipboardList, PhoneCall, ThumbsUp,
  Shield, Filter, Bell, TrendingUp, CheckCircle, Loader2,
} from "lucide-react";

const AVAILABLE_CITIES = SCV_CITIES.filter((c) => c !== "Other / Outside SCV");
const AVAILABLE_SERVICES = SERVICE_TYPES.filter((s) => s !== "Other");

const schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  business_name: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  years_in_business: z.string().optional(),
  service_areas: z.array(z.string()).min(1, "Select at least one service area"),
  service_types: z.array(z.string()).min(1, "Select at least one service type"),
  message: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to be contacted" }),
  }),
});

type FormValues = z.infer<typeof schema>;

const heroValueProps = [
  { icon: DollarSign, text: "Exclusive leads, not shared" },
  { icon: MapPin, text: "Santa Clarita Valley only" },
  { icon: Zap, text: "Emergency leads prioritized" },
];

const steps = [
  { icon: ClipboardList, title: "Submit Your Info", description: "Tell us your service area, the types of jobs you want, and your capacity." },
  { icon: PhoneCall, title: "We Review Your Application", description: "Our team reviews every application manually to maintain lead quality for everyone in the network." },
  { icon: ThumbsUp, title: "Start Receiving Leads", description: "Once approved, leads matching your criteria are delivered directly to your inbox." },
];

const benefits = [
  { icon: Shield, title: "Exclusive Delivery", description: "Each lead goes to one plumber only. No bidding wars, no shared contacts." },
  { icon: Filter, title: "Matched to Your Skills", description: "Choose your service types and cities. Only receive leads you actually want." },
  { icon: Bell, title: "Instant Email Alerts", description: "Get notified the moment a matching lead is available with full customer details." },
  { icon: TrendingUp, title: "Grow at Your Pace", description: "Set your daily lead cap. Scale up or down based on your capacity." },
];

export default function PlumbersLanding() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "", business_name: "", phone: "", email: "",
      years_in_business: "", service_areas: [], service_types: [],
      message: "", consent: undefined as unknown as true,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    try {
      await supabase.functions.invoke("notify-admin-email", {
        body: {
          notificationType: "buyer_inquiry",
          buyerInquiry: {
            full_name: values.full_name,
            business_name: values.business_name,
            phone: values.phone,
            email: values.email,
            years_in_business: values.years_in_business || null,
            service_areas: values.service_areas,
            service_types: values.service_types,
            message: values.message || null,
          },
        },
      });
    } catch (e) {
      console.error("Buyer inquiry notification failed:", e);
    }
    setSubmitted(true);
  }

  return (
    <>
      <PageMeta
        title="Get Exclusive Plumbing Leads — Santa Clarita | HomeQuoteLink"
        description="Receive exclusive residential plumbing leads in the Santa Clarita Valley. No shared leads. Join our network of local plumbing professionals."
        canonicalPath="/plumbers"
      />
      <Header />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-bold font-serif">
            Get Exclusive Plumbing Leads in Santa Clarita Valley
          </h1>
          <p className="text-lg text-primary-foreground/80">
            We connect local plumbing professionals with homeowners who are actively looking for help. No competition — every lead goes to one plumber.
          </p>
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            {heroValueProps.map((vp, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium">
                <vp.icon className="h-5 w-5 text-accent" />
                <span>{vp.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground font-sans">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What You Get</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <ServiceCard key={i} icon={b.icon} title={b.title} description={b.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-muted">
        <div className="container flex justify-center">
          <div className="w-full max-w-[600px] rounded-lg border bg-card p-8">
            {submitted ? (
              <div className="text-center space-y-4 py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-accent" />
                <h3 className="text-xl font-bold text-card-foreground">Thanks for applying!</h3>
                <p className="text-muted-foreground">
                  We'll review your information and reach out within one business day.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center space-y-2">
                  <h2 className="text-2xl font-bold text-card-foreground font-serif">
                    Apply to Join Our Network
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    We're currently accepting applications from licensed plumbers serving the Santa Clarita Valley. Fill out the form below and we'll be in touch within one business day.
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="full_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="John Smith" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="business_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl><Input placeholder="Smith Plumbing LLC" {...field} /></FormControl>
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
                          <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="years_in_business" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years in Business</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g. 10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="service_areas" render={() => (
                      <FormItem>
                        <FormLabel>Service Areas *</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_CITIES.map((city) => (
                            <FormField key={city} control={form.control} name="service_areas" render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(city)}
                                    onCheckedChange={(checked) => {
                                      field.onChange(
                                        checked
                                          ? [...(field.value || []), city]
                                          : field.value?.filter((v: string) => v !== city)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">{city}</FormLabel>
                              </FormItem>
                            )} />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="service_types" render={() => (
                      <FormItem>
                        <FormLabel>Service Types *</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_SERVICES.map((svc) => (
                            <FormField key={svc} control={form.control} name="service_types" render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(svc)}
                                    onCheckedChange={(checked) => {
                                      field.onChange(
                                        checked
                                          ? [...(field.value || []), svc]
                                          : field.value?.filter((v: string) => v !== svc)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">{svc}</FormLabel>
                              </FormItem>
                            )} />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message / Additional Info</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Anything else you'd like us to know — license number, certifications, typical job size, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="consent" render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-sm">
                            I agree to be contacted about joining the HomeQuoteLink plumber network. *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )} />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
