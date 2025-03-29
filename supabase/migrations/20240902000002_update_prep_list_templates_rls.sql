-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create prep list templates for their organization" ON prep_list_templates;
DROP POLICY IF EXISTS "Users can view prep list templates for their organization" ON prep_list_templates;
DROP POLICY IF EXISTS "Users can update prep list templates for their organization" ON prep_list_templates;
DROP POLICY IF EXISTS "Users can delete prep list templates for their organization" ON prep_list_templates;

-- Create policies that check user metadata for organization matching
CREATE POLICY "Users can create prep list templates for their organization"
ON prep_list_templates
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if the organization_id matches the user's metadata organization
  organization_id::text = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId'
  OR
  -- Fallback to organization_team_members check if metadata doesn't have organization
  organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view prep list templates for their organization"
ON prep_list_templates
FOR SELECT
TO authenticated
USING (
  -- Check if the organization_id matches the user's metadata organization
  organization_id::text = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId'
  OR
  -- Fallback to organization_team_members check if metadata doesn't have organization
  organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update prep list templates for their organization"
ON prep_list_templates
FOR UPDATE
TO authenticated
USING (
  -- Check if the organization_id matches the user's metadata organization
  organization_id::text = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId'
  OR
  -- Fallback to organization_team_members check if metadata doesn't have organization
  organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  -- Check if the organization_id matches the user's metadata organization
  organization_id::text = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId'
  OR
  -- Fallback to organization_team_members check if metadata doesn't have organization
  organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete prep list templates for their organization"
ON prep_list_templates
FOR DELETE
TO authenticated
USING (
  -- Check if the organization_id matches the user's metadata organization
  organization_id::text = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'organizationId'
  OR
  -- Fallback to organization_team_members check if metadata doesn't have organization
  organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid()
  )
);
