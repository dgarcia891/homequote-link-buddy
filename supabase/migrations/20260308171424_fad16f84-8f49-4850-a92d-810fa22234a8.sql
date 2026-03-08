-- Allow admins to manage posts (insert, update, delete)
CREATE POLICY "Admins can insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update posts" ON public.posts FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete posts" ON public.posts FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Admins can select all posts" ON public.posts FOR SELECT TO authenticated USING (is_admin());