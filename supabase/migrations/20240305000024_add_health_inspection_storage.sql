-- Create storage bucket for health inspection documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-inspections', 'health-inspections', false);

-- Add RLS policies for health inspection documents
CREATE POLICY "Users can view health inspection documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'health-inspections' AND
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = (storage.foldername(name))[1]::uuid
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage health inspection documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'health-inspections' AND
    (
      EXISTS (
        SELECT 1 FROM organization_roles
        WHERE organization_id = (storage.foldername(name))[1]::uuid
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND system_role = 'dev'
      )
    )
  );

-- Add document tracking to health_inspections table
ALTER TABLE health_inspections
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;