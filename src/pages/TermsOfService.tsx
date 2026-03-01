import { PageMeta } from "@/components/PageMeta";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function TermsOfService() {
  return (
    <>
      <PageMeta title="Terms of Service | HomeQuoteLink" description="HomeQuoteLink terms of service — rules and conditions for using our lead referral service." />
      <Header />
      <main className="container py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 font-sans">Terms of Service</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 font-sans">Service Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            HomeQuoteLink is a lead referral service that connects homeowners in the Santa Clarita Valley with local plumbing professionals. We are not a plumbing contractor and do not perform any plumbing work ourselves.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 font-sans">No Guarantees</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not guarantee plumber availability, response times, pricing, or the quality of work performed by any plumbing professional. Any agreements or contracts are solely between you and the plumber.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 font-sans">User Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            By submitting a quote request, you confirm that the information you provide is accurate and that you consent to being contacted by a plumbing professional regarding your request. You agree not to submit false, misleading, or spam requests.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 font-sans">Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            HomeQuoteLink shall not be held liable for any damages, losses, or disputes arising from the services provided by any plumbing professional connected through our platform. Our role is limited to facilitating the initial introduction between homeowners and plumbers.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
