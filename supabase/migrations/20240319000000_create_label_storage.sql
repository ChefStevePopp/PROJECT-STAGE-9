-- Create label-templates bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('label-templates', 'label-templates', true);

-- Set up storage policies for label-templates bucket
CREATE POLICY "Label templates are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'label-templates');

CREATE POLICY "Users can upload label templates to their organization folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'label-templates' AND
    (storage.foldername(name))[1] = auth.jwt() -> 'organization_id'
  );

CREATE POLICY "Users can update their organization's label templates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'label-templates' AND
    (storage.foldername(name))[1] = auth.jwt() -> 'organization_id'
  );

CREATE POLICY "Users can delete their organization's label templates"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'label-templates' AND
    (storage.foldername(name))[1] = auth.jwt() -> 'organization_id'
  );