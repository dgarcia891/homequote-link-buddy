
-- Function to auto-link leads to homeowner profile on signup
CREATE OR REPLACE FUNCTION public.link_leads_to_homeowner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matched_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO matched_ids
  FROM public.leads
  WHERE email_normalized = lower(trim(NEW.email));

  IF matched_ids IS NOT NULL THEN
    UPDATE public.homeowner_profiles
    SET linked_lead_ids = matched_ids
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_link_leads_on_homeowner_insert
  AFTER INSERT ON public.homeowner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_leads_to_homeowner();
