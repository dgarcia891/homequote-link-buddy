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
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "smtp_config")
        .maybeSingle();
      if (!error && data?.setting_value) {
        setConfig({ ...DEFAULT_CONFIG, ...(data.setting_value as unknown as SmtpConfig) });
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
      
      toast({
        title: enabled ? "Tracking disabled" : "Tracking enabled",
        description: enabled
          ? "Your browser activity will no longer be recorded in analytics."
          : "Your browser activity will now be recorded in analytics.",
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
        <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4 font-sans flex items-center gap-2">
            <EyeClosed className="h-4 w-4" />
            Analytics Exclusions
          </h2>
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
        </div>

        <div className="max-w-2xl rounded-lg border bg-card p-6">

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
