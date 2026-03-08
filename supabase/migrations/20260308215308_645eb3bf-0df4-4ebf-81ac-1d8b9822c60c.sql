
CREATE TABLE public.verticals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  professional_label TEXT NOT NULL DEFAULT 'professional',
  professional_label_plural TEXT NOT NULL DEFAULT 'professionals',
  service_types TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon_name TEXT,
  hero_title TEXT,
  hero_description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active verticals"
  ON public.verticals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage verticals"
  ON public.verticals FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER set_verticals_updated_at
  BEFORE UPDATE ON public.verticals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
