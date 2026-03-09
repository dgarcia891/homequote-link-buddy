import { useEffect } from "react";

const SITE_URL = "https://homequote-link-buddy.lovable.app";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "HomeQuoteLink",
  url: SITE_URL,
  telephone: "+13108613314",
  description:
    "Connecting Santa Clarita Valley homeowners with trusted local home service professionals. Free quotes, no obligation.",
  areaServed: {
    "@type": "City",
    name: "Santa Clarita",
    containedInPlace: { "@type": "AdministrativeArea", name: "California" },
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+13108613314",
    contactType: "customer service",
    areaServed: "US",
    availableLanguage: "English",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: "HomeQuoteLink",
  description:
    "Connecting Santa Clarita Valley homeowners with local home service professionals. Free quotes for plumbing, HVAC, electrical, and landscaping.",
  url: SITE_URL,
  telephone: "+13108613314",
  areaServed: [
    { "@type": "City", name: "Santa Clarita" },
    { "@type": "City", name: "Valencia" },
    { "@type": "City", name: "Saugus" },
    { "@type": "City", name: "Canyon Country" },
    { "@type": "City", name: "Newhall" },
    { "@type": "City", name: "Stevenson Ranch" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Santa Clarita",
    addressRegion: "CA",
    addressCountry: "US",
  },
  priceRange: "Free",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Home Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plumbing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "HVAC / Air Conditioning" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Electrical" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Landscaping" } },
    ],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "HomeQuoteLink",
  url: SITE_URL,
  description: "Free home service quotes in Santa Clarita Valley.",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

function injectSchema(id: string, data: object) {
  const existing = document.querySelector(`script[data-jsonld="${id}"]`);
  if (existing) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-jsonld", id);
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function JsonLd() {
  useEffect(() => {
    injectSchema("organization", organizationSchema);
    injectSchema("localbusiness", localBusinessSchema);
    injectSchema("website", websiteSchema);

    return () => {
      document.querySelectorAll('script[data-jsonld="organization"], script[data-jsonld="localbusiness"], script[data-jsonld="website"]')
        .forEach((el) => el.remove());
    };
  }, []);

  return null;
}

/** Inject FAQPage schema from an array of Q&A pairs */
export function FAQJsonLd({ faqs }: { faqs: { q: string; a: string }[] }) {
  useEffect(() => {
    const id = "faqpage";
    const existing = document.querySelector(`script[data-jsonld="${id}"]`);
    if (existing) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-jsonld", id);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [faqs]);

  return null;
}
