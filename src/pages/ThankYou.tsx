import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  return (
    <>
      <PageMeta title="Thank You | HomeQuoteLink" description="Your plumbing quote request has been received." />
      <Header />
      <main className="py-20">
        <div className="container max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg text-muted-foreground mb-2">
            We've received your request and will review it promptly.
          </p>
          <p className="text-muted-foreground mb-8">
            A local plumbing pro may reach out shortly. Most requests are reviewed within a few hours during business hours.
          </p>

          <div className="rounded-lg border bg-card p-6 mb-8">
            <h2 className="font-semibold text-card-foreground mb-2 font-sans">Need help sooner?</h2>
            <p className="text-sm text-muted-foreground mb-4">If it's an emergency, call us directly:</p>
            <a
              href="tel:+16615551234"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              <Phone className="h-5 w-5" />
              (661) 555-1234
            </a>
          </div>

          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
