-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can manage prep list template tasks" ON prep_list_template_tasks;
DROP POLICY IF EXISTS "Template owners can manage their tasks" ON prep_list_template_tasks;
DROP POLICY IF EXISTS "DEV users can manage all prep list template tasks" ON prep_list_template_tasks;
DROP POLICY IF EXISTS "Admin users can manage all prep list template tasks" ON prep_list_template_tasks;
DROP POLICY IF EXISTS "Kitchen leadership can manage all prep list template tasks" ON prep_list_template_tasks;

-- Create a policy that allows organization members to manage prep list template tasks
CREATE POLICY "Organization members can manage prep list template tasks"
ON prep_list_template_tasks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_team_members 
    WHERE organization_team_members.organization_id = prep_list_template_tasks.organization_id 
    AND organization_team_members.id = auth.uid()
  )
);

-- Create a fallback policy for tasks without organization_id
CREATE POLICY "Template owners can manage their tasks"
ON prep_list_template_tasks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM prep_list_templates
    WHERE prep_list_templates.id = prep_list_template_tasks.template_id
    AND EXISTS (
      SELECT 1 FROM organization_team_members
      WHERE organization_team_members.organization_id = prep_list_templates.organization_id
      AND organization_team_members.id = auth.uid()
    )
  )
);

-- Add a policy for users with specific roles to manage all tasks
CREATE POLICY "Kitchen leadership can manage all prep list template tasks"
ON prep_list_template_tasks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_roles
    WHERE organization_roles.user_id = auth.uid()
    AND organization_roles.role IN ('owner', 'chef', 'sous_chef', 'admin')
  )
);

-- Ensure RLS is enabled
ALTER TABLE prep_list_template_tasks ENABLE ROW LEVEL SECURITY;