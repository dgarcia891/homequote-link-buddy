-- Add ip_hash column to analytics_events table
ALTER TABLE public.analytics_events 
ADD COLUMN ip_hash text;