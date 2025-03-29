-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create prep list templates for their organization" ON prep_list_templates;
DROP POLICY IF EXISTS "Users can view prep list templates for their organization" ON prep_list_templates;
DROP POLICY IF EXISTS "Users can update prep list templates for their organization" ON prep_list_templates;
DROP POLICY IF EXISTS "Users can delete prep list templates for their organization" ON prep_list_templates;

-- Create policies with proper organization check
CREATE POLICY "Users can create prep list templates for their organization"
ON prep_list_templates
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view prep list templates for their organization"
ON prep_list_templates
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update prep list templates for their organization"
ON prep_list_templates
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete prep list templates for their organization"
ON prep_list_templates
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);
