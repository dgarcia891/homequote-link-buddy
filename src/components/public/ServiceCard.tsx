import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
      <Icon className="mb-3 h-8 w-8 text-accent" aria-hidden="true" />
      <h3 className="mb-1 text-lg font-semibold text-card-foreground font-sans">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
