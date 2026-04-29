REVOKE EXECUTE ON FUNCTION public.admin_database_diagnostics() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_prune_internal_job_logs() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_recent_job_runs(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_database_diagnostics() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_prune_internal_job_logs() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_recent_job_runs(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_database_diagnostics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_recent_job_runs(integer) TO authenticated;