import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Ban, CheckCircle, Clock, Loader2, Mail, MessageSquare, RefreshCw, Send, ShieldAlert, ShieldCheck, ShieldQuestion, Star, AlertTriangle } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/constants";

interface Lead {
  id: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  phone: string;
  email: string | null;
  city: string | null;
  zip_code: string | null;
  service_type: string | null;
  urgency: string | null;
  preferred_contact_method: string;
  consent_to_contact: boolean;
  description: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  gclid: string | null;
  landing_page: string | null;
  referrer: string | null;
  lead_score: number | null;
  notes: string | null;
  status: string;
  assigned_buyer_id: string | null;
  review_reason: string | null;
  ai_authenticity_score: number | null;
  ai_authenticity_reason: string | null;
  duplicate_flag: boolean;
  spam_flag: boolean;
  is_test: boolean;
  vertical: string;
}

interface LeadInfoCardProps {
  lead: Lead;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  return (
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
  );
}

export function TrackingDataCard({ lead }: { lead: Lead }) {
  return (
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
  );
}

interface NotesCardProps {
  lead: Lead;
  noteText: string;
  setNoteText: (val: string) => void;
  onAddNote: () => void;
}

export function NotesCard({ lead, noteText, setNoteText, onAddNote }: NotesCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="font-semibold mb-3 font-sans">Notes</h2>
      {lead.notes && <p className="mb-4 whitespace-pre-wrap text-sm rounded-md bg-muted p-3">{lead.notes}</p>}
      <div className="flex gap-2">
        <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" rows={2} className="flex-1" />
        <Button onClick={onAddNote} disabled={!noteText.trim()}>Add</Button>
      </div>
    </div>
  );
}

interface NurtureEmail {
  id: string;
  email_type: string;
  status: string;
  sent_at: string | null;
  scheduled_at: string;
}

