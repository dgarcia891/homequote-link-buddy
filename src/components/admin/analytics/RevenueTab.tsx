import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Zap, Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from "recharts";

interface Props {
  leads: any[];
  buyers: any[];
  verticalFilter: string;
  onVerticalFilterChange: (v: string) => void;
  verticals: string[];
}

const STATUS_ORDER = ["new", "routed", "accepted", "sold"];
const STATUS_COLORS: Record<string, string> = {
  new: "hsl(var(--muted-foreground))",
  routed: "hsl(var(--accent))",
  accepted: "hsl(var(--primary))",
  sold: "hsl(150 60% 40%)",
};

export function RevenueTab({ leads, buyers, verticalFilter, onVerticalFilterChange, verticals }: Props) {
  const filtered = useMemo(
    () => verticalFilter === "all" ? leads : leads.filter((l) => l.vertical === verticalFilter),
    [leads, verticalFilter]
  );

  // Status funnel
  const funnel = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((l) => counts.set(l.status, (counts.get(l.status) || 0) + 1));
    return STATUS_ORDER.map((status) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: counts.get(status) || 0,
      fill: STATUS_COLORS[status],
    }));
  }, [filtered]);

  // Buyer performance
  const buyerPerformance = useMemo(() => {
    const buyerMap = new Map(buyers.map((b) => [b.id, b]));
    const stats = new Map<string, { received: number; accepted: number; sold: number }>();
    filtered.forEach((l) => {
      if (l.assigned_buyer_id) {
        const entry = stats.get(l.assigned_buyer_id) || { received: 0, accepted: 0, sold: 0 };
        entry.received++;
        if (l.status === "accepted" || l.status === "sold") entry.accepted++;
        if (l.status === "sold") entry.sold++;
        stats.set(l.assigned_buyer_id, entry);
      }
    });
    return Array.from(stats.entries())
      .map(([buyerId, s]) => ({
        buyerId,
        name: buyerMap.get(buyerId)?.business_name || "Unknown",
        ...s,
        acceptRate: s.received > 0 ? ((s.accepted / s.received) * 100).toFixed(0) : "0",
      }))
      .sort((a, b) => b.received - a.received)
      .slice(0, 10);
  }, [filtered, buyers]);

  // Revenue per vertical (sold leads count)
  const revenueByVertical = useMemo(() => {
    const counts = new Map<string, number>();
    leads.filter((l) => l.status === "sold").forEach((l) => {
      counts.set(l.vertical, (counts.get(l.vertical) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([vertical, count]) => ({ vertical, sold: count }));
  }, [leads]);

  // Paid vs organic
  const paidVsOrganic = useMemo(() => {
    const paid = filtered.filter((l) => l.gclid).length;
    const organic = filtered.length - paid;
    return [
      { type: "Paid (GCLID)", count: paid },
      { type: "Organic", count: organic },
    ];
  }, [filtered]);

  // Top service types by conversion
  const topServiceTypes = useMemo(() => {
    const typeStats = new Map<string, { total: number; sold: number }>();
    filtered.forEach((l) => {
      const st = l.service_type || "unknown";
      const entry = typeStats.get(st) || { total: 0, sold: 0 };
      entry.total++;
      if (l.status === "sold") entry.sold++;
      typeStats.set(st, entry);
    });
    return Array.from(typeStats.entries())
      .filter(([, s]) => s.total >= 2)
      .map(([type, s]) => ({
        type,
        total: s.total,
        sold: s.sold,
        convRate: ((s.sold / s.total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
  }, [filtered]);

  const totalSold = filtered.filter((l) => l.status === "sold").length;
  const totalRouted = filtered.filter((l) => l.assigned_buyer_id).length;

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex justify-end">
        <Select value={verticalFilter} onValueChange={onVerticalFilterChange}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Verticals" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            {verticals.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalSold}</p>
                <p className="text-xs text-muted-foreground">Leads Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalRouted}</p>
                <p className="text-xs text-muted-foreground">Leads Routed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {totalRouted > 0 ? ((totalSold / totalRouted) * 100).toFixed(1) : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">Close Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{paidVsOrganic[0].count}</p>
                <p className="text-xs text-muted-foreground">Paid Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-base">Lead Status Funnel</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnel}>
              <XAxis dataKey="status" className="text-xs" />
              <YAxis allowDecimals={false} className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {funnel.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Buyer Performance */}
        <Card>
          <CardHeader><CardTitle className="text-base">Buyer Performance</CardTitle></CardHeader>
          <CardContent>
            {buyerPerformance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Accepted</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Accept %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyerPerformance.map((b) => (
                    <TableRow key={b.buyerId}>
                      <TableCell className="text-sm font-medium">{b.name}</TableCell>
                      <TableCell className="text-right text-sm">{b.received}</TableCell>
                      <TableCell className="text-right text-sm">{b.accepted}</TableCell>
                      <TableCell className="text-right text-sm">{b.sold}</TableCell>
                      <TableCell className="text-right text-sm">{b.acceptRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No routed leads yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Paid vs Organic */}
        <Card>
          <CardHeader><CardTitle className="text-base">Paid vs Organic Leads</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paidVsOrganic}>
                <XAxis dataKey="type" className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Vertical */}
        <Card>
          <CardHeader><CardTitle className="text-base">Sold Leads by Vertical</CardTitle></CardHeader>
          <CardContent>
            {revenueByVertical.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByVertical}>
                  <XAxis dataKey="vertical" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="sold" fill="hsl(150 60% 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sold leads yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Service Types */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Service Types</CardTitle></CardHeader>
          <CardContent>
            {topServiceTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Conv %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topServiceTypes.map((s) => (
                    <TableRow key={s.type}>
                      <TableCell className="text-sm"><Badge variant="outline">{s.type}</Badge></TableCell>
                      <TableCell className="text-right text-sm">{s.total}</TableCell>
                      <TableCell className="text-right text-sm">{s.sold}</TableCell>
                      <TableCell className="text-right text-sm">{s.convRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Not enough data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
