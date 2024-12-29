-- Drop existing policies
DROP POLICY IF EXISTS "View food relationships" ON food_category_groups;
DROP POLICY IF EXISTS "Manage food relationships" ON food_category_groups;
DROP POLICY IF EXISTS "View food categories" ON food_categories;
DROP POLICY IF EXISTS "Manage food categories" ON food_categories;
DROP POLICY IF EXISTS "View food sub-categories" ON food_sub_categories;
DROP POLICY IF EXISTS "Manage food sub-categories" ON food_sub_categories;

-- Create new simplified policies for food_category_groups
CREATE POLICY "View food relationships"
  ON food_category_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_category_groups.organization_id
      AND user_id = auth.uid()
    )
    OR
    auth.jwt() ->> 'system_role' = 'dev'
  );

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
    OR
    auth.jwt() ->> 'system_role' = 'dev'
  );

-- Create policies for food_categories
CREATE POLICY "View food categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_categories.organization_id
      AND user_id = auth.uid()
    )
    OR
    auth.jwt() ->> 'system_role' = 'dev'
  );

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
    OR
    auth.jwt() ->> 'system_role' = 'dev'
  );

-- Create policies for food_sub_categories
CREATE POLICY "View food sub-categories"
  ON food_sub_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_sub_categories.organization_id
      AND user_id = auth.uid()
    )
    OR
    auth.jwt() ->> 'system_role' = 'dev'
  );

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
    OR
    auth.jwt() ->> 'system_role' = 'dev'
  );

-- Add helpful comments
COMMENT ON POLICY "View food relationships" ON food_category_groups IS 
'Allow users to view food relationships in their organization or if they are a dev';

COMMENT ON POLICY "Manage food relationships" ON food_category_groups IS 
'Allow admins and owners to manage food relationships in their organization or if they are a dev';