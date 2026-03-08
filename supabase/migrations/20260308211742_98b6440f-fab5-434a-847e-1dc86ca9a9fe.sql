
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id),
  buyer_id uuid REFERENCES public.buyers(id),
  reviewer_user_id uuid NOT NULL,
  rating integer NOT NULL,
  review_text text,
  buyer_response text,
  buyer_responded_at timestamptz,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_user_id = auth.uid());
-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Buyer profiles table
CREATE TABLE public.buyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES public.buyers(id) ON DELETE CASCADE UNIQUE,
  user_id uuid NOT NULL,
  company_description text,
  logo_url text,
  website text,
  years_in_business integer,
  license_number text,
  ai_enriched_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read buyer profiles
CREATE POLICY "Anyone can read buyer profiles" ON public.buyer_profiles FOR SELECT USING (true);
-- Owner can update their own profile
CREATE POLICY "Owner can update own profile" ON public.buyer_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
-- Owner can insert their own profile
CREATE POLICY "Owner can insert own profile" ON public.buyer_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- Admins can manage all
CREATE POLICY "Admins can manage buyer profiles" ON public.buyer_profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Homeowner profiles table
CREATE TABLE public.homeowner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  phone text,
  linked_lead_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.homeowner_profiles ENABLE ROW LEVEL SECURITY;

-- Owner can read/update their own profile
CREATE POLICY "Owner can read own homeowner profile" ON public.homeowner_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owner can update own homeowner profile" ON public.homeowner_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owner can insert own homeowner profile" ON public.homeowner_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- Admins can manage all
CREATE POLICY "Admins can manage homeowner profiles" ON public.homeowner_profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Validation trigger for reviews rating
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_rating_trigger
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

-- Add public read policy for buyers so provider directory works
CREATE POLICY "Anyone can read active buyers" ON public.buyers FOR SELECT USING (is_active = true);
