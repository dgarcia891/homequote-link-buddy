ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS og_image_width integer,
  ADD COLUMN IF NOT EXISTS og_image_height integer,
  ADD COLUMN IF NOT EXISTS twitter_card_type text DEFAULT 'summary_large_image';