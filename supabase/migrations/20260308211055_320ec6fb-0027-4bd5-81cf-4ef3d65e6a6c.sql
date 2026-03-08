
-- Lead nurture emails table
CREATE TABLE public.lead_nurture_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_nurture_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage nurture emails"
  ON public.lead_nurture_emails FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Lead feedback table
CREATE TABLE public.lead_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  hired_plumber boolean,
  rating integer,
  review_text text,
  token text NOT NULL UNIQUE,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feedback"
  ON public.lead_feedback FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
