-- Fix recursive RLS policy on admin_users causing infinite recursion errors
DROP POLICY IF EXISTS "Admins can select admin_users" ON public.admin_users;

CREATE POLICY "Users can select own admin row"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());