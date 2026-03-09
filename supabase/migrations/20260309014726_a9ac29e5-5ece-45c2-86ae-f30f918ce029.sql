-- Add extra visitor metadata columns to analytics_events
ALTER TABLE public.analytics_events
  ADD COLUMN language text,
  ADD COLUMN timezone text,
  ADD COLUMN page_title text,
  ADD COLUMN page_url text,
  ADD COLUMN connection_type text,
  ADD COLUMN is_touch_device boolean;