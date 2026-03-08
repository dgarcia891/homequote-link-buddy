
-- Post version history table (last 5 snapshots per post)
CREATE TABLE public.post_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image_url text,
  tags text[],
  category text,
  saved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_post_versions_post_id ON public.post_versions(post_id, created_at DESC);

-- RLS
ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage post versions"
  ON public.post_versions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to auto-prune keeping only last 5 versions per post
CREATE OR REPLACE FUNCTION public.prune_post_versions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.post_versions
  WHERE id IN (
    SELECT id FROM public.post_versions
    WHERE post_id = NEW.post_id
    ORDER BY created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prune_post_versions
  AFTER INSERT ON public.post_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.prune_post_versions();
