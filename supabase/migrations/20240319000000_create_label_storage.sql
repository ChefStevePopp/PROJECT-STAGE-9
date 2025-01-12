-- Create storage bucket for label templates and samples
INSERT INTO storage.buckets (id, name, public) 
VALUES ('label-templates', 'label-templates', true);

-- Set up storage policies
CREATE POLICY "Label templates are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'label-templates');

CREATE POLICY "Organization members can upload label templates" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'label-templates' AND 
  EXISTS (
    SELECT 1 
    FROM organization_team_members 
    WHERE organization_team_members.organization_id = (
      SELECT organization_id 
      FROM organization_team_members 
      WHERE auth.uid() = auth.uid()
    )
  )
);