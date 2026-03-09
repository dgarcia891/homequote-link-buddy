import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, Wrench, HelpCircle, BookOpen, DollarSign, Users, User, Menu } from "lucide-react";
import { trackClick } from "@/services/analyticsService";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/providers", label: "Providers", icon: Users, track: "header_providers" },
  { to: "/cost-guides", label: "Pricing", icon: DollarSign, track: "header_pricing" },
  { to: "/blog", label: "Blog", icon: BookOpen, track: "header_blog" },
  { to: "/faq", label: "FAQ", icon: HelpCircle, track: "header_faq" },
  { to: "/login", label: "Login", icon: User, track: "header_login" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => trackClick("header_logo")}>
          <Wrench className="h-6 w-6 text-accent" aria-hidden="true" />
          <span className="text-lg font-bold text-primary font-serif">HomeQuoteLink</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-label={link.label}
              onClick={() => trackClick(link.track)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          ))}
          <a
            href="tel:+13108613314"
            aria-label="Call us at (310) 861-3314"
            onClick={() => trackClick("header_phone_call")}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>(310) 861-3314</span>
          </a>
        </nav>

        {/* Mobile: phone + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="tel:+13108613314"
            aria-label="Call us at (310) 861-3314"
            onClick={() => trackClick("header_phone_call")}
            className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>Call Now</span>
          </a>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 mt-8">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => {
                        trackClick(link.track);
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <link.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="my-3 border-t" />
                <SheetClose asChild>
                  <a
                    href="tel:+13108613314"
                    aria-label="Call us at (310) 861-3314"
                    onClick={() => trackClick("header_phone_call")}
                    className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-semibold text-accent transition-colors hover:bg-muted"
                  >
                    <Phone className="h-5 w-5" aria-hidden="true" />
                    (310) 861-3314
                  </a>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
