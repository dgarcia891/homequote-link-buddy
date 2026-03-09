-- Rename ip_hash to ip_address on analytics_events
ALTER TABLE public.analytics_events RENAME COLUMN ip_hash TO ip_address;