-- Blocked emails table
CREATE TABLE public.blocked_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text NOT NULL UNIQUE,
  source_lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked_emails"
  ON public.blocked_emails FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Blocked phones table
CREATE TABLE public.blocked_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_normalized text NOT NULL UNIQUE,
  source_lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked_phones"
  ON public.blocked_phones FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());