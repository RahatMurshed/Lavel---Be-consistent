INSERT INTO storage.buckets (id, name, public) VALUES ('identity-logos', 'identity-logos', true);

CREATE POLICY "Anyone can view identity logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'identity-logos');

CREATE POLICY "Authenticated users can upload identity logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'identity-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own identity logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'identity-logos' AND auth.role() = 'authenticated');