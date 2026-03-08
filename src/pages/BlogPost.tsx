import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import DOMPurify from "dompurify";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  tags: string[] | null;
  category: string | null;
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
      });
  }, [slug]);

  // Track view
  useEffect(() => {
    if (!post) return;
    let sessionId = sessionStorage.getItem("hql_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("hql_session", sessionId);
    }
    supabase.functions.invoke("track-view", {
      body: {
        post_id: post.id,
        session_id: sessionId,
        referrer: document.referrer || null,
      },
    }).catch(() => {}); // fire-and-forget
  }, [post]);

  // SEO meta tags
  useEffect(() => {
    if (!post) return;

    document.title = `${post.title} | HomeQuoteLink Blog`;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (post.excerpt) setMeta("description", post.excerpt);
    setMeta("og:title", post.title, true);
    if (post.excerpt) setMeta("og:description", post.excerpt, true);
    setMeta("og:type", "article", true);
    if (post.featured_image_url) setMeta("og:image", post.featured_image_url, true);
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", post.title, true);
    if (post.excerpt) setMeta("twitter:description", post.excerpt, true);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/blog/${post.slug}`;

    // JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt || "",
      image: post.featured_image_url || undefined,
      datePublished: post.published_at,
      author: { "@type": "Organization", name: "HomeQuoteLink" },
      publisher: { "@type": "Organization", name: "HomeQuoteLink" },
      url: `${window.location.origin}/blog/${post.slug}`,
    });
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [post]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container max-w-3xl mx-auto px-4 py-20">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-64 bg-muted rounded mt-8" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="text-primary hover:underline font-medium">← Back to Blog</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
  });

  const readingTime = estimateReadingTime(post.content);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <article className="py-12 md:py-20">
          <div className="container max-w-3xl mx-auto px-4">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors mb-8 inline-block">
              ← Back to Blog
            </Link>

            <header className="mb-10">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <time className="font-medium uppercase tracking-wider">
                  {format(new Date(post.published_at), "MMMM d, yyyy")}
                </time>
                <span>·</span>
                <span>{readingTime} min read</span>
                {post.category && (
                  <>
                    <span>·</span>
                    <span>{post.category}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-serif leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{post.excerpt}</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </header>

            {post.featured_image_url && (
              <div className="rounded-xl overflow-hidden mb-10">
                <img src={post.featured_image_url} alt={post.title} className="w-full h-auto" loading="lazy" />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none
                prose-headings:text-foreground prose-headings:font-serif
                prose-p:text-foreground/85 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-img:rounded-lg
                prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
