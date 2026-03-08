import { useMemo } from "react";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, TrendingUp, FileText, Globe } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

interface Metric {
  post_id: string;
  viewed_at: string;
  referrer: string | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
}

export default function BlogAnalyticsPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["blog_analytics_metrics"],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from("post_metrics")
        .select("post_id, viewed_at, referrer")
        .gte("viewed_at", since)
        .order("viewed_at", { ascending: true });
      if (error) throw error;
      return data as Metric[];
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["blog_analytics_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug")
        .eq("status", "published");
      if (error) throw error;
      return data as Post[];
    },
  });

  const isLoading = metricsLoading || postsLoading;

  const postMap = useMemo(() => {
    const map = new Map<string, Post>();
    posts?.forEach((p) => map.set(p.id, p));
    return map;
  }, [posts]);

  // Views over time (last 30 days)
  const viewsOverTime = useMemo(() => {
    if (!metrics) return [];
    const counts = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const day = format(subDays(new Date(), i), "MMM d");
      counts.set(day, 0);
    }
    metrics.forEach((m) => {
      const day = format(new Date(m.viewed_at), "MMM d");
      counts.set(day, (counts.get(day) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
  }, [metrics]);

  // Top posts by views
  const topPosts = useMemo(() => {
    if (!metrics) return [];
    const counts = new Map<string, number>();
    metrics.forEach((m) => counts.set(m.post_id, (counts.get(m.post_id) || 0) + 1));
    return Array.from(counts.entries())
      .map(([postId, views]) => ({
        postId,
        title: postMap.get(postId)?.title || "Unknown Post",
        slug: postMap.get(postId)?.slug || "",
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [metrics, postMap]);

  // Top referrers
  const topReferrers = useMemo(() => {
    if (!metrics) return [];
    const counts = new Map<string, number>();
    metrics.forEach((m) => {
      const ref = m.referrer ? (() => {
        try { return new URL(m.referrer).hostname; } catch { return m.referrer; }
      })() : "Direct";
      counts.set(ref, (counts.get(ref) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [metrics]);

  const totalViews = metrics?.length || 0;
  const todayViews = useMemo(() => {
    if (!metrics) return 0;
    const todayStart = startOfDay(new Date()).toISOString();
    return metrics.filter((m) => m.viewed_at >= todayStart).length;
  }, [metrics]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <PageMeta title="Blog Analytics | Admin" description="Blog post analytics and metrics." />
      <AdminLayout>
        <h1 className="text-2xl font-bold mb-6 font-sans">Blog Analytics</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" /> Total Views (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{todayViews.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> Published Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{posts?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" /> Avg Views/Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {posts?.length ? Math.round(totalViews / posts.length) : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Views over time chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Views Over Time (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {viewsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" className="text-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10">No view data yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {topPosts.length > 0 ? (
                <div className="space-y-3">
                  {topPosts.map((p, i) => (
                    <div key={p.postId} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-6 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:text-primary truncate block"
                        >
                          {p.title}
                        </a>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{p.views}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Top referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {topReferrers.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(200, topReferrers.length * 36)}>
                  <BarChart data={topReferrers} layout="vertical" margin={{ left: 0 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }}
                    />
                    <Bar dataKey="views" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-6">No data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
