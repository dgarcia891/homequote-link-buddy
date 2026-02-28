
-- 1. Create admin_users table
CREATE TABLE public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_users
CREATE POLICY "Admins can select admin_users"
  ON public.admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 2. Create a helper function to check admin membership
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- 3. Drop old permissive RLS policies and replace with admin-only

-- leads: keep public insert, restrict select/update to admins
DROP POLICY IF EXISTS "Authenticated users can select leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

CREATE POLICY "Admins can select leads"
  ON public.leads FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  USING (public.is_admin());

-- buyers: restrict all to admins
DROP POLICY IF EXISTS "Authenticated users can select buyers" ON public.buyers;
DROP POLICY IF EXISTS "Authenticated users can insert buyers" ON public.buyers;
DROP POLICY IF EXISTS "Authenticated users can update buyers" ON public.buyers;
DROP POLICY IF EXISTS "Authenticated users can delete buyers" ON public.buyers;

CREATE POLICY "Admins can select buyers"
  ON public.buyers FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert buyers"
  ON public.buyers FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update buyers"
  ON public.buyers FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete buyers"
  ON public.buyers FOR DELETE
  USING (public.is_admin());

-- lead_events: restrict to admins
DROP POLICY IF EXISTS "Authenticated users can select lead_events" ON public.lead_events;
DROP POLICY IF EXISTS "Authenticated users can insert lead_events" ON public.lead_events;

CREATE POLICY "Admins can select lead_events"
  ON public.lead_events FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert lead_events"
  ON public.lead_events FOR INSERT
  WITH CHECK (public.is_admin());

-- routing_settings: restrict to admins
DROP POLICY IF EXISTS "Authenticated users can select routing_settings" ON public.routing_settings;
DROP POLICY IF EXISTS "Authenticated users can insert routing_settings" ON public.routing_settings;
DROP POLICY IF EXISTS "Authenticated users can update routing_settings" ON public.routing_settings;
DROP POLICY IF EXISTS "Authenticated users can delete routing_settings" ON public.routing_settings;

CREATE POLICY "Admins can select routing_settings"
  ON public.routing_settings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert routing_settings"
  ON public.routing_settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update routing_settings"
  ON public.routing_settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete routing_settings"
  ON public.routing_settings FOR DELETE
  USING (public.is_admin());
