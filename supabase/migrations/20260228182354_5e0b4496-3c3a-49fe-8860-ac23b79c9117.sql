-- =============================================
-- HomeQuoteLink MVP — Full Schema Migration
-- =============================================

-- 1. Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Buyers table (created first since leads references it)
CREATE TABLE public.buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_areas TEXT[] DEFAULT '{}',
  supported_service_types TEXT[] DEFAULT '{}',
  vertical TEXT NOT NULL DEFAULT 'plumbing',
  is_active BOOLEAN NOT NULL DEFAULT true,
  daily_lead_cap INTEGER,
  notes TEXT
);

ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select buyers" ON public.buyers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert buyers" ON public.buyers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update buyers" ON public.buyers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete buyers" ON public.buyers FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_buyers_updated_at
  BEFORE UPDATE ON public.buyers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT,
  email TEXT,
  email_normalized TEXT,
  zip_code TEXT NOT NULL,
  city TEXT NOT NULL,
  service_type TEXT NOT NULL,
  urgency TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL DEFAULT 'call',
  consent_to_contact BOOLEAN NOT NULL DEFAULT false,
  vertical TEXT NOT NULL DEFAULT 'plumbing',
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  landing_page TEXT,
  referrer TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  lead_score INTEGER,
  duplicate_flag BOOLEAN NOT NULL DEFAULT false,
  spam_flag BOOLEAN NOT NULL DEFAULT false,
  is_test BOOLEAN NOT NULL DEFAULT false,
  review_reason TEXT,
  notes TEXT
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can select leads" ON public.leads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Lead events table
CREATE TABLE public.lead_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select lead_events" ON public.lead_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert lead_events" ON public.lead_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Routing settings table
CREATE TABLE public.routing_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  city TEXT NOT NULL,
  service_type TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  vertical TEXT NOT NULL DEFAULT 'plumbing',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_daily_leads INTEGER,
  business_hours JSONB,
  after_hours_behavior TEXT
);

ALTER TABLE public.routing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select routing_settings" ON public.routing_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert routing_settings" ON public.routing_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update routing_settings" ON public.routing_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete routing_settings" ON public.routing_settings FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_routing_settings_updated_at
  BEFORE UPDATE ON public.routing_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();