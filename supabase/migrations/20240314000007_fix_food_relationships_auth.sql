-- Drop existing policies
DROP POLICY IF EXISTS "View food category groups" ON food_category_groups;
DROP POLICY IF EXISTS "Manage food category groups" ON food_category_groups;
DROP POLICY IF EXISTS "View food categories" ON food_categories;
DROP POLICY IF EXISTS "Manage food categories" ON food_categories;
DROP POLICY IF EXISTS "View food sub-categories" ON food_sub_categories;
DROP POLICY IF EXISTS "Manage food sub-categories" ON food_sub_categories;

-- Create new simplified policies
CREATE POLICY "View food category groups"
  ON food_category_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food category groups"
  ON food_category_groups FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM organization_roles
      WHERE organization_id = food_category_groups.organization_id
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
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
    auth.uid() IN (
      SELECT user_id FROM organization_roles
      WHERE organization_id = food_categories.organization_id
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
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
    auth.uid() IN (
      SELECT user_id FROM organization_roles
      WHERE organization_id = food_sub_categories.organization_id
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
    )
  );

-- Update Steve's metadata to ensure dev access
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Dev Popp',
  'system_role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';

-- Ensure Steve has owner role
INSERT INTO organization_roles (
  organization_id,
  user_id,
  role
)
SELECT 
  'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
  id,
  'owner'
FROM auth.users
WHERE email = 'office@memphisfirebbq.com'
ON CONFLICT (organization_id, user_id) 
DO UPDATE SET role = 'owner';