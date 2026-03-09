import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageMeta } from "@/components/PageMeta";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, ShieldBan, Clock } from "lucide-react";
import { format } from "date-fns";

const EVENT_LABELS: Record<string, { label: string; icon: typeof ShieldAlert; variant: "destructive" | "secondary" | "default" }> = {
  blocked_email: { label: "Blocked Email", icon: ShieldBan, variant: "destructive" },
  blocked_phone: { label: "Blocked Phone", icon: ShieldBan, variant: "destructive" },
  rate_limited: { label: "Rate Limited", icon: Clock, variant: "secondary" },
};

type TimeRange = "24h" | "7d" | "30d";

function useSpamEvents(range: TimeRange) {
  return useQuery({
    queryKey: ["spam-events", range],
    queryFn: async () => {
      const hours = range === "24h" ? 24 : range === "7d" ? 168 : 720;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await (supabase as any)
        .from("spam_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as Array<{
        id: string;
        event_type: string;
        email: string | null;
        phone: string | null;
        ip_address: string | null;
        metadata: Record<string, unknown> | null;
        created_at: string;
      }>;
    },
    refetchInterval: 30000,
  });
}

export default function SpamMonitor() {
  const [range, setRange] = useState<TimeRange>("24h");
  const { data: events, isLoading } = useSpamEvents(range);

  const counts = {
    blocked_email: events?.filter((e) => e.event_type === "blocked_email").length ?? 0,
    blocked_phone: events?.filter((e) => e.event_type === "blocked_phone").length ?? 0,
    rate_limited: events?.filter((e) => e.event_type === "rate_limited").length ?? 0,
  };

  return (
    <AdminLayout>
      <PageMeta title="Spam Monitor | Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Spam Monitor</h1>
            <p className="text-sm text-muted-foreground">Blocked and rate-limited submission attempts</p>
          </div>
          <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(EVENT_LABELS).map(([key, { label, icon: Icon, variant }]) => (
            <div key={key} className="rounded-lg border bg-card p-4 flex items-center gap-4">
              <div className="rounded-full bg-muted p-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{counts[key as keyof typeof counts]}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Event log table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !events?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No spam events in this time range — looking clean!</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const config = EVENT_LABELS[event.event_type] ?? {
                    label: event.event_type,
                    variant: "default" as const,
                  };
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {event.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {event.phone || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {event.ip_address || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.created_at), "MMM d, h:mm a")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
