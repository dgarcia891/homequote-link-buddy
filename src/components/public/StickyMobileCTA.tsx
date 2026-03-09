import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StickyMobileCTAProps {
  onClick?: () => void;
  label?: string;
}

export function StickyMobileCTA({ onClick, label = "Get Your Free Quote" }: StickyMobileCTAProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      // Show after scrolling past 400px (roughly past the hero)
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  if (!isVisible) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Scroll to the form section
      const formSection = document.getElementById("quote-form");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 md:hidden">
      <Button
        onClick={handleClick}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 text-base"
      >
        {label}
        <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
