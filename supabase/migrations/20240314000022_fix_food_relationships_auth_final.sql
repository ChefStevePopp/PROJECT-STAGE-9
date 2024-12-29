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
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (
        -- Check if user is dev
        u.raw_user_meta_data->>'role' = 'dev'
        OR
        -- Check if user owns this organization
        EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = food_category_groups.organization_id
          AND o.owner_id = u.id
        )
        OR
        -- Check organization ID in metadata
        u.raw_user_meta_data->>'organizationId' = food_category_groups.organization_id::text
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
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (
        u.raw_user_meta_data->>'role' = 'dev'
        OR EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = food_categories.organization_id
          AND o.owner_id = u.id
        )
        OR u.raw_user_meta_data->>'organizationId' = food_categories.organization_id::text
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
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (
        u.raw_user_meta_data->>'role' = 'dev'
        OR EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = food_sub_categories.organization_id
          AND o.owner_id = u.id
        )
        OR u.raw_user_meta_data->>'organizationId' = food_sub_categories.organization_id::text
      )
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_category_groups_org_id 
ON food_category_groups(organization_id);

CREATE INDEX IF NOT EXISTS idx_food_categories_org_id 
ON food_categories(organization_id);

CREATE INDEX IF NOT EXISTS idx_food_sub_categories_org_id 
ON food_sub_categories(organization_id);

-- Update Steve's metadata to ensure dev access
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Dev Popp',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';

-- Add helpful comments
COMMENT ON POLICY "View food relationships" ON food_category_groups IS 
'Allow all authenticated users to view food relationships';

COMMENT ON POLICY "Manage food relationships" ON food_category_groups IS 
'Allow organization owners and devs to manage food relationships';