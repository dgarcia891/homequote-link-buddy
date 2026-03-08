import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, MousePointer, Users, ArrowRightLeft, TrendingUp, Globe } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const COLORS = ["hsl(25 95% 53%)", "hsl(215 25% 27%)", "hsl(45 93% 47%)", "hsl(150 60% 40%)", "hsl(0 70% 55%)", "hsl(270 50% 55%)", "hsl(180 50% 45%)"];

type DateRange = "7d" | "30d" | "90d";

function useAnalyticsEvents(range: DateRange) {
  const since = useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return startOfDay(subDays(new Date(), days)).toISOString();
  }, [range]);

  return useQuery({
    queryKey: ["analytics_events", range],
    queryFn: async () => {
      // Fetch up to 5000 events in the range
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000,
  });
}

export default function SiteAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("7d");
  const { data: events, isLoading } = useAnalyticsEvents(range);

  const stats = useMemo(() => {
    if (!events || events.length === 0) return null;

    const pageViews = events.filter((e) => e.event_type === "page_view");
    const clicks = events.filter((e) => e.event_type === "click");
    const formSteps = events.filter((e) => e.event_type === "form_step");
    const conversions = events.filter((e) => e.event_type === "conversion");

    const uniqueVisitors = new Set(events.map((e) => e.visitor_id)).size;
    const uniqueSessions = new Set(events.map((e) => e.session_id)).size;

    // Page views by day
    const pvByDay = new Map<string, number>();
    pageViews.forEach((e) => {
      const day = format(new Date(e.created_at), "MMM d");
      pvByDay.set(day, (pvByDay.get(day) || 0) + 1);
    });
    const pageViewsByDay = Array.from(pvByDay.entries()).map(([day, views]) => ({ day, views })).reverse();

    // Top pages
    const pageCounts = new Map<string, number>();
    pageViews.forEach((e) => {
      const p = e.page_path || "/";
      pageCounts.set(p, (pageCounts.get(p) || 0) + 1);
    });
    const topPages = Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // Click breakdown
    const clickCounts = new Map<string, number>();
    clicks.forEach((e) => {
      const name = e.event_name || "unknown";
      clickCounts.set(name, (clickCounts.get(name) || 0) + 1);
    });
    const topClicks = Array.from(clickCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Form funnel
    const funnelCounts = new Map<string, number>();
    formSteps.forEach((e) => {
      const name = e.event_name || "unknown";
      funnelCounts.set(name, (funnelCounts.get(name) || 0) + 1);
    });
    const funnel = [
      { step: "Step 1: Service", count: funnelCounts.get("form_step_1_complete") || 0 },
      { step: "Step 2: Location", count: funnelCounts.get("form_step_2_complete") || 0 },
      { step: "Step 3: Contact", count: funnelCounts.get("form_step_3_submit") || 0 },
    ];

    // Source attribution
    const sourceCounts = new Map<string, number>();
    events.forEach((e) => {
      const source = e.utm_source || (e.referrer ? "referral" : "direct");
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });
    const sources = Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([source, count]) => ({ source, count }));

    // Device breakdown
    const mobileCount = events.filter((e) => (e.screen_width || 0) < 768).length;
    const tabletCount = events.filter((e) => (e.screen_width || 0) >= 768 && (e.screen_width || 0) < 1024).length;
    const desktopCount = events.filter((e) => (e.screen_width || 0) >= 1024).length;
    const devices = [
      { name: "Mobile", value: mobileCount },
      { name: "Tablet", value: tabletCount },
      { name: "Desktop", value: desktopCount },
    ].filter((d) => d.value > 0);

    // Referrer breakdown
    const refCounts = new Map<string, number>();
    pageViews.forEach((e) => {
      if (e.referrer) {
        try {
          const host = new URL(e.referrer).hostname;
          refCounts.set(host, (refCounts.get(host) || 0) + 1);
        } catch {
          refCounts.set(e.referrer, (refCounts.get(e.referrer) || 0) + 1);
        }
      }
    });
    const topReferrers = Array.from(refCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    return {
      totalPageViews: pageViews.length,
      uniqueVisitors,
      uniqueSessions,
      totalClicks: clicks.length,
      totalConversions: conversions.length,
      pageViewsByDay,
      topPages,
      topClicks,
      funnel,
      sources,
      devices,
      topReferrers,
    };
  }, [events]);

  return (
    <>
      <PageMeta title="Site Analytics | Admin" description="Full site analytics dashboard." />
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-sans">Site Analytics</h1>
          <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : !stats ? (
          <p className="text-center text-muted-foreground py-20">No analytics data yet. Visit the public site to start collecting data.</p>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalPageViews.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Page Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Unique Visitors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{stats.uniqueSessions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Button Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Conversions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Views Over Time */}
            <Card>
              <CardHeader><CardTitle className="text-base">Page Views Over Time</CardTitle></CardHeader>
              <CardContent>
                {stats.pageViewsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.pageViewsByDay}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No page view data yet.</p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Form Funnel */}
              <Card>
                <CardHeader><CardTitle className="text-base">Lead Form Funnel</CardTitle></CardHeader>
                <CardContent>
                  {stats.funnel.some((f) => f.count > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.funnel} layout="vertical">
                        <XAxis type="number" className="text-xs" />
                        <YAxis type="category" dataKey="step" width={120} className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(215 25% 27%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No form submissions tracked yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Source Attribution */}
              <Card>
                <CardHeader><CardTitle className="text-base">Traffic Sources</CardTitle></CardHeader>
                <CardContent>
                  {stats.sources.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={stats.sources} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}>
                          {stats.sources.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No source data yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader><CardTitle className="text-base">Device Breakdown</CardTitle></CardHeader>
                <CardContent>
                  {stats.devices.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={stats.devices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {stats.devices.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No device data yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Referrers */}
              <Card>
                <CardHeader><CardTitle className="text-base">Top Referrers</CardTitle></CardHeader>
                <CardContent>
                  {stats.topReferrers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Domain</TableHead>
                          <TableHead className="text-right">Views</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.topReferrers.map((r) => (
                          <TableRow key={r.domain}>
                            <TableCell className="text-sm flex items-center gap-2"><Globe className="h-3 w-3 text-muted-foreground" />{r.domain}</TableCell>
                            <TableCell className="text-right text-sm">{r.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No referrer data yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Pages */}
              <Card>
                <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topPages.map((p) => (
                        <TableRow key={p.page}>
                          <TableCell className="text-sm font-mono">{p.page}</TableCell>
                          <TableCell className="text-right text-sm">{p.views}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Top Clicks */}
              <Card>
                <CardHeader><CardTitle className="text-base">Button Clicks</CardTitle></CardHeader>
                <CardContent>
                  {stats.topClicks.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Element</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.topClicks.map((c) => (
                          <TableRow key={c.name}>
                            <TableCell className="text-sm">
                              <Badge variant="outline">{c.name.replace(/_/g, " ")}</Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm">{c.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No click data yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
