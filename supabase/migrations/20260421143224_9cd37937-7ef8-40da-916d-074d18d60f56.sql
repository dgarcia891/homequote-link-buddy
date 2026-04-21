
CREATE TABLE IF NOT EXISTS public.job_run_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('success','failure','partial')),
  attempts integer NOT NULL DEFAULT 1,
  duration_ms integer,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_run_logs_created_at_idx
  ON public.job_run_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS job_run_logs_job_name_created_at_idx
  ON public.job_run_logs (job_name, created_at DESC);

ALTER TABLE public.job_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read job run logs"
  ON public.job_run_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Service role bypasses RLS, so no INSERT policy needed for the edge functions.
-- Block any direct client inserts/updates/deletes by omission.

CREATE OR REPLACE FUNCTION public.admin_recent_job_runs(p_limit integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  job_name text,
  status text,
  attempts integer,
  duration_ms integer,
  error_message text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT l.id, l.job_name, l.status, l.attempts, l.duration_ms,
         l.error_message, l.metadata, l.created_at
  FROM public.job_run_logs l
  ORDER BY l.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 200));
END;
$$;
