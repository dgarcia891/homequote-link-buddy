import { useParams, useNavigate } from "react-router-dom";
import { useLead, useUpdateLead } from "@/hooks/useLeads";
import { useBuyers } from "@/hooks/useBuyers";
import { useLeadEvents, useInsertLeadEvent } from "@/hooks/useLeadEvents";
import { useAuth } from "@/hooks/useAuth";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { LEAD_STATUSES } from "@/lib/constants";
import { ArrowLeft, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

const DESTRUCTIVE_STATUSES = ["archived", "refunded", "rejected"];

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lead, isLoading } = useLead(id);
  const { data: buyers } = useBuyers();
  const { data: events } = useLeadEvents(id);
  const updateLead = useUpdateLead();
  const insertEvent = useInsertLeadEvent();
  const [noteText, setNoteText] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (lead) setReviewReason(lead.review_reason || "");
  }, [lead]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <p className="py-20 text-center text-muted-foreground">Lead not found.</p>
      </AdminLayout>
    );
  }

  async function handleUpdate(field: string, value: any) {
    try {
      await updateLead.mutateAsync({ id: lead!.id, [field]: value });
      await insertEvent.mutateAsync({
        lead_id: lead!.id,
        event_type: "field_update",
        event_detail: `${field} changed to ${value}`,
        created_by_user_id: user?.id,
      });
      toast({ title: "Updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  function handleStatusChange(newStatus: string) {
    if (DESTRUCTIVE_STATUSES.includes(newStatus)) {
      setPendingStatus(newStatus);
    } else {
      handleUpdate("status", newStatus);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    try {
      await updateLead.mutateAsync({ id: lead!.id, notes: (lead!.notes ? lead!.notes + "\n" : "") + noteText });
      await insertEvent.mutateAsync({
        lead_id: lead!.id,
        event_type: "note_added",
        event_detail: noteText,
        created_by_user_id: user?.id,
      });
      setNoteText("");
      toast({ title: "Note added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const buyersEmpty = !buyers || buyers.length === 0;

  return (
    <>
      <PageMeta title={`Lead: ${lead.full_name} | Admin`} description="Lead detail view." />
      <AdminLayout>
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h1 className="text-2xl font-bold mb-1 font-sans">{lead.full_name}</h1>
              <p className="text-sm text-muted-foreground mb-4">Submitted {format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium">{lead.phone}</p></div>
                <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{lead.email || "—"}</p></div>
                <div><Label className="text-xs text-muted-foreground">City</Label><p className="font-medium">{lead.city}</p></div>
                <div><Label className="text-xs text-muted-foreground">ZIP</Label><p className="font-medium">{lead.zip_code}</p></div>
                <div><Label className="text-xs text-muted-foreground">Service Type</Label><p className="font-medium">{lead.service_type}</p></div>
                <div><Label className="text-xs text-muted-foreground">Urgency</Label><p className="font-medium capitalize">{lead.urgency}</p></div>
                <div><Label className="text-xs text-muted-foreground">Contact Method</Label><p className="font-medium capitalize">{lead.preferred_contact_method}</p></div>
                <div><Label className="text-xs text-muted-foreground">Consent</Label><p className="font-medium">{lead.consent_to_contact ? "Yes" : "No"}</p></div>
              </div>

              <div className="mt-4">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="mt-1 rounded-md bg-muted p-3 text-sm">{lead.description}</p>
              </div>
            </div>

            {/* Tracking metadata */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-semibold mb-3 font-sans">Tracking Data</h2>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Source: </span>{lead.source || "—"}</div>
                <div><span className="text-muted-foreground">UTM Source: </span>{lead.utm_source || "—"}</div>
                <div><span className="text-muted-foreground">UTM Medium: </span>{lead.utm_medium || "—"}</div>
                <div><span className="text-muted-foreground">UTM Campaign: </span>{lead.utm_campaign || "—"}</div>
                <div><span className="text-muted-foreground">GCLID: </span>{lead.gclid || "—"}</div>
                <div><span className="text-muted-foreground">Landing Page: </span>{lead.landing_page || "—"}</div>
                <div><span className="text-muted-foreground">Referrer: </span>{lead.referrer || "—"}</div>
                <div><span className="text-muted-foreground">Score: </span>{lead.lead_score ?? "—"}</div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-semibold mb-3 font-sans">Notes</h2>
              {lead.notes && <p className="mb-4 whitespace-pre-wrap text-sm rounded-md bg-muted p-3">{lead.notes}</p>}
              <div className="flex gap-2">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" rows={2} className="flex-1" />
                <Button onClick={handleAddNote} disabled={!noteText.trim()}>Add</Button>
              </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-semibold mb-3 font-sans">Activity</h2>
              {events && events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex gap-3 text-sm">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="font-medium">{event.event_type}</span>
                        {event.event_detail && <span className="text-muted-foreground"> — {event.event_detail}</span>}
                        <p className="text-xs text-muted-foreground">{format(new Date(event.created_at), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-semibold mb-4 font-sans">Lead Management</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={lead.status} onValueChange={handleStatusChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Assigned Buyer</Label>
                  <Select value={lead.assigned_buyer_id || "none"} onValueChange={(v) => handleUpdate("assigned_buyer_id", v === "none" ? null : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {buyersEmpty ? (
                        <SelectItem value="__empty" disabled>No buyers configured — add one in Buyers tab</SelectItem>
                      ) : (
                        buyers?.map((b) => <SelectItem key={b.id} value={b.id}>{b.business_name}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Review Reason</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="Optional reason…"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reviewReason === (lead.review_reason || "")}
                      onClick={() => handleUpdate("review_reason", reviewReason || null)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-semibold mb-4 font-sans">Flags</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Duplicate</Label>
                  <Switch checked={lead.duplicate_flag} onCheckedChange={(v) => handleUpdate("duplicate_flag", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Spam</Label>
                  <Switch checked={lead.spam_flag} onCheckedChange={(v) => handleUpdate("spam_flag", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Test Lead</Label>
                  <Switch checked={lead.is_test} onCheckedChange={(v) => handleUpdate("is_test", v)} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 text-xs text-muted-foreground">
              <p>ID: {lead.id}</p>
              <p>Created: {format(new Date(lead.created_at), "PPpp")}</p>
              <p>Updated: {format(new Date(lead.updated_at), "PPpp")}</p>
              <p>Vertical: {lead.vertical}</p>
            </div>
          </div>
        </div>

        {/* Destructive status confirmation dialog */}
        <AlertDialog open={!!pendingStatus} onOpenChange={(open) => { if (!open) setPendingStatus(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change status to "{pendingStatus}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This is a destructive status change. Are you sure you want to mark this lead as <strong>{pendingStatus}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (pendingStatus) { handleUpdate("status", pendingStatus); setPendingStatus(null); } }}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </>
  );
}
