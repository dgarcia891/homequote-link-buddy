
-- Allow buyers to update the response on reviews targeting their buyer_id
CREATE POLICY "Buyers can respond to their reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (
    buyer_id IN (
      SELECT bp.buyer_id FROM public.buyer_profiles bp WHERE bp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    buyer_id IN (
      SELECT bp.buyer_id FROM public.buyer_profiles bp WHERE bp.user_id = auth.uid()
    )
  );
