import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { startOfDay, subDays } from "date-fns";
import { SiteTrafficTab } from "@/components/admin/analytics/SiteTrafficTab";
import { LeadsTab } from "@/components/admin/analytics/LeadsTab";
import { RevenueTab } from "@/components/admin/analytics/RevenueTab";
import { BlogTab } from "@/components/admin/analytics/BlogTab";

type DateRange = "7d" | "30d" | "90d";

export default function SiteAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [verticalFilter, setVerticalFilter] = useState("all");

  const since = useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return startOfDay(subDays(new Date(), days)).toISOString();
  }, [range]);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["analytics_hub_events", range],
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
    refetchInterval: 60000,
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["analytics_hub_leads", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(5000);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: buyers } = useQuery({
    queryKey: ["analytics_hub_buyers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("buyers").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const blogSince = useMemo(() => subDays(new Date(), 30).toISOString(), []);

  const { data: blogMetrics } = useQuery({
    queryKey: ["analytics_hub_blog_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_metrics")
        .select("post_id, viewed_at, referrer")
        .gte("viewed_at", blogSince)
        .order("viewed_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["analytics_hub_blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug")
        .eq("status", "published");
      if (error) throw error;
      return data || [];
    },
  });

  const verticals = useMemo(() => {
    if (!leads) return [];
    return Array.from(new Set(leads.map((l) => l.vertical))).sort();
  }, [leads]);

  const isLoading = eventsLoading || leadsLoading;

  return (
    <>
      <PageMeta title="Analytics | Admin" description="Comprehensive analytics dashboard." />
      <AdminLayout>
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h1 className="text-2xl font-bold font-sans">Analytics</h1>
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
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="traffic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="traffic">Site Traffic</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="revenue">Revenue & ROI</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
            </TabsList>

            <TabsContent value="traffic">
              <SiteTrafficTab events={events || []} />
            </TabsContent>

            <TabsContent value="leads">
              <LeadsTab
                leads={leads || []}
                events={events || []}
                verticalFilter={verticalFilter}
                onVerticalFilterChange={setVerticalFilter}
                verticals={verticals}
              />
            </TabsContent>

            <TabsContent value="revenue">
              <RevenueTab
                leads={leads || []}
                buyers={buyers || []}
                verticalFilter={verticalFilter}
                onVerticalFilterChange={setVerticalFilter}
                verticals={verticals}
              />
            </TabsContent>

            <TabsContent value="blog">
              <BlogTab metrics={blogMetrics || []} posts={blogPosts || []} />
            </TabsContent>
          </Tabs>
        )}
      </AdminLayout>
    </>
  );
}
