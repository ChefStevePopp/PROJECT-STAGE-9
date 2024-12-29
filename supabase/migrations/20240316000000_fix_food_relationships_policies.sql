-- Drop existing policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "View food relationships" ON food_category_groups;
  DROP POLICY IF EXISTS "Manage food relationships" ON food_category_groups;
  DROP POLICY IF EXISTS "View food categories" ON food_categories;
  DROP POLICY IF EXISTS "Manage food categories" ON food_categories;
  DROP POLICY IF EXISTS "View food sub-categories" ON food_sub_categories;
  DROP POLICY IF EXISTS "Manage food sub-categories" ON food_sub_categories;
END $$;

-- Create new simplified policies
CREATE POLICY "View food relationships"
  ON food_category_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food relationships"
  ON food_category_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_category_groups.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Repeat for categories
CREATE POLICY "View food categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food categories"
  ON food_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_categories.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Repeat for sub-categories
CREATE POLICY "View food sub-categories"
  ON food_sub_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food sub-categories"
  ON food_sub_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_sub_categories.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Add helpful comments
COMMENT ON POLICY "View food relationships" ON food_category_groups IS 
'Allow all authenticated users to view food relationships';

COMMENT ON POLICY "Manage food relationships" ON food_category_groups IS 
'Allow organization admins and devs to manage food relationships';