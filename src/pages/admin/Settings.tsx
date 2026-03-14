import { useState, useEffect, useRef } from "react";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Eye, EyeOff, Save, SendHorizonal, ChevronDown, ChevronUp, CheckCircle2, XCircle, Mail, KeyRound, EyeClosed, Trash2, Monitor } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getVisitorId } from "@/services/analyticsService";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_EMAIL_TEMPLATES, MOCK_TEMPLATE_DATA } from "@/lib/emailTemplates";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SmtpConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  adminNotificationEmail: string;
  enabled: boolean;
}

interface LogEntry {
  timestamp: string;
  status: "success" | "error";
  message: string;
}

const DEFAULT_CONFIG: SmtpConfig = {
  smtpHost: "",
  smtpPort: 587,
  smtpUsername: "",
  smtpPassword: "",
  fromEmail: "",
  fromName: "HomeQuoteLink",
  adminNotificationEmail: "",
  enabled: true,
};

const TIMEOUT_MS = 15_000;

export default function SettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SmtpConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Template state
  const [templates, setTemplates] = useState<Record<string, { subject: string; body: string }>>(DEFAULT_EMAIL_TEMPLATES);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>("new_lead");
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [testingTemplate, setTestingTemplate] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsOpen, setLogsOpen] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [excludeFromAnalytics, setExcludeFromAnalytics] = useState(false);
  const [savingExclusion, setSavingExclusion] = useState(false);
  const [purging, setPurging] = useState(false);
  const [excludePreviewViews, setExcludePreviewViews] = useState(false);
  const [savingPreviewExclusion, setSavingPreviewExclusion] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleChangeEmail() {
    if (!newEmail.trim()) return;
    setChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast({ title: "Confirmation email sent", description: "Check your new inbox to confirm the change." });
      setNewEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChangingEmail(false);
    }
  }

  function addLog(status: "success" | "error", message: string) {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), status, message },
    ]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  useEffect(() => {
    // Load localStorage exclusion flag
    setExcludeFromAnalytics(localStorage.getItem("hql_ignore_tracking") === "true");
    
    async function load() {
      const [smtpResult, previewResult, templateResult] = await Promise.all([
        supabase
          .from("admin_settings")
          .select("setting_value")
          .eq("setting_key", "smtp_config")
          .maybeSingle(),
        supabase
          .from("admin_settings")
          .select("setting_value")
          .eq("setting_key", "exclude_preview_views")
          .maybeSingle(),
        supabase
          .from("admin_settings")
          .select("setting_value")
          .eq("setting_key", "email_templates")
          .maybeSingle(),
      ]);
      if (!smtpResult.error && smtpResult.data?.setting_value) {
        setConfig({ ...DEFAULT_CONFIG, ...(smtpResult.data.setting_value as unknown as SmtpConfig) });
      }
      if (!previewResult.error && previewResult.data?.setting_value) {
        setExcludePreviewViews(previewResult.data.setting_value === true);
      }
      if (!templateResult.error && templateResult.data?.setting_value) {
        setTemplates({ ...DEFAULT_EMAIL_TEMPLATES, ...(templateResult.data.setting_value as unknown as Record<string, { subject: string; body: string }>) });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleExclusionToggle(enabled: boolean) {
    setSavingExclusion(true);
    try {
      const visitorId = getVisitorId();
      
      // Update localStorage
      if (enabled) {
        localStorage.setItem("hql_ignore_tracking", "true");
      } else {
        localStorage.removeItem("hql_ignore_tracking");
      }
      setExcludeFromAnalytics(enabled);
      
      // Update excluded_visitors list in admin_settings
      const { data: existing } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "excluded_visitors")
        .maybeSingle();
      
      let excludedList: string[] = (existing?.setting_value as string[]) || [];
      
      if (enabled && !excludedList.includes(visitorId)) {
        excludedList.push(visitorId);
      } else if (!enabled) {
        excludedList = excludedList.filter((id) => id !== visitorId);
      }
      
      await supabase
        .from("admin_settings")
        .upsert(
          { setting_key: "excluded_visitors", setting_value: excludedList as any },
          { onConflict: "setting_key" }
        );

      // Register/unregister IP server-side for robust exclusion
      const { data: session } = await supabase.auth.getSession();
      await supabase.functions.invoke("purge-analytics", {
        body: enabled ? { register_ip: true } : { unregister_ip: true },
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
      });
      
      toast({
        title: enabled ? "Tracking disabled" : "Tracking enabled",
        description: enabled
          ? "Your IP and browser are now excluded from analytics (server-side)."
          : "Your IP and browser will now be tracked in analytics.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      // Revert state on error
      setExcludeFromAnalytics(!enabled);
      if (!enabled) {
        localStorage.setItem("hql_ignore_tracking", "true");
      } else {
        localStorage.removeItem("hql_ignore_tracking");
      }
    } finally {
      setSavingExclusion(false);
    }
  }

  function updateField<K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert(
          { setting_key: "smtp_config", setting_value: config as any },
          { onConflict: "setting_key" }
        );
      if (error) throw error;
      toast({ title: "Settings saved" });
      addLog("success", "Settings saved successfully.");
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
      addLog("error", `Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    addLog("success", "Initiating test email…");
    try {
      // Save first so the edge function reads latest config
      const { error: saveErr } = await supabase
        .from("admin_settings")
        .upsert(
          { setting_key: "smtp_config", setting_value: config as any },
          { onConflict: "setting_key" }
        );
      if (saveErr) {
        addLog("error", `Failed to save config before test: ${saveErr.message}`);
        return;
      }

      // Invoke with timeout
      const invokePromise = supabase.functions.invoke("notify-admin-email", {
        body: { notificationType: "test" },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)
      );

      const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

      if (error) {
        // Try to extract detailed error from response context
        let detailedMessage = error.message || "Unknown error";
        try {
          if ("context" in error && (error as any).context instanceof Response) {
            const body = await (error as any).context.json();
            if (body?.error) detailedMessage = body.error;
          }
        } catch {}
        addLog("error", `Test failed: ${detailedMessage}`);
        toast({ title: "Test failed", description: detailedMessage, variant: "destructive" });
        return;
      }

      // Check response body for success/error
      if (data && typeof data === "object" && "error" in data && data.error) {
        addLog("error", `Test failed: ${data.error}`);
        toast({ title: "Test failed", description: String(data.error), variant: "destructive" });
        return;
      }

      addLog("success", `Test email dispatched to ${config.adminNotificationEmail}. Check inbox to confirm delivery.`);
      toast({ title: "Test email dispatched", description: `Check ${config.adminNotificationEmail} to confirm it arrived.` });
    } catch (err: any) {
      addLog("error", `Test failed: ${err.message}`);
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  }

  async function handleSaveTemplates() {
    setSavingTemplates(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert(
          { setting_key: "email_templates", setting_value: templates as any },
          { onConflict: "setting_key" }
        );
      if (error) throw error;
      toast({ title: "Templates saved" });
      addLog("success", "Email templates saved successfully.");
    } catch (err: any) {
      toast({ title: "Error saving templates", description: err.message, variant: "destructive" });
      addLog("error", `Save templates failed: ${err.message}`);
    } finally {
      setSavingTemplates(false);
    }
  }

  async function handleTestTemplate() {
    setTestingTemplate(true);
    addLog("success", `Initiating preview for ${selectedTemplateType}…`);
    try {
      const invokePromise = supabase.functions.invoke("notify-admin-email", {
        body: { 
          notificationType: "test",
          testData: {
            useCustomTemplate: true,
            templateType: selectedTemplateType,
            subject: templates[selectedTemplateType].subject,
            body: templates[selectedTemplateType].body,
            mockData: MOCK_TEMPLATE_DATA[selectedTemplateType]
          }
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)
      );

      const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

      if (error) {
        let detailedMessage = error.message || "Unknown error";
        try {
          if ("context" in error && (error as any).context instanceof Response) {
            const body = await (error as any).context.json();
            if (body?.error) detailedMessage = body.error;
          }
        } catch {}
        addLog("error", `Template test failed: ${detailedMessage}`);
        toast({ title: "Test failed", description: detailedMessage, variant: "destructive" });
        return;
      }

      if (data && typeof data === "object" && "error" in data && data.error) {
        addLog("error", `Template test failed: ${data.error}`);
        toast({ title: "Test failed", description: String(data.error), variant: "destructive" });
        return;
      }

      addLog("success", `Preview email dispatched to ${config.adminNotificationEmail}. Check inbox to view it.`);
      toast({ title: "Preview email dispatched", description: `Check ${config.adminNotificationEmail} to confirm it arrived.` });
    } catch (err: any) {
      addLog("error", `Template test failed: ${err.message}`);
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    } finally {
      setTestingTemplate(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <PageMeta title="Settings | HomeQuoteLink Admin" description="Admin settings." />
      <AdminLayout>
        <h1 className="text-2xl font-bold mb-6 font-sans">Settings</h1>

        {/* Account Section */}
        <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4 font-sans">Account</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Current Email</Label>
              <p className="text-sm font-medium mt-1">{user?.email ?? "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">New Email Address</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newemail@example.com"
                  className="flex-1"
                />
                <Button onClick={handleChangeEmail} disabled={changingEmail || !newEmail.trim()} className="gap-2">
                  {changingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Change Email
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">A confirmation link will be sent to the new address.</p>
            </div>
            <div className="border-t pt-4">
              <Label className="text-xs text-muted-foreground">Change Password</Label>
              <div className="grid gap-2 mt-1 sm:grid-cols-2">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword.trim()} className="gap-2 mt-2">
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Update Password
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Exclusion Section */}
        <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6 space-y-5">
          <h2 className="font-semibold font-sans flex items-center gap-2">
            <EyeClosed className="h-4 w-4" />
            Analytics Exclusions
          </h2>

          {/* Exclude this browser */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Exclude this browser from analytics</Label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, your page views and interactions won't be recorded. Excluded visitor IDs are also filtered from analytics dashboards.
              </p>
            </div>
            <Switch
              checked={excludeFromAnalytics}
              onCheckedChange={handleExclusionToggle}
              disabled={savingExclusion}
            />
          </div>

          {/* Purge my records */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label>Purge my analytics records</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete all analytics events matching your IP address and visitor ID.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2" disabled={purging}>
                  {purging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Purge
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Purge analytics records?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all analytics events matching your current IP address and browser visitor ID. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setPurging(true);
                      try {
                        const visitorId = getVisitorId();
                        const { data: session } = await supabase.auth.getSession();
                        const { data, error } = await supabase.functions.invoke("purge-analytics", {
                          body: { visitor_id: visitorId, purge: true },
                          headers: {
                            Authorization: `Bearer ${session?.session?.access_token}`,
                          },
                        });
                        if (error) throw error;
                        if (data?.error) {
                          toast({ title: "Purge failed", description: data.error, variant: "destructive" });
                          return;
                        }
                        const count = data?.count ?? 0;
                        if (count === 0) {
                          toast({
                            title: "No records found",
                            description: `No analytics events matched your IP (${data?.ip || "unknown"}) or visitor ID.`,
                          });
                        } else {
                          toast({
                            title: `Deleted ${count} analytics event${count === 1 ? "" : "s"}`,
                            description: `Purged by IP (${data?.ip || "unknown"}) and visitor ID.`,
                          });
                        }
                      } catch (err: any) {
                        toast({ title: "Purge failed", description: err.message, variant: "destructive" });
                      } finally {
                        setPurging(false);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, purge all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Exclude Lovable preview views */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Exclude Lovable preview views
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, page views from Lovable preview and published app domains won't be recorded in analytics.
              </p>
            </div>
            <Switch
              checked={excludePreviewViews}
              onCheckedChange={async (enabled) => {
                setSavingPreviewExclusion(true);
                try {
                  await supabase
                    .from("admin_settings")
                    .upsert(
                      { setting_key: "exclude_preview_views", setting_value: enabled as any },
                      { onConflict: "setting_key" }
                    );
                  setExcludePreviewViews(enabled);
                  toast({
                    title: enabled ? "Preview views excluded" : "Preview views included",
                    description: enabled
                      ? "Lovable preview/app domain traffic will no longer be tracked."
                      : "Lovable preview/app domain traffic will now be tracked.",
                  });
                } catch (err: any) {
                  toast({ title: "Error", description: err.message, variant: "destructive" });
                } finally {
                  setSavingPreviewExclusion(false);
                }
              }}
              disabled={savingPreviewExclusion}
            />
          </div>
        </div>

        <div className="max-w-2xl rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Email Notifications (SMTP)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure your SMTP server to enable outbound email notifications. The system sends the following email types:
          </p>

          <div className="rounded-md border bg-muted/30 p-4 mb-6 text-sm space-y-3">
            <div>
              <span className="font-semibold text-foreground">1. New Lead Alert</span>
              <span className="text-muted-foreground"> — Sent to the Admin Notification Email immediately when a homeowner submits a lead form. Includes full lead details, urgency badge, and a CRM link.</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">2. Buyer / Provider Notification</span>
              <span className="text-muted-foreground"> — Sent to the assigned buyer's email when a lead is routed to them. Contains customer name, phone, service type, and description (no internal IDs or CRM links).</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">3. Provider Application Alert</span>
              <span className="text-muted-foreground"> — Sent to the Admin Notification Email when a new provider submits an application to join the network. Includes business info, service areas, and their message.</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">4. Lead Nurture Emails</span>
              <span className="text-muted-foreground"> — Automated follow-up emails sent to homeowners. A follow-up is scheduled 48 hours after submission, and a feedback request at 120 hours (5 days). Processed in batches by a scheduled function.</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">5. Homeowner Lead Confirmation</span>
              <span className="text-muted-foreground"> — Sent to the homeowner's email after they submit a lead, confirming receipt and outlining next steps. Triggered manually from the admin CRM.</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">6. Test Email</span>
              <span className="text-muted-foreground"> — Sent to the Admin Notification Email via the "Send Test Email" button below to verify SMTP configuration is working.</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">SMTP Host</Label>
                <Input value={config.smtpHost} onChange={(e) => updateField("smtpHost", e.target.value)} placeholder="smtp.example.com" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">SMTP Port</Label>
                <Input type="number" value={config.smtpPort} onChange={(e) => updateField("smtpPort", parseInt(e.target.value) || 587)} />
                {[993, 995].includes(config.smtpPort) && (
                  <p className="text-xs text-destructive mt-1">
                    Port {config.smtpPort} is for receiving email (IMAP/POP3). Use 465 (SSL) or 587 (STARTTLS) for sending.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">SMTP Username</Label>
                <Input value={config.smtpUsername} onChange={(e) => updateField("smtpUsername", e.target.value)} placeholder="user@example.com" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">SMTP Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={config.smtpPassword}
                    onChange={(e) => updateField("smtpPassword", e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">From Email</Label>
                <Input value={config.fromEmail} onChange={(e) => updateField("fromEmail", e.target.value)} placeholder="notifications@homequotelink.com" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">From Name</Label>
                <Input value={config.fromName} onChange={(e) => updateField("fromName", e.target.value)} placeholder="HomeQuoteLink" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Admin Notification Email</Label>
              <Input value={config.adminNotificationEmail} onChange={(e) => updateField("adminNotificationEmail", e.target.value)} placeholder="admin@homequotelink.com" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label>Enabled</Label>
              <Switch checked={config.enabled} onCheckedChange={(v) => updateField("enabled", v)} />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </Button>
              <Button variant="outline" onClick={handleTest} disabled={testing} className="gap-2">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                Send Test Email
              </Button>
            </div>
          </div>
        </div>

        {/* Email Templates Section */}
        <div className="max-w-2xl mt-6 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Email Templates</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Customize the automated emails sent by the system.
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Select Template</Label>
              <Select value={selectedTemplateType} onValueChange={setSelectedTemplateType}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New Lead Alert</SelectItem>
                  <SelectItem value="buyer_notification">Buyer / Provider Notification</SelectItem>
                  <SelectItem value="buyer_inquiry">Provider Application Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {templates && templates[selectedTemplateType] && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Subject Line</Label>
                  <Input 
                    value={templates[selectedTemplateType].subject} 
                    onChange={(e) => setTemplates({
                      ...templates,
                      [selectedTemplateType]: { ...templates[selectedTemplateType], subject: e.target.value }
                    })} 
                    className="font-mono text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">HTML Body</Label>
                  <Textarea 
                    value={templates[selectedTemplateType].body} 
                    onChange={(e) => setTemplates({
                      ...templates,
                      [selectedTemplateType]: { ...templates[selectedTemplateType], body: e.target.value }
                    })} 
                    className="font-mono text-xs min-h-[300px]"
                  />
                </div>
                <div className="rounded-md border bg-muted/30 p-4 text-xs space-y-2">
                  <span className="font-semibold text-foreground">Available Variables: </span>
                  <span className="text-muted-foreground font-mono">
                    {Object.keys(MOCK_TEMPLATE_DATA[selectedTemplateType] || {}).map(k => `{{${k}}}`).join(", ")}
                  </span>
                  <p className="text-muted-foreground mt-2">
                    Variables are replaced with real data before sending. Safe HTML tags like &lt;b&gt;, &lt;a&gt;, and &lt;br&gt; are supported.
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSaveTemplates} disabled={savingTemplates} className="gap-2">
                {savingTemplates ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Templates
              </Button>
              <Button variant="outline" onClick={handleTestTemplate} disabled={testingTemplate || !config.enabled} className="gap-2">
                {testingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Send Test Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Response Log Panel */}
        <div className="max-w-2xl mt-6 rounded-lg border bg-card">
          <button
            onClick={() => setLogsOpen(!logsOpen)}
            className="flex w-full items-center justify-between p-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Response Log ({logs.length})</span>
            {logsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {logsOpen && (
            <div className="border-t">
              {logs.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No logs yet. Save or send a test email to see results here.</p>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="p-3 space-y-2">
                    {logs.map((entry, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 rounded-md p-2 text-xs font-mono ${
                          entry.status === "error"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/5 text-foreground"
                        }`}
                      >
                        {entry.status === "error" ? (
                          <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                        )}
                        <span className="text-muted-foreground shrink-0">{entry.timestamp}</span>
                        <span className="break-all">{entry.message}</span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
