-- Drop existing policies
DROP POLICY IF EXISTS "Users can view ingredients in their organization" ON master_ingredients;
DROP POLICY IF EXISTS "Admins can manage ingredients" ON master_ingredients;

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
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
    )
  );

-- Add unique constraint for item_code
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_unique_id_key,
ADD CONSTRAINT master_ingredients_item_code_org_key UNIQUE (organization_id, item_code);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_org_id ON master_ingredients(organization_id);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_item_code ON master_ingredients(item_code);