
DROP POLICY "Anyone can insert leads" ON public.leads;

CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
