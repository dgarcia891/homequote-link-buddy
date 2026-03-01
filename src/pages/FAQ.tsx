import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { PageMeta } from "@/components/PageMeta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const homeownerFAQs = [
  {
    q: "What is HomeQuoteLink?",
    a: "HomeQuoteLink is a free service that connects Santa Clarita Valley homeowners with local licensed plumbing professionals. You describe your issue, we match you with a plumber who covers your area and service type, and they reach out to provide a quote. You are never charged for using HomeQuoteLink.",
  },
  {
    q: "Is there any cost to submit a request?",
    a: "No. Submitting a request is completely free. HomeQuoteLink is paid by the plumbing professionals in our network, not by homeowners.",
  },
  {
    q: "How quickly will I hear from a plumber?",
    a: "For emergency requests, we prioritize connecting you immediately. For urgent requests you should expect contact within a few hours. For flexible or quote-only requests expect contact within one business day. Response times depend on plumber availability in your area.",
  },
  {
    q: "What happens after I submit my request?",
    a: "Your request goes to our team for review. We verify it looks legitimate, match it to an available plumber in our network who covers your city and service type, and send them your contact information. The plumber then reaches out to you directly to discuss your issue and provide a quote.",
  },
  {
    q: "Will I be contacted by multiple plumbers?",
    a: "No. We send your request to one plumber at a time. You will not be spammed by multiple companies.",
  },
  {
    q: "Am I obligated to hire the plumber who contacts me?",
    a: "Not at all. The quote is free and there is no obligation. If the plumber is not the right fit for any reason, let us know and we will try to find another match.",
  },
  {
    q: "What areas do you serve?",
    a: "We currently serve Santa Clarita, Valencia, Saugus, Canyon Country, Newhall, and Stevenson Ranch. We are expanding to additional areas — if you are outside the SCV, submit a request anyway and we will do our best to help.",
  },
  {
    q: "What types of plumbing issues do you handle?",
    a: "We handle most residential plumbing services including drain cleaning, water heater repair and replacement, leak detection, sewer line inspection and repair, repiping, fixture installation, and general plumbing maintenance. For commercial plumbing inquiries, contact us directly.",
  },
  {
    q: "What if it is an emergency?",
    a: 'Select "Emergency — Need help now" as your urgency level. This flags your request for priority handling. You can also call us directly at the number listed on the site.',
  },
  {
    q: "What information will be shared with the plumber?",
    a: "We share your name, phone number, email (if provided), city, service type, and the description you submitted. We do not share your address unless you provide it in your description.",
  },
];

const buyerFAQs = [
  {
    q: "What is HomeQuoteLink and how do I become a buyer?",
    a: "HomeQuoteLink is a residential plumbing lead generation service serving the Santa Clarita Valley. As a buyer, you pay for exclusive leads — homeowners who have requested a quote for plumbing services in your coverage area. To join, contact us directly to discuss your service area, the types of jobs you want, and your capacity.",
  },
  {
    q: "What is a lead?",
    a: "A lead is a homeowner who has submitted a request through HomeQuoteLink describing a plumbing issue they need help with. Each lead includes the homeowner's name, phone number, email (when provided), city, service type, urgency level, and a description of the issue in their own words.",
  },
  {
    q: "Are leads exclusive?",
    a: "Yes. When we send you a lead, we are sending it to you only. We do not sell the same lead to multiple buyers. This is a core part of our value proposition.",
  },
  {
    q: "How are leads delivered?",
    a: "When we match a lead to you, you receive an email notification with the homeowner's contact information and job details. The email comes from notifications@homequotelink.com. Add this to your safe senders list to avoid it going to spam.",
  },
  {
    q: "How quickly should I contact the lead?",
    a: "As fast as possible — ideally within the hour for standard leads, and immediately for emergency leads. Homeowners who request emergency plumbing are actively calling multiple services. Speed of response is the single biggest factor in whether you win the job.",
  },
  {
    q: "What if the lead is a duplicate or bad contact information?",
    a: "Contact us within 24 hours of receiving the lead. We review every refund request manually. Legitimate reasons for a refund or replacement include disconnected phone numbers, duplicate contact information matching a lead you already received, or a homeowner who is clearly outside your service area. We do not issue refunds for leads that did not convert — lead generation is not a guarantee of work.",
  },
  {
    q: "What service areas can I cover?",
    a: "Your coverage is configured when you set up your account. You can cover one or more of our active cities: Santa Clarita, Valencia, Saugus, Canyon Country, Newhall, Stevenson Ranch. You can also specify which service types you want to receive — for example, if you only want water heater and sewer line jobs, we will filter leads accordingly.",
  },
  {
    q: "Is there a daily limit on how many leads I receive?",
    a: "Yes. Your daily lead cap is set when we configure your account. This prevents you from being overwhelmed and ensures lead quality. If you want to increase or decrease your cap, contact us.",
  },
  {
    q: "What does the lead score mean?",
    a: "Each lead receives an automated quality score from 0 to 100 based on urgency, service type, data completeness, and traffic source. A score of 70 or above indicates a high-intent lead — typically an emergency or urgent request with full contact details. A score below 40 indicates a flexible or information-gathering request. Higher-scored leads are prioritized in our routing.",
  },
  {
    q: "Can I pause lead delivery?",
    a: "Yes. Contact us and we will temporarily pause your account. We ask for at least 24 hours notice so we can adjust routing for your coverage area.",
  },
];

export default function FAQ() {
  return (
    <>
      <PageMeta
        title="FAQ | HomeQuoteLink"
        description="Frequently asked questions about HomeQuoteLink for homeowners and plumbing professionals in Santa Clarita Valley."
      />
      <Header />
      <main className="container max-w-3xl py-12 space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-serif text-primary">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground">
            Everything you need to know about HomeQuoteLink.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold font-serif text-primary mb-4">
            For Homeowners
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {homeownerFAQs.map((faq, i) => (
              <AccordionItem key={i} value={`homeowner-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-semibold font-serif text-primary mb-4">
            For Plumbers
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {buyerFAQs.map((faq, i) => (
              <AccordionItem key={i} value={`buyer-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <Footer />
    </>
  );
}
