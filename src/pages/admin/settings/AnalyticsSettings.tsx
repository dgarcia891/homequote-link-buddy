import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EyeClosed } from "lucide-react";
import { getVisitorId } from "@/services/analyticsService";

export function AnalyticsSettings() {
  const [excludeFromAnalytics, setExcludeFromAnalytics] = useState(false);
  const [savingExclusion, setSavingExclusion] = useState(false);

  useEffect(() => {
    setExcludeFromAnalytics(localStorage.getItem("hql_ignore_tracking") === "true");
  }, []);

  async function handleExclusionToggle(enabled: boolean) {
    setSavingExclusion(true);
    try {
      const visitorId = getVisitorId();
      
      if (enabled) {
        localStorage.setItem("hql_ignore_tracking", "true");
      } else {
        localStorage.removeItem("hql_ignore_tracking");
      }
      setExcludeFromAnalytics(enabled);
      
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
          { setting_key: "excluded_visitors", setting_value: excludedList },
          { onConflict: "setting_key" }
        );

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
    } catch (err) {
      const error = err as Error;
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  return (
    <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6 space-y-5">
      <h2 className="font-semibold font-sans flex items-center gap-2">
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
  );
}
