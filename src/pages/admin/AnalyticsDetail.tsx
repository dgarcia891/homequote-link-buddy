import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { startOfDay, subDays } from "date-fns";

const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

const METRIC_LABELS: Record<string, string> = {
  page_views: "Page Views",
  visitors: "Visitors",
  sessions: "Sessions",
  clicks: "Clicks",
  conversions: "Conversions",
  bounce: "Bounced Sessions",
  pages_per_session: "Pages per Session",
};

type SortDir = "asc" | "desc";

export default function AnalyticsDetailPage() {
  const { metric } = useParams<{ metric: string }>();
  const [searchParams] = useSearchParams();
  const range = searchParams.get("range") || "30d";
  const days = RANGE_DAYS[range] || 30;
  const since = useMemo(() => startOfDay(subDays(new Date(), days)).toISOString(), [days]);

  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: events, isLoading } = useQuery({
    queryKey: ["analytics_detail", metric, range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data || [];
    },
  });

  const processed = useMemo(() => {
    if (!events) return [];

    if (metric === "page_views") {
      return events.filter((e) => e.event_type === "page_view");
    }
    if (metric === "clicks") {
      return events.filter((e) => e.event_type === "click");
    }
    if (metric === "conversions") {
      return events.filter((e) => e.event_type === "conversion");
    }

    if (metric === "visitors") {
      const grouped = new Map<string, any[]>();
      events.forEach((e) => {
        const vid = e.visitor_id || "unknown";
        if (!grouped.has(vid)) grouped.set(vid, []);
        grouped.get(vid)!.push(e);
      });
      return Array.from(grouped.entries()).map(([visitor_id, evts]) => {
        const sorted = evts.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const pages = new Set(evts.map((e: any) => e.page_path));
        return {
          visitor_id,
          first_seen: sorted[0].created_at,
          last_seen: sorted[sorted.length - 1].created_at,
          event_count: evts.length,
          pages_visited: pages.size,
          pages_list: Array.from(pages).join(", "),
        };
      });
    }

    if (metric === "sessions" || metric === "bounce" || metric === "pages_per_session") {
      const grouped = new Map<string, any[]>();
      events.forEach((e) => {
        const sid = e.session_id || "unknown";
        if (!grouped.has(sid)) grouped.set(sid, []);
        grouped.get(sid)!.push(e);
      });
      const sessionRows = Array.from(grouped.entries()).map(([session_id, evts]) => {
        const sorted = evts.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const pageViews = evts.filter((e: any) => e.event_type === "page_view").length;
        const startTime = new Date(sorted[0].created_at).getTime();
        const endTime = new Date(sorted[sorted.length - 1].created_at).getTime();
        const durationSec = Math.round((endTime - startTime) / 1000);
        const isBounce = pageViews <= 1;
        return {
          session_id,
          visitor_id: sorted[0].visitor_id,
          start_time: sorted[0].created_at,
          event_count: evts.length,
          page_views: pageViews,
          duration_sec: durationSec,
          is_bounce: isBounce,
        };
      });

      if (metric === "bounce") return sessionRows.filter((s) => s.is_bounce);
      return sessionRows;
    }

    return events;
  }, [events, metric]);

  const filtered = useMemo(() => {
    if (!search) return processed;
    const q = search.toLowerCase();
    return processed.filter((row: any) =>
      Object.values(row).some((v) => v != null && String(v).toLowerCase().includes(q))
    );
  }, [processed, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a: any, b: any) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const isGroupedView = metric === "visitors" || metric === "sessions" || metric === "bounce" || metric === "pages_per_session";

  const SortHeader = ({ col, children }: { col: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(col)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <>
      <PageMeta title={`${METRIC_LABELS[metric || ""] || "Detail"} | Analytics`} description="Analytics detail view" />
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/analytics"><ArrowLeft className="h-4 w-4 mr-1" />Back to Analytics</Link>
            </Button>
            <h1 className="text-xl font-bold">{METRIC_LABELS[metric || ""] || "Detail"}</h1>
            <Badge variant="outline">{range} — {sorted.length} records</Badge>
          </div>

          <Input
            placeholder="Search across all fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">No data found.</p>
          ) : metric === "visitors" ? (
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader col="visitor_id">Visitor ID</SortHeader>
                    <SortHeader col="first_seen">First Seen</SortHeader>
                    <SortHeader col="last_seen">Last Seen</SortHeader>
                    <SortHeader col="event_count">Events</SortHeader>
                    <SortHeader col="pages_visited">Pages</SortHeader>
                    <TableHead>Pages Visited</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{r.visitor_id}</TableCell>
                      <TableCell className="text-sm">{format(new Date(r.first_seen), "MMM d, HH:mm")}</TableCell>
                      <TableCell className="text-sm">{format(new Date(r.last_seen), "MMM d, HH:mm")}</TableCell>
                      <TableCell className="text-sm">{r.event_count}</TableCell>
                      <TableCell className="text-sm">{r.pages_visited}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{r.pages_list}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : metric === "sessions" || metric === "bounce" || metric === "pages_per_session" ? (
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader col="session_id">Session ID</SortHeader>
                    <SortHeader col="visitor_id">Visitor</SortHeader>
                    <SortHeader col="start_time">Start Time</SortHeader>
                    <SortHeader col="event_count">Events</SortHeader>
                    <SortHeader col="page_views">Page Views</SortHeader>
                    <SortHeader col="duration_sec">Duration</SortHeader>
                    <TableHead>Bounce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{r.session_id}</TableCell>
                      <TableCell className="font-mono text-xs">{r.visitor_id}</TableCell>
                      <TableCell className="text-sm">{format(new Date(r.start_time), "MMM d, HH:mm")}</TableCell>
                      <TableCell className="text-sm">{r.event_count}</TableCell>
                      <TableCell className="text-sm">{r.page_views}</TableCell>
                      <TableCell className="text-sm">{r.duration_sec}s</TableCell>
                      <TableCell>{r.is_bounce ? <Badge variant="destructive" className="text-xs">Bounce</Badge> : <Badge variant="outline" className="text-xs">Engaged</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Raw events table for page_views, clicks, conversions */
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader col="created_at">Time</SortHeader>
                    <SortHeader col="event_type">Type</SortHeader>
                    <SortHeader col="event_name">Name</SortHeader>
                    <SortHeader col="page_path">Page</SortHeader>
                    <SortHeader col="referrer">Referrer</SortHeader>
                    <SortHeader col="visitor_id">Visitor</SortHeader>
                    <SortHeader col="session_id">Session</SortHeader>
                    <TableHead>UTM Source</TableHead>
                    <TableHead>UTM Medium</TableHead>
                    <TableHead>UTM Campaign</TableHead>
                    <TableHead>GCLID</TableHead>
                    <TableHead>Screen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm whitespace-nowrap">{format(new Date(e.created_at), "MMM d, HH:mm:ss")}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{e.event_type}</Badge></TableCell>
                      <TableCell className="text-sm">{e.event_name || "—"}</TableCell>
                      <TableCell className="text-sm font-mono max-w-[200px] truncate">{e.page_path || "—"}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">{e.referrer || "—"}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[100px] truncate">{e.visitor_id || "—"}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[100px] truncate">{e.session_id || "—"}</TableCell>
                      <TableCell className="text-xs">{e.utm_source || "—"}</TableCell>
                      <TableCell className="text-xs">{e.utm_medium || "—"}</TableCell>
                      <TableCell className="text-xs">{e.utm_campaign || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{e.gclid || "—"}</TableCell>
                      <TableCell className="text-xs">{e.screen_width && e.screen_height ? `${e.screen_width}×${e.screen_height}` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
