import { useEffect } from "react";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "HomeQuoteLink",
  description:
    "Connecting Santa Clarita Valley homeowners with local plumbing professionals. Free quotes, no obligation.",
  url: "https://homequote-link-buddy.lovable.app",
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
  priceRange: "Free quotes",
  serviceType: "Plumbing",
};

export function JsonLd() {
  useEffect(() => {
    const existing = document.querySelector('script[data-jsonld="homequotelink"]');
    if (existing) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-jsonld", "homequotelink");
    script.textContent = JSON.stringify(localBusinessSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
