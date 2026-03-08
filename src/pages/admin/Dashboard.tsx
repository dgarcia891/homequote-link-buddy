import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeads } from "@/hooks/useLeads";
import { supabase } from "@/integrations/supabase/client";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SCV_CITIES, SERVICE_TYPES, LEAD_STATUSES, URGENCY_LEVELS } from "@/lib/constants";
import { Search, Loader2, ScanSearch } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  partial: "bg-amber-100 text-amber-800",
  duplicate: "bg-yellow-100 text-yellow-800",
  pending_review: "bg-orange-100 text-orange-800",
  routed: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  sold: "bg-emerald-100 text-emerald-800",
  refunded: "bg-gray-100 text-gray-800",
  archived: "bg-gray-100 text-gray-500",
};

const PAGE_SIZE = 50;

function LeadsTable({ leads, isLoading, page, setPage, totalCount, navigate }: {
  leads: any[] | undefined;
  isLoading: boolean;
  page: number;
  setPage: (fn: (p: number) => number) => void;
  totalCount: number;
  navigate: (path: string) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>AI Authenticity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads && leads.length > 0 ? leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => navigate(`/admin/leads/${lead.id}`)}
              >
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(lead.created_at), "MMM d, h:mm a")}
                </TableCell>
                <TableCell className="font-medium">{lead.full_name || "—"}</TableCell>
                <TableCell className="text-sm">{lead.phone}</TableCell>
                <TableCell className="text-sm">{lead.email || "—"}</TableCell>
                <TableCell className="text-sm">{lead.city || "—"}</TableCell>
                <TableCell className="text-sm">{lead.service_type || "—"}</TableCell>
                <TableCell className="text-sm capitalize">{lead.urgency || "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[lead.status] || ""}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{(lead as any).buyers?.business_name || "—"}</TableCell>
                <TableCell className="text-sm">{lead.lead_score ?? "—"}</TableCell>
                <TableCell>
                  {(lead as any).ai_authenticity_score != null ? (
                    <Badge
                      variant="secondary"
                      className={
                        (lead as any).ai_authenticity_score >= 70
                          ? "bg-green-100 text-green-800"
                          : (lead as any).ai_authenticity_score >= 40
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {(lead as any).ai_authenticity_score}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">No leads found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          {totalCount} lead{totalCount !== 1 ? "s" : ""} total
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [page, setPage] = useState(0);
  const [scanning, setScanning] = useState<"unscanned" | "all" | null>(null);
  const navigate = useNavigate();

  async function bulkScan(mode: "unscanned" | "all") {
    setScanning(mode);
    try {
      let query = supabase.from("leads").select("id, ai_authenticity_score");
      if (mode === "unscanned") {
        query = query.is("ai_authenticity_score", null);
      }
      const { data: leads, error } = await query;
      if (error) throw error;
      if (!leads || leads.length === 0) {
        toast.info("No leads to scan.");
        return;
      }
      toast.info(`Scanning ${leads.length} lead${leads.length !== 1 ? "s" : ""}…`);
      let done = 0;
      let failed = 0;
      // Process in batches of 5 to avoid rate limits
      for (let i = 0; i < leads.length; i += 5) {
        const batch = leads.slice(i, i + 5);
        const results = await Promise.allSettled(
          batch.map(async (lead) => {
            const { data, error } = await supabase.functions.invoke("analyze-lead", { body: { leadId: lead.id } });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            return data;
          })
        );
        results.forEach((r) => {
          if (r.status === "fulfilled") done++;
          else failed++;
        });
      }
      if (done === 0 && failed > 0) {
        toast.error(`Scan failed: all ${failed} lead${failed !== 1 ? "s" : ""} could not be analyzed`);
      } else if (failed > 0) {
        toast.warning(`Scan finished: ${done} analyzed, ${failed} failed`);
      } else {
        toast.success(`Scan complete: ${done} lead${done !== 1 ? "s" : ""} analyzed`);
      }
    } catch (e) {
      toast.error("Bulk scan failed");
      console.error(e);
    } finally {
      setScanning(null);
    }
  }

  const isPartialTab = tab === "partial";

  const { data: result, isLoading } = useLeads({
    search: search || undefined,
    status: isPartialTab ? "partial" : status || undefined,
    city: city || undefined,
    service_type: serviceType || undefined,
    urgency: urgency || undefined,
    page,
    pageSize: PAGE_SIZE,
    includePartial: isPartialTab,
  });

  const leads = result?.data;
  const totalCount = result?.count ?? 0;

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => {
      setter(v === "all" ? "" : v);
      setPage(0);
    };
  }

  function handleTabChange(value: string) {
    setTab(value);
    setPage(0);
    setStatus("");
  }

  return (
    <>
      <PageMeta title="Leads Dashboard | HomeQuoteLink Admin" description="Manage incoming plumbing leads." />
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-sans">Leads Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={scanning !== null}
              onClick={() => bulkScan("unscanned")}
            >
              {scanning === "unscanned" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ScanSearch className="h-4 w-4 mr-1" />}
              Scan Unscanned
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={scanning !== null}
              onClick={() => bulkScan("all")}
            >
              {scanning === "all" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ScanSearch className="h-4 w-4 mr-1" />}
              Re-scan All
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="active">Active Leads</TabsTrigger>
            <TabsTrigger value="partial">Partial / Abandoned</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            {!isPartialTab && (
              <Select value={status} onValueChange={handleFilterChange(setStatus)}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Select value={city} onValueChange={handleFilterChange(setCity)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {SCV_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={serviceType} onValueChange={handleFilterChange(setServiceType)}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Service" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {SERVICE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={urgency} onValueChange={handleFilterChange(setUrgency)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                {URGENCY_LEVELS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="active">
            <LeadsTable leads={leads} isLoading={isLoading} page={page} setPage={setPage} totalCount={totalCount} navigate={navigate} />
          </TabsContent>
          <TabsContent value="partial">
            <LeadsTable leads={leads} isLoading={isLoading} page={page} setPage={setPage} totalCount={totalCount} navigate={navigate} />
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}
