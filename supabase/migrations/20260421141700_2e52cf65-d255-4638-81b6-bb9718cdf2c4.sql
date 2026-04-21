-- Helper to list cron jobs (admin only)
CREATE OR REPLACE FUNCTION public.admin_list_cron_jobs()
RETURNS TABLE(jobid bigint, jobname text, schedule text, active boolean, command text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT j.jobid, j.jobname, j.schedule, j.active, j.command
  FROM cron.job j
  ORDER BY j.jobid;
END;
$$;

-- Helper to toggle a cron job by name (admin only)
-- Known jobs and their schedules:
--   publish-scheduled-posts: */15 * * * *  -> calls publish-scheduled edge function
--   send-nurture-emails-hourly: 0 * * * *  -> calls send-nurture-emails edge function
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
  v_body jsonb;
  v_existing bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  -- If disabling: unschedule if it exists
  IF NOT p_enable THEN
    SELECT jobid INTO v_existing FROM cron.job WHERE jobname = p_jobname;
    IF v_existing IS NOT NULL THEN
      PERFORM cron.unschedule(p_jobname);
    END IF;
    RETURN jsonb_build_object('jobname', p_jobname, 'active', false);
  END IF;

  -- If enabling: only allow known job names with a fixed schedule + body
  IF p_jobname = 'publish-scheduled-posts' THEN
    v_schedule := '*/15 * * * *';
    v_url := 'https://cjdhbiuhzrpruqbbnnqz.supabase.co/functions/v1/publish-scheduled';
  ELSIF p_jobname = 'send-nurture-emails-hourly' THEN
    v_schedule := '0 * * * *';
    v_url := 'https://cjdhbiuhzrpruqbbnnqz.supabase.co/functions/v1/send-nurture-emails';
  ELSE
    RAISE EXCEPTION 'Unknown job: %', p_jobname;
  END IF;

  v_anon := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZGhiaXVoenJwcnVxYmJubnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTYwNzgsImV4cCI6MjA4Nzg3MjA3OH0.6vSZz2RJ1Ow4N-FsEvpkKtkgmcIo-zlwM1nlTXw2310';

  -- Unschedule if exists, then re-create
  SELECT jobid INTO v_existing FROM cron.job WHERE jobname = p_jobname;
  IF v_existing IS NOT NULL THEN
    PERFORM cron.unschedule(p_jobname);
  END IF;

  PERFORM cron.schedule(
    p_jobname,
    v_schedule,
    format(
      $cmd$ SELECT net.http_post(
        url := %L,
        headers := %L::jsonb,
        body := %L::jsonb
      ) AS request_id; $cmd$,
      v_url,
      json_build_object('Content-Type','application/json','Authorization','Bearer '||v_anon)::text,
      '{}'::text
    )
  );

  RETURN jsonb_build_object('jobname', p_jobname, 'active', true, 'schedule', v_schedule);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_cron_jobs() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_toggle_cron_job(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_cron_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_cron_job(text, boolean) TO authenticated;