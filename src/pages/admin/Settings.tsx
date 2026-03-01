import { useState, useEffect } from "react";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, Save, SendHorizonal } from "lucide-react";

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

export default function SettingsPage() {
  const [config, setConfig] = useState<SmtpConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
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
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      // Save first so the edge function reads latest config
      await supabase
        .from("admin_settings")
        .upsert(
          { setting_key: "smtp_config", setting_value: config as any },
          { onConflict: "setting_key" }
        );

      const { error } = await supabase.functions.invoke("notify-admin-email", {
        body: { notificationType: "test" },
      });

      if (error) {
        let detailedMessage = error.message || "Unknown error";
        try {
          if ("context" in error && (error as any).context instanceof Response) {
            const body = await (error as any).context.json();
            if (body?.error) detailedMessage = body.error;
          }
        } catch {}
        toast({ title: "Test failed", description: detailedMessage, variant: "destructive" });
        return;
      }

      toast({ title: "Test email sent!", description: `Check ${config.adminNotificationEmail}` });
    } catch (err: any) {
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

        <div className="max-w-2xl rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4 font-sans">Email Notifications</h2>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">SMTP Host</Label>
                <Input value={config.smtpHost} onChange={(e) => updateField("smtpHost", e.target.value)} placeholder="smtp.example.com" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">SMTP Port</Label>
                <Input type="number" value={config.smtpPort} onChange={(e) => updateField("smtpPort", parseInt(e.target.value) || 587)} />
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
      </AdminLayout>
    </>
  );
}
