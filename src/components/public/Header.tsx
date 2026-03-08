import { Link } from "react-router-dom";
import { Phone, Wrench, HelpCircle, BookOpen, DollarSign } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-accent" />
          <span className="text-lg font-bold text-primary font-serif">HomeQuoteLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/blog"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
          <Link
            to="/faq"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQ</span>
          </Link>
          <a
            href="tel:+13108613314"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">(310) 861-3314</span>
          <span className="sm:hidden">Call Now</span>
          </a>
        </div>
      </div>
    </header>
  );
}
