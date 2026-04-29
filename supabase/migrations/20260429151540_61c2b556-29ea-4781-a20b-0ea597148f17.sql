CREATE OR REPLACE FUNCTION public.admin_database_diagnostics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog, extensions
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
      FROM extensions.pg_stat_statements
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

REVOKE ALL ON FUNCTION public.admin_database_diagnostics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_database_diagnostics() TO authenticated;