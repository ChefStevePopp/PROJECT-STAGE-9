-- First clean up any existing policies
DROP POLICY IF EXISTS "View master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Manage master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Users can view ingredients in their organization" ON master_ingredients;
DROP POLICY IF EXISTS "Admins can manage ingredients" ON master_ingredients;

-- Enable RLS if not already enabled
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;

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
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
    )
  );

CREATE POLICY "Manage master ingredients"
  ON master_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
    )
    OR
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = master_ingredients.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- First clean up any invalid data
UPDATE master_ingredients
SET item_code = CASE
  WHEN item_code IS NULL OR item_code = '' OR item_code = '0' 
  THEN 'TEMP-' || id::text
  ELSE item_code
END;

-- Remove the unique_id column and constraints
ALTER TABLE master_ingredients
DROP COLUMN IF EXISTS unique_id CASCADE;

-- Add proper constraints
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_item_code_org_key,
ADD CONSTRAINT master_ingredients_item_code_org_key 
UNIQUE (organization_id, item_code);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_org_id 
ON master_ingredients(organization_id);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_item_code 
ON master_ingredients(item_code);

-- Add helpful comments
COMMENT ON TABLE master_ingredients IS 'Stores master ingredient data including allergen information';
COMMENT ON COLUMN master_ingredients.item_code IS 'Vendor code or bar code for the ingredient';