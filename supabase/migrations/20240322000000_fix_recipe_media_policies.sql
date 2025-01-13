-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their organization's media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their organization's media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their organization's media" ON storage.objects;

-- Create policies for recipe-media bucket

-- INSERT policy
CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-media' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId' IN (
    SELECT id::text FROM organizations
  )
);

-- DELETE policy
CREATE POLICY "Allow users to delete their organization's media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe-media' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM organizations
    WHERE id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId')
  )
);

-- SELECT policy
CREATE POLICY "Allow users to read their organization's media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recipe-media' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM organizations
    WHERE id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId')
  )
);

-- UPDATE policy
CREATE POLICY "Allow users to update their organization's media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recipe-media' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM organizations
    WHERE id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId')
  )
);
