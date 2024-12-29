-- Drop existing policies
DROP POLICY IF EXISTS "View food relationships" ON food_category_groups;
DROP POLICY IF EXISTS "Manage food relationships" ON food_category_groups;
DROP POLICY IF EXISTS "View food categories" ON food_categories;
DROP POLICY IF EXISTS "Manage food categories" ON food_categories;
DROP POLICY IF EXISTS "View food sub-categories" ON food_sub_categories;
DROP POLICY IF EXISTS "Manage food sub-categories" ON food_sub_categories;

-- Create new simplified policies with proper auth checks
CREATE POLICY "View food relationships"
  ON food_category_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food relationships"
  ON food_category_groups FOR ALL
  TO authenticated
  USING (
    -- Check if user is dev
    auth.jwt()->>'role' = 'dev'
    OR
    -- Check if user owns this organization
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = food_category_groups.organization_id
      AND o.owner_id = auth.uid()
    )
    OR
    -- Check if user has this organization ID
    auth.jwt()->>'organizationId' = food_category_groups.organization_id::text
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
    auth.jwt()->>'role' = 'dev'
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = food_categories.organization_id
      AND o.owner_id = auth.uid()
    )
    OR auth.jwt()->>'organizationId' = food_categories.organization_id::text
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
    auth.jwt()->>'role' = 'dev'
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = food_sub_categories.organization_id
      AND o.owner_id = auth.uid()
    )
    OR auth.jwt()->>'organizationId' = food_sub_categories.organization_id::text
  );

-- Ensure Steve has the correct permissions
DO $$
DECLARE
  steve_id uuid;
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  -- Get Steve's user ID
  SELECT id INTO steve_id
  FROM auth.users
  WHERE email = 'office@memphisfirebbq.com';

  IF steve_id IS NOT NULL THEN
    -- Update Steve's metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'firstName', 'Steve',
      'lastName', 'Dev Popp',
      'role', 'dev',
      'organizationId', org_id
    )
    WHERE id = steve_id;

    -- Ensure Steve owns the organization
    UPDATE organizations
    SET owner_id = steve_id
    WHERE id = org_id;

    -- Ensure Steve has owner role
    INSERT INTO organization_roles (
      organization_id,
      user_id,
      role
    )
    VALUES (
      org_id,
      steve_id,
      'owner'
    )
    ON CONFLICT (organization_id, user_id) 
    DO UPDATE SET 
      role = 'owner',
      updated_at = CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Add helpful comments
COMMENT ON POLICY "View food relationships" ON food_category_groups IS 
'Allow all authenticated users to view food relationships';

COMMENT ON POLICY "Manage food relationships" ON food_category_groups IS 
'Allow organization owners and devs to manage food relationships';