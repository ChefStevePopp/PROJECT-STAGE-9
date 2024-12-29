-- Drop existing policies
DROP POLICY IF EXISTS "View master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Manage master ingredients" ON master_ingredients;

-- Create new simplified policies
CREATE POLICY "View master ingredients"
  ON master_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = master_ingredients.organization_id
      AND user_id = auth.uid()
    )
    OR
    auth.jwt() ->> 'system_role' = 'dev'
    OR
    auth.jwt() ->> 'role' = 'dev'
  );

CREATE POLICY "Manage master ingredients"
  ON master_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = master_ingredients.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR
    auth.jwt() ->> 'system_role' = 'dev'
    OR
    auth.jwt() ->> 'role' = 'dev'
  );

-- Add helpful comments
COMMENT ON POLICY "View master ingredients" ON master_ingredients IS 
'Allow users to view ingredients in their organization or if they are a dev';

COMMENT ON POLICY "Manage master ingredients" ON master_ingredients IS 
'Allow admins and owners to manage ingredients in their organization or if they are a dev';