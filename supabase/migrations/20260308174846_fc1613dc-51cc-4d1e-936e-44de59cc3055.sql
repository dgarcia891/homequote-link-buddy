-- Add missing columns to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'native',
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL DEFAULT 'image',
  alt_text TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage media" ON media_assets FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Create post_metrics table
CREATE TABLE IF NOT EXISTS post_metrics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT
);
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert metrics" ON post_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read metrics" ON post_metrics FOR SELECT TO authenticated USING (is_admin());

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Anyone can read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admins can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images' AND (SELECT is_admin()));
CREATE POLICY "Admins can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images' AND (SELECT is_admin()));