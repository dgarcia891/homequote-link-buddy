import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, TrendingUp, Target, Zap } from "lucide-react";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";

interface Props {
  leads: any[];
  events: any[];
  verticalFilter: string;
  onVerticalFilterChange: (v: string) => void;
  verticals: string[];
}

export function LeadsTab({ leads, events, verticalFilter, onVerticalFilterChange, verticals }: Props) {
  const filtered = useMemo(
    () => verticalFilter === "all" ? leads : leads.filter((l) => l.vertical === verticalFilter),
    [leads, verticalFilter]
  );

  // Lead volume over time
  const volumeOverTime = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((l) => {
      const day = format(new Date(l.created_at), "MMM d");
      counts.set(day, (counts.get(day) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
  }, [filtered]);

  // Leads by vertical
  const byVertical = useMemo(() => {
    const counts = new Map<string, number>();
    leads.forEach((l) => counts.set(l.vertical, (counts.get(l.vertical) || 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([vertical, count]) => ({ vertical, count }));
  }, [leads]);

  // Lead quality trend (weekly avg)
  const qualityTrend = useMemo(() => {
    const weeklyScores = new Map<string, { sum: number; count: number }>();
    filtered.forEach((l) => {
      if (l.lead_score != null) {
        const week = format(new Date(l.created_at), "MMM d");
        const entry = weeklyScores.get(week) || { sum: 0, count: 0 };
        entry.sum += l.lead_score;
        entry.count += 1;
        weeklyScores.set(week, entry);
      }
    });
    return Array.from(weeklyScores.entries()).map(([date, { sum, count }]) => ({
      date,
      avgScore: Math.round(sum / count),
    }));
  }, [filtered]);

  // Leads by source/UTM
  const bySource = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((l) => {
      const src = l.utm_source || l.source || "direct";
      counts.set(src, (counts.get(src) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));
  }, [filtered]);

  // Leads by city
  const byCity = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((l) => {
      if (l.city) counts.set(l.city, (counts.get(l.city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));
  }, [filtered]);

  // Form abandonment
  const formAbandonment = useMemo(() => {
    const formSteps = events.filter((e) => e.event_type === "form_step");
    const step1 = formSteps.filter((e) => e.event_name === "form_step_1_complete").length;
    const step3 = formSteps.filter((e) => e.event_name === "form_step_3_submit").length;
    const rate = step1 > 0 ? (((step1 - step3) / step1) * 100).toFixed(1) : "0";
    return { step1, step3, rate };
  }, [events]);

  const totalLeads = filtered.length;
  const avgScore = useMemo(() => {
    const scored = filtered.filter((l) => l.lead_score != null);
    if (scored.length === 0) return 0;
    return Math.round(scored.reduce((a, l) => a + l.lead_score, 0) / scored.length);
  }, [filtered]);

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
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalLeads.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{avgScore}</p>
                <p className="text-xs text-muted-foreground">Avg Lead Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{formAbandonment.step3}</p>
                <p className="text-xs text-muted-foreground">Form Completions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{formAbandonment.rate}%</p>
                <p className="text-xs text-muted-foreground">Form Abandonment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead volume over time */}
      <Card>
        <CardHeader><CardTitle className="text-base">Lead Volume Over Time</CardTitle></CardHeader>
        <CardContent>
          {volumeOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={volumeOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" interval="preserveStartEnd" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No lead data yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Vertical */}
        <Card>
          <CardHeader><CardTitle className="text-base">Leads by Vertical</CardTitle></CardHeader>
          <CardContent>
            {byVertical.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byVertical}>
                  <XAxis dataKey="vertical" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data.</p>
            )}
          </CardContent>
        </Card>

        {/* Lead Quality Trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Lead Quality Trend</CardTitle></CardHeader>
          <CardContent>
            {qualityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No scored leads yet.</p>
            )}
          </CardContent>
        </Card>

        {/* By Source */}
        <Card>
          <CardHeader><CardTitle className="text-base">Leads by Source</CardTitle></CardHeader>
          <CardContent>
            {bySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, bySource.length * 32)}>
                <BarChart data={bySource} layout="vertical">
                  <XAxis type="number" allowDecimals={false} className="text-xs" />
                  <YAxis type="category" dataKey="source" width={100} className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No source data.</p>
            )}
          </CardContent>
        </Card>

        {/* By City */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Cities</CardTitle></CardHeader>
          <CardContent>
            {byCity.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCity.map((c) => (
                    <TableRow key={c.city}>
                      <TableCell className="text-sm">{c.city}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{c.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No city data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
