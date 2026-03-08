
-- Analytics events table for full-site tracking
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- page_view, click, form_step, conversion
  event_name text, -- specific event identifier e.g. 'cta_hero', 'form_step_2'
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  session_id text,
  visitor_id text, -- persistent anonymous ID stored in localStorage
  user_agent text,
  screen_width integer,
  screen_height integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin());

-- Create indexes for common query patterns
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_visitor ON public.analytics_events(visitor_id);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_page ON public.analytics_events(page_path);
