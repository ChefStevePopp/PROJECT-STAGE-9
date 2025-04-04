-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own prep list template tasks" ON prep_list_template_tasks;
DROP POLICY IF EXISTS "Organization members can view prep list template tasks" ON prep_list_template_tasks;

-- Create policies that allow organization members to manage prep list template tasks
CREATE POLICY "Organization members can manage prep list template tasks"
ON prep_list_template_tasks
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
  )
);

-- Enable RLS on the table
ALTER TABLE prep_list_template_tasks ENABLE ROW LEVEL SECURITY;