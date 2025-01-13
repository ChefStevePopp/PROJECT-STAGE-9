-- First drop all existing policies for recipe-media bucket
DROP POLICY IF EXISTS "Recipe media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload recipe media to their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their org recipe media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their org recipe media" ON storage.objects;

-- Create new policies matching the label-templates pattern but for organization members

-- SELECT policy - Allow public access to recipe media
CREATE POLICY "Recipe media is publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'recipe-media');

-- INSERT policy - Organization members can upload
CREATE POLICY "Organization members can upload recipe media" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-media' AND
    auth.uid() IN (
      SELECT user_id 
      FROM organization_team_members 
      WHERE organization_id::text = (storage.foldername(name))[1]
    )
  );

-- DELETE policy - Organization members can delete
CREATE POLICY "Organization members can delete recipe media" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'recipe-media' AND
    auth.uid() IN (
      SELECT user_id 
      FROM organization_team_members 
      WHERE organization_id::text = (storage.foldername(name))[1]
    )
  );

-- UPDATE policy - Organization members can update
CREATE POLICY "Organization members can update recipe media" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'recipe-media' AND
    auth.uid() IN (
      SELECT user_id 
      FROM organization_team_members 
      WHERE organization_id::text = (storage.foldername(name))[1]
    )
  );
