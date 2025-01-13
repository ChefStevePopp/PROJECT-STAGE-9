-- Create label-templates bucket with proper policies
CREATE POLICY "Label templates are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'label-templates');

CREATE POLICY "Users can upload label templates to their org" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'label-templates' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM organization_team_members
      WHERE user_id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "Users can delete their org label templates" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'label-templates' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM organization_team_members
      WHERE user_id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "Users can update their org label templates" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'label-templates' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM organization_team_members
      WHERE user_id = auth.uid()
      LIMIT 1
    )
  );
