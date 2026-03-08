import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackClick } from "@/services/analyticsService";

interface CTAButtonProps {
  to?: string;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
  trackingName?: string;
}

export function CTAButton({ to = "/plumbing/santa-clarita", children, className, size = "lg", trackingName }: CTAButtonProps) {
  const isAnchor = to.startsWith("#");
  const name = trackingName || `cta_${String(children).toLowerCase().replace(/\s+/g, "_")}`;

  function handleTrack() {
    trackClick(name, { destination: to });
  }

  if (isAnchor) {
    return (
      <Button
        size={size}
        className={`bg-accent text-accent-foreground hover:bg-accent/90 font-semibold ${className ?? ""}`}
        onClick={() => {
          handleTrack();
          document.querySelector(to)?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button asChild size={size} className={`bg-accent text-accent-foreground hover:bg-accent/90 font-semibold ${className ?? ""}`}>
      <Link to={to} onClick={handleTrack}>{children}</Link>
    </Button>
  );
}
