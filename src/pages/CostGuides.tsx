import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { CTAButton } from "@/components/public/CTAButton";
import { BreadcrumbJsonLd } from "@/components/public/JsonLd";
import { BreadcrumbNav } from "@/components/public/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowRight } from "lucide-react";
import { useEffect } from "react";

import { SITE_URL } from "@/lib/constants";

const guides = [
  {
    service: "Drain Cleaning",
    range: "$150 – $350",
    description: "Basic drain snaking starts around $150. Hydro-jetting for tougher clogs runs $250–$600+.",
    factors: ["Severity of clog", "Location (main line vs. fixture)", "Method used (snake vs. hydro-jet)"],
  },
  {
    service: "Water Heater Repair",
    range: "$200 – $600",
    description: "Element or thermostat replacement on a standard tank. Full replacement runs $1,200–$3,500+.",
    factors: ["Tank vs. tankless", "Repair vs. replacement", "Permit requirements"],
  },
  {
    service: "Water Heater Replacement",
    range: "$1,200 – $3,500",
    description: "Includes unit, installation, and haul-away. Tankless upgrades can run $3,000–$5,000+.",
    factors: ["Tank size (40 vs. 50 gal)", "Gas vs. electric", "Code upgrades needed"],
  },
  {
    service: "Leak Detection",
    range: "$150 – $500",
    description: "Electronic or acoustic leak detection. Slab leak detection is on the higher end.",
    factors: ["Leak accessibility", "Detection method", "Number of suspected leaks"],
  },
  {
    service: "Slab Leak Repair",
    range: "$800 – $4,000",
    description: "Repair cost depends on access method — reroute, tunnel, or break through slab.",
    factors: ["Repair method", "Pipe material", "Extent of damage"],
  },
  {
    service: "Sewer Line Repair",
    range: "$1,500 – $5,000",
    description: "Spot repair for a single break. Full sewer line replacement can exceed $10,000.",
    factors: ["Length of repair", "Depth of line", "Trenchless vs. traditional"],
  },
  {
    service: "Repiping (Whole Home)",
    range: "$4,000 – $15,000",
    description: "Full replacement of galvanized or polybutylene pipes with copper or PEX.",
    factors: ["Home size (sq ft)", "Number of fixtures", "Pipe material chosen"],
  },
  {
    service: "Fixture Installation",
    range: "$150 – $500",
    description: "Per fixture — faucet, toilet, or showerhead. Bathtub installs run higher.",
    factors: ["Fixture type", "Existing plumbing condition", "Permits if needed"],
  },
  {
    service: "Emergency Plumbing",
    range: "$200 – $800+",
    description: "After-hours or emergency calls carry a premium. Cost depends on the underlying issue.",
    factors: ["Time of call (nights/weekends)", "Type of emergency", "Parts availability"],
  },
  {
    service: "General Plumbing",
    range: "$100 – $400",
    description: "Hourly service calls for minor repairs, inspections, or maintenance tasks.",
    factors: ["Duration of visit", "Parts needed", "Complexity of issue"],
  },
];

function parsePriceRange(range: string): { low: string; high: string } {
  const nums = range.replace(/[^0-9–-]/g, "").split(/[–-]/);
  return { low: nums[0] || "0", high: nums[1] || nums[0] || "0" };
}

export default function CostGuides() {
  // Inject pricing structured data for AEO
  useEffect(() => {
    const id = "cost-guide-offers";
    document.querySelector(`script[data-jsonld="${id}"]`)?.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Plumbing Cost Guide — Santa Clarita",
      description: "Typical plumbing service price ranges in the Santa Clarita Valley.",
      itemListElement: guides.map((g, i) => {
        const { low, high } = parsePriceRange(g.range);
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Service",
            name: g.service,
            description: g.description,
            areaServed: { "@type": "City", name: "Santa Clarita" },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "USD",
              lowPrice: low,
              highPrice: high,
            },
          },
        };
      }),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-jsonld", id);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => { script.remove(); };
  }, []);

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Cost Guides" },
  ];

  return (
    <>
      <PageMeta
        title="Plumbing Cost Guide — Santa Clarita Prices | HomeQuoteLink"
        description="How much does plumbing cost in Santa Clarita? See typical price ranges for drain cleaning, water heaters, sewer repair, repiping, and more."
        canonicalPath="/cost-guides"
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Header />

      <main id="main-content">
        <section className="bg-primary py-16 md:py-20">
          <div className="container max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <BreadcrumbNav
                variant="light"
                items={[{ label: "Cost Guides" }]}
              />
            </div>
            <h1 className="text-3xl font-black leading-tight text-primary-foreground md:text-4xl lg:text-5xl">
              Plumbing Cost Guide
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Typical price ranges for common plumbing services in the Santa Clarita Valley. Prices vary by job — get an exact quote for free.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="grid gap-6">
              {guides.map((guide) => (
                <Card key={guide.service} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 bg-muted/50 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <DollarSign className="h-5 w-5 text-accent" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-sans">{guide.service}</CardTitle>
                    </div>
                    <span className="text-lg font-bold text-accent">{guide.range}</span>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground mb-3">{guide.description}</p>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Price depends on:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {guide.factors.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-accent flex-shrink-0" aria-hidden="true" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 rounded-xl bg-primary p-8 text-center text-primary-foreground">
              <h2 className="text-2xl font-bold mb-3">Want an Exact Quote?</h2>
              <p className="text-primary-foreground/80 mb-6">
                Every plumbing job is different. Get a free, no-obligation quote from a local plumber in minutes.
              </p>
              <CTAButton>Get Your Free Quote</CTAButton>
            </div>

            <div className="mt-10 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Note:</strong> These are typical price ranges for the Santa Clarita Valley area as of {new Date().getFullYear()}. Actual costs vary based on the specific job, materials, and plumber. Always get a written estimate before work begins.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
