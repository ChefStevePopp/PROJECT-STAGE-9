-- Drop existing policies
DROP POLICY IF EXISTS "View food relationships" ON food_category_groups;
DROP POLICY IF EXISTS "Manage food relationships" ON food_category_groups;
DROP POLICY IF EXISTS "View food categories" ON food_categories;
DROP POLICY IF EXISTS "Manage food categories" ON food_categories;
DROP POLICY IF EXISTS "View food sub-categories" ON food_sub_categories;
DROP POLICY IF EXISTS "Manage food sub-categories" ON food_sub_categories;

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
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = food_category_groups.organization_id::text
      )
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
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = food_categories.organization_id::text
      )
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
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = food_sub_categories.organization_id::text
      )
    )
  );

-- Update Steve's metadata to ensure dev access
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Dev Popp',
  'system_role', 'dev',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';