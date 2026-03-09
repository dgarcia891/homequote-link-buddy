import { PageMeta } from "@/components/PageMeta";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { TrustBadges } from "@/components/public/TrustBadges";
import { JsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/public/JsonLd";
import { BreadcrumbNav } from "@/components/public/BreadcrumbNav";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { CTAButton } from "@/components/public/CTAButton";
import { Phone, ShieldCheck, Clock, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SITE_URL = "https://homequote-link-buddy.lovable.app";

// City content data object — ready for future cities
const cityData = {
  slug: "santa-clarita",
  name: "Santa Clarita",
  headline: "Connect With a Plumber in Santa Clarita",
  subheadline: "Get a free quote from a local plumbing pro — in minutes, not days.",
  phone: "(310) 861-3314",
  issues: [
    "Hard water buildup damaging pipes and fixtures",
    "Aging sewer lines in older SCV neighborhoods",
    "Water heater failures during winter cold snaps",
    "Tree root intrusion into sewer and drain lines",
    "Slab leaks from shifting soil conditions",
    "Low water pressure from corroded galvanized pipes",
  ],
  faqs: [
    { q: "How quickly will I hear from a plumber?", a: "Most homeowners hear back within 1–2 hours during business hours. For emergencies, we prioritize getting you connected even faster." },
    { q: "Is there any cost to get a quote?", a: "No — submitting a request is completely free. The plumber will provide you with a quote before any work begins." },
    { q: "How do you choose which plumber to connect me with?", a: "We match based on your location, the type of service you need, and plumber availability. Our plumbers serve the Santa Clarita Valley." },
    { q: "What if I'm not happy with the plumber?", a: "You're never obligated to hire. If the first match isn't the right fit, let us know and we'll help find another option." },
    { q: "Do you serve areas outside Santa Clarita?", a: "We're focused on the Santa Clarita Valley right now — including Valencia, Saugus, Canyon Country, Newhall, and Stevenson Ranch." },
  ],
};

export default function PlumbingCityLanding() {
  const { name, headline, subheadline, phone, issues, faqs } = cityData;

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Plumbing", url: `${SITE_URL}/services/plumbing` },
    { name: `Plumber in ${name}` },
  ];

  return (
    <>
      <PageMeta
        title={`Plumber in ${name} — Free Quotes | HomeQuoteLink`}
        description={`Get free plumbing quotes from local pros in ${name}. Fast response, no obligation. Drain cleaning, water heaters, leaks & more.`}
        canonicalPath={`/plumbing/${cityData.slug}`}
      />
      <JsonLd />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={faqs} />
      <Header />
      <TrustBadges />
      <main id="main-content">
        {/* Hero + Form */}
        <section className="bg-primary py-12 md:py-20" aria-labelledby="hero-heading">
          <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            <div className="text-primary-foreground">
              <div className="mb-4">
                <BreadcrumbNav
                  variant="light"
                  items={[
                    { label: "Plumbing", to: "/" },
                    { label: `Plumber in ${name}` },
                  ]}
                />
              </div>
              <h1 id="hero-heading" className="text-3xl font-black leading-tight md:text-4xl lg:text-5xl">{headline}</h1>
              <p className="mt-4 text-lg text-primary-foreground/80">{subheadline}</p>

              <ul className="mt-8 space-y-4" aria-label="Why choose us">
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                  <span>Local plumbing professionals</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                  <span>Fast response — most hear back within hours</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                  <span>Serving all of Santa Clarita Valley</span>
                </li>
              </ul>

              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                aria-label={`Call us at ${phone}`}
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:bg-accent/90"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                Call Now: {phone}
              </a>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-xl md:p-8" id="quote-form">
              <h2 className="mb-1 text-2xl font-bold text-card-foreground font-sans">Get Your Free Quote</h2>
              <p className="mb-6 text-sm text-muted-foreground">Takes less than 2 minutes. No obligation.</p>
              <LeadCaptureForm />
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-10">Common Plumbing Issues in {name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-5">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  <p className="text-card-foreground">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border bg-card px-5">
                  <AccordionTrigger className="text-left font-semibold text-card-foreground font-sans">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-primary text-center text-primary-foreground">
          <div className="container">
            <h2 className="text-3xl font-bold mb-4">Ready to Fix Your Plumbing?</h2>
            <p className="mb-8 text-primary-foreground/80">Get a free quote from a local pro. No obligation, no hassle.</p>
            <CTAButton to="#quote-form">Get Your Free Quote</CTAButton>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
