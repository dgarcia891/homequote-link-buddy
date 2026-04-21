import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Clock } from "lucide-react";

type CronJob = {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  command: string;
};

// Jobs the admin is allowed to manage from the UI
const MANAGED_JOBS: { name: string; label: string; description: string; schedule: string }[] = [
  {
    name: "publish-scheduled-posts",
    label: "Publish scheduled blog posts",
    description: "Checks for scheduled posts and publishes any that are due.",
    schedule: "Every 15 minutes",
  },
  {
    name: "send-nurture-emails-hourly",
    label: "Send nurture emails",
    description: "Sends follow-up emails to leads in the nurture pipeline.",
    schedule: "Hourly",
  },
];

export function BackgroundJobsSettings() {
  const qc = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-cron-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_cron_jobs");
      if (error) throw error;
      return (data ?? []) as CronJob[];
    },
    staleTime: 30_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ jobname, enable }: { jobname: string; enable: boolean }) => {
      const { data, error } = await supabase.rpc("admin_toggle_cron_job", {
        p_jobname: jobname,
        p_enable: enable,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-cron-jobs"] });
      toast({
        title: vars.enable ? "Job enabled" : "Job disabled",
        description: `${vars.jobname} is now ${vars.enable ? "running on schedule" : "stopped"}.`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6 space-y-5">
      <div>
        <h2 className="font-semibold font-sans flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Background Jobs
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Turn scheduled background tasks on or off. Disabling a job stops it entirely until you turn it back on.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {MANAGED_JOBS.map((meta) => {
            const job = jobs?.find((j) => j.jobname === meta.name);
            const isOn = !!job?.active;
            const isPending =
              toggleMutation.isPending && toggleMutation.variables?.jobname === meta.name;

            return (
              <div
                key={meta.name}
                className="flex items-start justify-between gap-4 rounded-md border bg-background p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="font-medium">{meta.label}</Label>
                    {isOn ? (
                      <Badge variant="default" className="text-xs">On</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Off</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{meta.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Schedule:</span> {meta.schedule}
                    {job?.schedule && <span className="ml-1 opacity-60">({job.schedule})</span>}
                  </p>
                </div>
                <Switch
                  checked={isOn}
                  disabled={isPending}
                  onCheckedChange={(enable) =>
                    toggleMutation.mutate({ jobname: meta.name, enable })
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
