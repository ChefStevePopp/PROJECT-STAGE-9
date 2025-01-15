-- Create storage bucket for storage location photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('storage-images', 'storage-images', true);

-- Set up storage policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload storage images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'storage-images' AND
    (storage.foldername(name))[1] = auth.jwt() -> 'user_metadata' ->> 'organizationId'
  );

-- Allow users to update their own storage images
CREATE POLICY "Users can update their own storage images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'storage-images' AND
    (storage.foldername(name))[1] = auth.jwt() -> 'user_metadata' ->> 'organizationId'
  );

-- Allow users to delete their own storage images
CREATE POLICY "Users can delete their own storage images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'storage-images' AND
    (storage.foldername(name))[1] = auth.jwt() -> 'user_metadata' ->> 'organizationId'
  );

-- Allow public read access to storage images
CREATE POLICY "Public read access for storage images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'storage-images');
