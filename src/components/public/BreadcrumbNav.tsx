import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  /** Use light text for dark hero backgrounds */
  variant?: "default" | "light";
}

export function BreadcrumbNav({ items, variant = "default" }: BreadcrumbNavProps) {
  const isLight = variant === "light";

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm ${isLight ? "text-primary-foreground/70" : "text-muted-foreground"}`}
    >
      <ol className="flex flex-wrap items-center gap-1">
        <li className="flex items-center gap-1">
          <Link
            to="/"
            className={`inline-flex items-center gap-1 transition-colors ${
              isLight ? "hover:text-primary-foreground" : "hover:text-primary"
            }`}
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {isLast || !item.to ? (
                <span
                  className={`font-medium ${isLight ? "text-primary-foreground" : "text-foreground"}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className={`transition-colors ${
                    isLight ? "hover:text-primary-foreground" : "hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
