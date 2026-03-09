import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_URL = "https://homequote-link-buddy.lovable.app";
const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eeda3ab0-0240-43cf-bfec-33f9c0132fc2/id-preview-1ad2cd53--2be06244-1b45-4531-bf8f-a430691ac172.lovable.app-1772304743071.png";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (el) {
    el.setAttribute("content", content);
  } else {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    el.content = content;
    document.head.appendChild(el);
  }
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (el) {
    el.href = href;
  } else {
    el = document.createElement("link");
    el.rel = "canonical";
    el.href = href;
    document.head.appendChild(el);
  }
}

export function PageMeta({ title, description, canonicalPath, ogType = "website", noIndex }: PageMetaProps) {
  useEffect(() => {
    document.title = title;

    // Core meta
    setMeta("description", description);

    // Canonical
    const canonical = canonicalPath
      ? `${SITE_URL}${canonicalPath}`
      : `${SITE_URL}${window.location.pathname}`;
    setCanonical(canonical);

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:url", canonical, "property");
    setMeta("og:image", OG_IMAGE, "property");

    // Twitter
    setMeta("twitter:title", title);
    setMeta("twitter:description", description.slice(0, 200));

    // Robots
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow");
    }
  }, [title, description, canonicalPath, ogType, noIndex]);

  return null;
}
