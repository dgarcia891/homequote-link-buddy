import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch published posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at, tags, category')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;

    // Fetch active verticals for service pages
    const { data: verticals } = await supabase
      .from('verticals')
      .select('slug')
      .eq('is_active', true);

    // Fetch active buyers for provider pages
    const { data: buyers } = await supabase
      .from('buyers')
      .select('id')
      .eq('is_active', true);

    const blogDomain = Deno.env.get('BLOG_DOMAIN') || 'homequote-link-buddy.lovable.app';
    const siteUrl = `https://${blogDomain}`;
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: today },
      { loc: '/blog', priority: '0.9', changefreq: 'daily', lastmod: today },
      { loc: '/plumbers', priority: '0.8', changefreq: 'monthly', lastmod: today },
      { loc: '/providers', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { loc: '/faq', priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: '/cost-guides', priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: '/plumbing/santa-clarita', priority: '0.9', changefreq: 'weekly', lastmod: today },
      { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
    ];

    const staticEntries = staticPages.map(p => `
  <url>
    <loc>${siteUrl}${p.loc}</loc>${p.lastmod ? `
    <lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

    // Service vertical pages
    const verticalEntries = (verticals || [])
      .filter(v => v.slug !== 'plumbing')
      .map(v => `
  <url>
    <loc>${siteUrl}/services/${v.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    // Provider detail pages
    const providerEntries = (buyers || []).map(b => `
  <url>
    <loc>${siteUrl}/providers/${b.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

    // Blog post pages
    const postEntries = (posts || []).map(p => `
  <url>
    <loc>${siteUrl}/blog/${p.slug}</loc>
    <lastmod>${(p.updated_at || p.published_at || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    // Collect unique tags and categories from posts
    const tagsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    for (const p of posts || []) {
      if (p.tags && Array.isArray(p.tags)) {
        for (const t of p.tags) tagsSet.add(t);
      }
      if (p.category) categoriesSet.add(p.category);
    }

    const tagEntries = Array.from(tagsSet).map(tag => `
  <url>
    <loc>${siteUrl}/blog/tag/${encodeURIComponent(tag)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('');

    const categoryEntries = Array.from(categoriesSet).map(cat => `
  <url>
    <loc>${siteUrl}/blog/category/${encodeURIComponent(cat)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${verticalEntries}${providerEntries}${postEntries}${tagEntries}${categoryEntries}
</urlset>`;

    return new Response(sitemap, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (err) {
    console.error('[sitemap]', err);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});