export function NurtureEmailsCard({ nurtureEmails }: { nurtureEmails: NurtureEmail[] }) {
  if (!nurtureEmails || nurtureEmails.length === 0) return null;
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="font-semibold mb-3 font-sans flex items-center gap-2">
        <Mail className="h-4 w-4" /> Nurture Emails
      </h2>
      <div className="space-y-2">
        {nurtureEmails.map((ne: NurtureEmail) => (
          <div key={ne.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
            <div>
              <span className="font-medium capitalize">{ne.email_type.replace(/_/g, " ")}</span>
              <p className="text-xs text-muted-foreground">
                {ne.status === "sent"
                  ? `Sent ${format(new Date(ne.sent_at), "MMM d, h:mm a")}`
                  : ne.status === "cancelled"
                  ? "Cancelled"
                  : `Scheduled for ${format(new Date(ne.scheduled_at), "MMM d, h:mm a")}`}
              </p>
            </div>
            <Badge variant="secondary" className={
              ne.status === "sent" ? "bg-green-100 text-green-800" :
              ne.status === "cancelled" ? "bg-muted text-muted-foreground" :
              "bg-blue-100 text-blue-800"
            }>
              {ne.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LeadFeedback {
  submitted_at: string | null;
  hired_plumber: boolean | null;
  rating: number | null;
  review_text: string | null;
}

export function LeadFeedbackCard({ leadFeedback }: { leadFeedback: LeadFeedback }) {
  if (!leadFeedback?.submitted_at) return null;
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="font-semibold mb-3 font-sans flex items-center gap-2">
        <MessageSquare className="h-4 w-4" /> Homeowner Feedback
      </h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Hired Plumber:</Label>
          <span className="font-medium">{leadFeedback.hired_plumber === true ? "Yes" : leadFeedback.hired_plumber === false ? "No" : "—"}</span>
        </div>
        {leadFeedback.rating && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Rating:</Label>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= leadFeedback.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
              ))}
            </div>
          </div>
        )}
        {leadFeedback.review_text && (
          <div>
            <Label className="text-xs text-muted-foreground">Review:</Label>
            <p className="mt-1 text-sm rounded-md bg-muted p-3">{leadFeedback.review_text}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Submitted {format(new Date(leadFeedback.submitted_at), "MMM d, yyyy 'at' h:mm a")}</p>
      </div>
    </div>
  );
}

interface LeadEvent {
  id: string;
  event_type: string;
  event_detail: string | null;
  created_at: string;
}

export function ActivityCard({ events }: { events: LeadEvent[] }) {
  return (
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
  );
}

interface ManagementCardProps {
  lead: Lead;
  buyers: { id: string; business_name: string }[] | undefined;
  onStatusChange: (status: string) => void;
  onUpdateField: (field: string, value: string | boolean | number | null) => void;
  onSendNotification: () => void;
  sendingNotif: boolean;
  buyerNotifEvent: LeadEvent | null;
  buyerChangedSinceNotif: boolean;
  reviewReason: string;
  setReviewReason: (val: string) => void;
}

export function ManagementCard({
  lead,
  buyers,
  onStatusChange,
  onUpdateField,
  onSendNotification,
  sendingNotif,
  buyerNotifEvent,
  buyerChangedSinceNotif,
  reviewReason,
  setReviewReason
}: ManagementCardProps) {
  const buyersEmpty = !buyers || buyers.length === 0;

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="font-semibold mb-4 font-sans">Lead Management</h2>
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={lead.status} onValueChange={onStatusChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Assigned Buyer</Label>
          <Select value={lead.assigned_buyer_id || "none"} onValueChange={(v) => onUpdateField("assigned_buyer_id", v === "none" ? null : v)}>
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

        {lead.assigned_buyer_id && (
          <div className="pt-2 border-t">
            <Label className="text-xs text-muted-foreground">Buyer Notification</Label>
            {buyerNotifEvent && !buyerChangedSinceNotif ? (
              <div className="flex items-center gap-2 mt-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Sent {format(new Date((JSON.parse(buyerNotifEvent.event_detail || "{}") as { timestamp?: string }).timestamp || buyerNotifEvent.created_at), "MMM d, h:mm a")}</span>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                {buyerChangedSinceNotif && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Buyer has changed since last notification.</span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={sendingNotif}
                  onClick={onSendNotification}
                >
                  {sendingNotif ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Lead to Buyer
                </Button>
              </div>
            )}
          </div>
        )}

        <div>
          <Label className="text-xs text-muted-foreground">Review Reason</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              placeholder="Optional reason…"
              className="text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={reviewReason === (lead.review_reason || "")}
              onClick={() => onUpdateField("review_reason", reviewReason || null)}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Input } from "@/components/ui/input";

export function AIQualityCard({ lead, analyzingLead, onAnalyze }: { lead: Lead, analyzingLead: boolean, onAnalyze: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold font-sans">AI Quality Score</h2>
        <Button
          size="sm"
          variant="ghost"
          disabled={analyzingLead}
          onClick={onAnalyze}
          className="gap-1"
        >
          {analyzingLead ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {lead.ai_authenticity_score != null ? "Re-analyze" : "Analyze"}
        </Button>
      </div>
      {lead.ai_authenticity_score != null ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {lead.ai_authenticity_score >= 70 ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : lead.ai_authenticity_score >= 40 ? (
              <ShieldQuestion className="h-5 w-5 text-yellow-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-600" />
            )}
            <Badge
              variant="secondary"
              className={
                lead.ai_authenticity_score >= 70
                  ? "bg-green-100 text-green-800"
                  : lead.ai_authenticity_score >= 40
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {lead.ai_authenticity_score}/100
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{lead.ai_authenticity_reason}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not yet analyzed. Click "Analyze" to run AI evaluation.</p>
      )}
    </div>
  );
}

export function SpamControlsCard({ lead, markingSpam, onMarkSpam }: { lead: Lead, markingSpam: boolean, onMarkSpam: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-card p-6">
      <h2 className="font-semibold mb-2 font-sans text-destructive">Spam Controls</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Marking as spam will block this contact's email and phone from future submissions.
      </p>
      <Button
        variant="destructive"
        className="w-full gap-2"
        disabled={markingSpam || lead.status === "spam"}
        onClick={onMarkSpam}
      >
        {markingSpam ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
        {lead.status === "spam" ? "Already Marked as Spam" : "Mark as Spam & Block"}
      </Button>
    </div>
  );
}

export function FlagsCard({ lead, onUpdateField }: { lead: Lead, onUpdateField: (field: string, value: string | boolean | null) => void }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="font-semibold mb-4 font-sans">Flags</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Duplicate</Label>
          <Switch checked={lead.duplicate_flag} onCheckedChange={(v) => onUpdateField("duplicate_flag", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Spam</Label>
          <Switch checked={lead.spam_flag} onCheckedChange={(v) => onUpdateField("spam_flag", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Test Lead</Label>
          <Switch checked={lead.is_test} onCheckedChange={(v) => onUpdateField("is_test", v)} />
        </div>
      </div>
    </div>
  );
}

export function LeadMetadataCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-xs text-muted-foreground">
      <p>ID: {lead.id}</p>
      <p>Created: {format(new Date(lead.created_at), "PPpp")}</p>
      <p>Updated: {format(new Date(lead.updated_at), "PPpp")}</p>
      <p>Vertical: {lead.vertical}</p>
    </div>
  );
}
