import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, FileText, Globe } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";

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

interface Props {
  metrics: Metric[];
  posts: Post[];
}

export function BlogTab({ metrics, posts }: Props) {
  const postMap = useMemo(() => {
    const map = new Map<string, Post>();
    posts.forEach((p) => map.set(p.id, p));
    return map;
  }, [posts]);

  const viewsOverTime = useMemo(() => {
    const counts = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      counts.set(format(subDays(new Date(), i), "MMM d"), 0);
    }
    metrics.forEach((m) => {
      const day = format(new Date(m.viewed_at), "MMM d");
      counts.set(day, (counts.get(day) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
  }, [metrics]);

  const topPosts = useMemo(() => {
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

  const topReferrers = useMemo(() => {
    const counts = new Map<string, number>();
    metrics.forEach((m) => {
      const ref = m.referrer
        ? (() => { try { return new URL(m.referrer).hostname; } catch { return m.referrer; } })()
        : "Direct";
      counts.set(ref, (counts.get(ref) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [metrics]);

  const totalViews = metrics.length;
  const todayViews = useMemo(() => {
    const todayStart = startOfDay(new Date()).toISOString();
    return metrics.filter((m) => m.viewed_at >= todayStart).length;
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, value: totalViews.toLocaleString(), label: "Total Views (30d)" },
          { icon: TrendingUp, value: todayViews.toLocaleString(), label: "Today" },
          { icon: FileText, value: String(posts.length), label: "Published Posts" },
          { icon: Globe, value: String(posts.length ? Math.round(totalViews / posts.length) : 0), label: "Avg Views/Post" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Views over time */}
      <Card>
        <CardHeader><CardTitle className="text-base">Views Over Time (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          {viewsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">No view data yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top posts */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Posts</CardTitle></CardHeader>
          <CardContent>
            {topPosts.length > 0 ? (
              <div className="space-y-3">
                {topPosts.map((p, i) => (
                  <div key={p.postId} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary truncate block">
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
          <CardHeader><CardTitle className="text-base">Traffic Sources</CardTitle></CardHeader>
          <CardContent>
            {topReferrers.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, topReferrers.length * 36)}>
                <BarChart data={topReferrers} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="views" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-6">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
