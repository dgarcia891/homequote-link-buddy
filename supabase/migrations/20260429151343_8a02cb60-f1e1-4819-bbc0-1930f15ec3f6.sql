-- Correct and harden admin cron toggle helper
CREATE OR REPLACE FUNCTION public.admin_toggle_cron_job(p_jobname text, p_enable boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron, net
AS $$
DECLARE
  v_url text;
  v_anon text;
  v_schedule text;
  v_command text;
  v_existing bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF NOT p_enable THEN
    SELECT jobid INTO v_existing FROM cron.job WHERE jobname = p_jobname;
    IF v_existing IS NOT NULL THEN
      PERFORM cron.unschedule(p_jobname);
    END IF;
    RETURN jsonb_build_object('jobname', p_jobname, 'active', false);
  END IF;

  IF p_jobname = 'publish-scheduled-posts' THEN
    v_schedule := '*/15 * * * *';
    v_url := 'https://cjdhbiuhzrpruqbbnnqz.supabase.co/functions/v1/publish-scheduled';
    v_anon := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZGhiaXVoenJwcnVxYmJubnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTYwNzgsImV4cCI6MjA4Nzg3MjA3OH0.6vSZz2RJ1Ow4N-FsEvpkKtkgmcIo-zlwM1nlTXw2310';
    v_command := format(
      $cmd$ SELECT net.http_post(
        url := %L,
        headers := %L::jsonb,
        body := %L::jsonb
      ) AS request_id; $cmd$,
      v_url,
      json_build_object('Content-Type','application/json','Authorization','Bearer '||v_anon)::text,
      '{}'::text
    );
  ELSIF p_jobname = 'send-nurture-emails-hourly' THEN
    v_schedule := '0 * * * *';
    v_url := 'https://cjdhbiuhzrpruqbbnnqz.supabase.co/functions/v1/send-nurture-emails';
    v_anon := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZGhiaXVoenJwcnVxYmJubnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTYwNzgsImV4cCI6MjA4Nzg3MjA3OH0.6vSZz2RJ1Ow4N-FsEvpkKtkgmcIo-zlwM1nlTXw2310';
    v_command := format(
      $cmd$ SELECT net.http_post(
        url := %L,
        headers := %L::jsonb,
        body := %L::jsonb
      ) AS request_id; $cmd$,
      v_url,
      json_build_object('Content-Type','application/json','Authorization','Bearer '||v_anon)::text,
      '{}'::text
    );
  ELSIF p_jobname = 'prune-internal-job-logs-daily' THEN
    v_schedule := '17 3 * * *';
    v_command := 'SELECT public.admin_prune_internal_job_logs();';
  ELSE
    RAISE EXCEPTION 'Unknown job: %', p_jobname;
  END IF;

  SELECT jobid INTO v_existing FROM cron.job WHERE jobname = p_jobname;
  IF v_existing IS NOT NULL THEN
    PERFORM cron.unschedule(p_jobname);
  END IF;

  PERFORM cron.schedule(p_jobname, v_schedule, v_command);

  RETURN jsonb_build_object('jobname', p_jobname, 'active', true, 'schedule', v_schedule);
END;
$$;

-- Limit direct API execution of newly-added security definer helpers
REVOKE ALL ON FUNCTION public.admin_database_diagnostics() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_prune_internal_job_logs() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_toggle_cron_job(text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_cron_jobs() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_recent_job_runs(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_database_diagnostics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_cron_job(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_cron_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_recent_job_runs(integer) TO authenticated;