import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, FileText, Globe } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";
import { KpiCard } from "./KpiCard";

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
  prevMetrics: Metric[];
  posts: Post[];
  range?: string;
}

export function BlogTab({ metrics, prevMetrics, posts, range = "30d" }: Props) {
  const navigate = useNavigate();

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
  const prevTotalViews = prevMetrics.length;
  const todayViews = useMemo(() => {
    const todayStart = startOfDay(new Date()).toISOString();
    return metrics.filter((m) => m.viewed_at >= todayStart).length;
  }, [metrics]);
  const avgViewsPerPost = posts.length ? Math.round(totalViews / posts.length) : 0;
  const prevAvgViewsPerPost = posts.length ? Math.round(prevTotalViews / posts.length) : 0;

  const handlePostClick = (postId: string) => {
    navigate(`/admin/analytics/blog_views?range=${range}&filterKey=post_id&filterValue=${encodeURIComponent(postId)}`);
  };

  const handleReferrerClick = (source: string) => {
    navigate(`/admin/analytics/blog_views?range=${range}&filterKey=referrer&filterValue=${encodeURIComponent(source)}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards with trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Eye} value={totalViews.toLocaleString()} label="Total Views (30d)" currentValue={totalViews} previousValue={prevTotalViews} href={`/admin/analytics/blog_views?range=${range}`} />
        <KpiCard icon={TrendingUp} value={todayViews.toLocaleString()} label="Today" href={`/admin/analytics/blog_today?range=${range}`} />
        <KpiCard icon={FileText} value={String(posts.length)} label="Published Posts" href={`/admin/analytics/blog_posts?range=${range}`} />
        <KpiCard icon={Globe} value={String(avgViewsPerPost)} label="Avg Views/Post" currentValue={avgViewsPerPost} previousValue={prevAvgViewsPerPost} href={`/admin/analytics/blog_views?range=${range}`} />
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
        <Card>
          <CardHeader><CardTitle className="text-base">Top Posts</CardTitle></CardHeader>
          <CardContent>
            {topPosts.length > 0 ? (
              <div className="space-y-3">
                {topPosts.map((p, i) => (
                  <div 
                    key={p.postId} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1 -mx-1"
                    onClick={() => handlePostClick(p.postId)}
                  >
                    <span className="text-sm font-bold text-muted-foreground w-6 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground hover:text-primary truncate block">
                        {p.title}
                      </span>
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

        <Card>
          <CardHeader><CardTitle className="text-base">Traffic Sources</CardTitle></CardHeader>
          <CardContent>
            {topReferrers.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, topReferrers.length * 36)}>
                <BarChart data={topReferrers} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar 
                    dataKey="views" 
                    fill="hsl(var(--accent))" 
                    radius={[0, 4, 4, 0]} 
                    className="cursor-pointer"
                    onClick={(data) => {
                      if (data?.source) handleReferrerClick(data.source);
                    }}
                  />
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
