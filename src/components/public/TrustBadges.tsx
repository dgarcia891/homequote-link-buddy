import { Shield, Ban, DollarSign } from "lucide-react";

const badges = [
  { icon: DollarSign, label: "100% Free Quotes" },
  { icon: Shield, label: "Local Plumbing Pros" },
  { icon: Ban, label: "No Spam, Ever" },
];

export function TrustBadges() {
  return (
    <section className="border-b bg-card py-4">
      <div className="container flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {badges.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <b.icon className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
