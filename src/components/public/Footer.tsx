import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Wrench className="h-5 w-5 text-accent" />
              <span className="font-serif font-bold text-lg">HomeQuoteLink</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              Connecting Santa Clarita Valley homeowners with local plumbing professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 font-sans text-sm uppercase tracking-wider text-primary-foreground/50">Service Areas</h4>
            <ul className="space-y-1 text-sm text-primary-foreground/70">
              <li>Santa Clarita</li>
              <li>Valencia</li>
              <li>Saugus</li>
              <li>Canyon Country</li>
              <li>Newhall</li>
              <li>Stevenson Ranch</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 font-sans text-sm uppercase tracking-wider text-primary-foreground/50">Resources</h4>
            <ul className="space-y-1 text-sm text-primary-foreground/70">
              <li><Link to="/plumbers" className="hover:underline">For Plumbers</Link></li>
              <li><Link to="/cost-guides" className="hover:underline">Cost Guide</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link to="/admin/login" className="hover:underline">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} HomeQuoteLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
