
CREATE TABLE public.spam_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- 'blocked_email', 'blocked_phone', 'rate_limited'
  email text,
  phone text,
  ip_address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.spam_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read spam events"
  ON public.spam_events
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Service role can insert spam events"
  ON public.spam_events
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_spam_events_created_at ON public.spam_events (created_at DESC);
CREATE INDEX idx_spam_events_event_type ON public.spam_events (event_type);
