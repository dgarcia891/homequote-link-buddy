import { PageMeta } from "@/components/PageMeta";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { CTAButton } from "@/components/public/CTAButton";
import { HowItWorks } from "@/components/public/HowItWorks";
import { ServiceCard } from "@/components/public/ServiceCard";
import { SCV_CITIES } from "@/lib/constants";
import {
  Droplets,
  Flame,
  SearchCheck,
  PipetteIcon,
  Wrench,
  ShowerHead,
  AlertTriangle,
  Settings,
  MapPin,
} from "lucide-react";

const services = [
  { icon: Droplets, title: "Drain Cleaning", description: "Clogged drains cleared fast with professional equipment." },
  { icon: Flame, title: "Water Heater", description: "Repair or replacement for tank and tankless water heaters." },
  { icon: SearchCheck, title: "Leak Detection", description: "Find and fix hidden leaks before they cause damage." },
  { icon: PipetteIcon, title: "Sewer Line", description: "Sewer line inspection, repair, and replacement." },
  { icon: Wrench, title: "Repiping", description: "Whole-home or partial repiping for aging plumbing." },
  { icon: ShowerHead, title: "Fixture Install", description: "Faucets, toilets, showers, and more installed right." },
  { icon: AlertTriangle, title: "Emergency", description: "24/7 emergency plumbing when you need it most." },
  { icon: Settings, title: "General Plumbing", description: "All-around plumbing maintenance and repairs." },
];

const Index = () => {
  return (
    <>
      <PageMeta
        title="HomeQuoteLink — Santa Clarita Plumbing Quotes"
        description="Get free plumbing quotes from local pros in the Santa Clarita Valley. Fast, easy, no obligation."
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(25_95%_53%/0.15),_transparent_60%)]" />
          <div className="container relative z-10 text-center">
            <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Find a Plumber in Santa Clarita
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/80">
              Tell us what you need. We'll connect you with a local pro — free, fast, and no obligation.
            </p>
            <div className="mt-8">
              <CTAButton>Get Your Free Quote</CTAButton>
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Service Areas */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground">We Serve the Entire SCV</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {SCV_CITIES.map((city) => (
                <div key={city} className="flex items-center gap-2 rounded-lg border bg-card p-4">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="font-medium text-card-foreground">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common Services */}
        <section className="py-16 bg-muted">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Common Plumbing Services</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((svc) => (
                <ServiceCard key={svc.title} {...svc} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <CTAButton>Request a Quote Now</CTAButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Index;
