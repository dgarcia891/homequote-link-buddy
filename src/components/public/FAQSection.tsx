import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  heading?: string;
  vertical?: string;
}

export function FAQSection({ faqs, heading = "Frequently Asked Questions", vertical }: FAQSectionProps) {
  // Inject FAQ JSON-LD schema for rich snippets
  useEffect(() => {
    const id = `faq-jsonld-${vertical || "general"}`;
    const existing = document.querySelector(`script[data-jsonld="${id}"]`);
    if (existing) return;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-jsonld", id);
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [faqs, vertical]);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 bg-secondary">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">{heading}</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card rounded-lg border px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
