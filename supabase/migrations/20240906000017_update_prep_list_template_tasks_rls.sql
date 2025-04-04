-- Drop existing policy for kitchen leadership
DROP POLICY IF EXISTS "Kitchen leadership can manage all prep list template tasks" ON prep_list_template_tasks;

-- Create updated policy that checks both organization_roles and organization_team_members tables
CREATE POLICY "Kitchen leadership can manage all prep list template tasks"
ON prep_list_template_tasks
FOR ALL
TO authenticated
USING (
  -- Check organization_roles table
  EXISTS (
    SELECT 1 FROM organization_roles
    WHERE organization_roles.user_id = auth.uid()
    AND organization_roles.role IN ('owner', 'chef', 'sous_chef', 'admin')
  )
  OR
  -- Check organization_team_members table
  EXISTS (
    SELECT 1 FROM organization_team_members
    WHERE organization_team_members.id = auth.uid()
    AND organization_team_members.kitchen_role IN ('owner', 'chef', 'sous_chef', 'admin')
  )
);
