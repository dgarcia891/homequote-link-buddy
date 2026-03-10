CREATE OR REPLACE FUNCTION public.purge_analytics_by_ip_or_visitor(
  p_ip text DEFAULT NULL,
  p_visitor_id text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.analytics_events
    WHERE 
      (p_ip IS NOT NULL AND ip_address = p_ip)
      OR (p_visitor_id IS NOT NULL AND visitor_id = p_visitor_id)
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;