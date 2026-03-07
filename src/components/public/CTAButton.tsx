import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CTAButtonProps {
  to?: string;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
}

export function CTAButton({ to = "/plumbing/santa-clarita", children, className, size = "lg" }: CTAButtonProps) {
  const isAnchor = to.startsWith("#");

  if (isAnchor) {
    return (
      <Button
        size={size}
        className={`bg-accent text-accent-foreground hover:bg-accent/90 font-semibold ${className ?? ""}`}
        onClick={() => document.querySelector(to)?.scrollIntoView({ behavior: "smooth" })}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button asChild size={size} className={`bg-accent text-accent-foreground hover:bg-accent/90 font-semibold ${className ?? ""}`}>
      <Link to={to}>{children}</Link>
    </Button>
  );
}
