-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('ingredient-photos', 'ingredient-photos')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for uploading ingredient photos
CREATE POLICY "Users can upload ingredient photos to their organization" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ingredient-photos' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT id::text
      FROM organizations
      WHERE owner_id = auth.uid()
      LIMIT 1
    )
  );

-- Create policy for viewing ingredient photos
CREATE POLICY "Users can view ingredient photos from their organization" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'ingredient-photos' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT id::text
      FROM organizations
      WHERE owner_id = auth.uid()
      LIMIT 1
    )
  );

-- Create policy for deleting ingredient photos
CREATE POLICY "Users can delete ingredient photos from their organization" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'ingredient-photos' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT id::text
      FROM organizations
      WHERE owner_id = auth.uid()
      LIMIT 1
    )
  );
