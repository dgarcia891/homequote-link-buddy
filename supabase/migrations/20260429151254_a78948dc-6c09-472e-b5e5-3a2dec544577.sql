-- Enable query-level performance statistics for future diagnostics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Future-proof scheduled/published blog lookups
CREATE INDEX IF NOT EXISTS posts_status_published_at_idx
ON public.posts (status, published_at DESC)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS posts_status_scheduled_at_idx
ON public.posts (status, scheduled_at)
WHERE status = 'scheduled';

-- Future-proof lead dashboard/filter lookups and homeowner linking
CREATE INDEX IF NOT EXISTS leads_status_created_idx
ON public.leads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_email_normalized_idx
ON public.leads (email_normalized);

-- Admin-only database diagnostics for visibility into load and growth
CREATE OR REPLACE FUNCTION public.admin_database_diagnostics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_active_queries jsonb;
  v_table_sizes jsonb;
  v_job_stats jsonb;
  v_top_queries jsonb;
  v_pgss_enabled boolean;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_agg(row_to_json(q)) INTO v_active_queries
  FROM (
    SELECT
      pid,
      application_name,
      state,
      wait_event_type,
      wait_event,
      EXTRACT(EPOCH FROM (now() - query_start))::integer AS duration_seconds,
      left(query, 240) AS query
    FROM pg_stat_activity
    WHERE state <> 'idle'
    ORDER BY query_start NULLS LAST
    LIMIT 20
  ) q;

  SELECT jsonb_agg(row_to_json(t)) INTO v_table_sizes
  FROM (
    SELECT
      schemaname,
      relname,
      n_live_tup::bigint AS live_rows,
      n_dead_tup::bigint AS dead_rows,
      pg_total_relation_size((quote_ident(schemaname) || '.' || quote_ident(relname))::regclass)::bigint AS total_bytes,
      pg_size_pretty(pg_total_relation_size((quote_ident(schemaname) || '.' || quote_ident(relname))::regclass)) AS total_size
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size((quote_ident(schemaname) || '.' || quote_ident(relname))::regclass) DESC
    LIMIT 12
  ) t;

  SELECT jsonb_agg(row_to_json(j)) INTO v_job_stats
  FROM (
    SELECT
      j.jobname,
      j.schedule,
      j.active,
      max(d.start_time) AS last_run_at,
      count(d.*) FILTER (WHERE d.start_time > now() - interval '24 hours')::integer AS runs_last_24h,
      count(d.*) FILTER (WHERE d.start_time > now() - interval '24 hours' AND d.status <> 'succeeded')::integer AS failures_last_24h
    FROM cron.job j
    LEFT JOIN cron.job_run_details d ON d.jobid = j.jobid
    GROUP BY j.jobname, j.schedule, j.active
    ORDER BY j.jobname
  ) j;

  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) INTO v_pgss_enabled;

  IF v_pgss_enabled THEN
    SELECT jsonb_agg(row_to_json(s)) INTO v_top_queries
    FROM (
      SELECT
        calls::bigint AS calls,
        round(total_exec_time::numeric, 2) AS total_ms,
        round(mean_exec_time::numeric, 2) AS mean_ms,
        left(query, 240) AS query
      FROM public.pg_stat_statements
      ORDER BY total_exec_time DESC
      LIMIT 10
    ) s;
  ELSE
    v_top_queries := '[]'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'captured_at', now(),
    'pg_stat_statements_enabled', v_pgss_enabled,
    'active_queries', COALESCE(v_active_queries, '[]'::jsonb),
    'table_sizes', COALESCE(v_table_sizes, '[]'::jsonb),
    'job_stats', COALESCE(v_job_stats, '[]'::jsonb),
    'top_queries', COALESCE(v_top_queries, '[]'::jsonb)
  );
END;
$$;

-- Controlled internal log cleanup. This intentionally avoids application/customer data.
CREATE OR REPLACE FUNCTION public.admin_prune_internal_job_logs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron, net
AS $$
DECLARE
  v_cron_deleted integer := 0;
  v_net_deleted integer := 0;
  v_app_deleted integer := 0;
BEGIN
  DELETE FROM cron.job_run_details
  WHERE start_time < now() - interval '7 days';
  GET DIAGNOSTICS v_cron_deleted = ROW_COUNT;

  DELETE FROM net._http_response
  WHERE created < now() - interval '1 day';
  GET DIAGNOSTICS v_net_deleted = ROW_COUNT;

  DELETE FROM public.job_run_logs
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_app_deleted = ROW_COUNT;

  INSERT INTO public.job_run_logs (job_name, status, attempts, duration_ms, error_message, metadata)
  VALUES (
    'prune-internal-job-logs-daily',
    'success',
    1,
    NULL,
    NULL,
    jsonb_build_object(
      'cron_job_run_details_deleted', v_cron_deleted,
      'net_http_response_deleted', v_net_deleted,
      'job_run_logs_deleted', v_app_deleted
    )
  );

  RETURN jsonb_build_object(
    'cron_job_run_details_deleted', v_cron_deleted,
    'net_http_response_deleted', v_net_deleted,
    'job_run_logs_deleted', v_app_deleted
  );
END;
$$;

-- Include the maintenance job in the admin cron controls
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
    v_anon := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImNqZGhiaXVoenJwcnVxYmJubnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTYwNzgsImV4cCI6MjA4Nzg3MjA3OH0.6vSZz2RJ1Ow4N-FsEvpkKtkgmcIo-zlwM1nlTXw2310';
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
    v_anon := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImNqZGhiaXVoenJwcnVxYmJubnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTYwNzgsImV4cCI6MjA4Nzg3MjA3OH0.6vSZz2RJ1Ow4N-FsEvpkKtkgmcIo-zlwM1nlTXw2310';
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