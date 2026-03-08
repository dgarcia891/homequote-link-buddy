ALTER TABLE public.leads ADD COLUMN ai_authenticity_score integer DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN ai_authenticity_reason text DEFAULT NULL;