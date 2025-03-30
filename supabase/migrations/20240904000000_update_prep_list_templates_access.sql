-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Organization members can access prep list templates" ON prep_list_templates;

-- Create new policy with corrected conditions
CREATE POLICY "Organization members can access prep list templates"
ON prep_list_templates
FOR ALL
TO authenticated
USING (
  -- Check if user is in organization_team_members
  EXISTS (
    SELECT 1 FROM organization_team_members 
    WHERE organization_team_members.email = auth.email()
  )
  -- Or if user is the special office email
  OR auth.email() = 'office@memphisfirebbq.com'
  -- Or if user has dev access (checking from organization_team_members metadata)
  OR EXISTS (
    SELECT 1 FROM organization_team_members 
    WHERE organization_team_members.email = auth.email()
    AND (organization_team_members.metadata->>'isDev')::boolean = true
  )
);