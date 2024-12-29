-- Drop existing policies to prevent conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organizations" ON organizations;
  DROP POLICY IF EXISTS "Manage organizations" ON organizations;
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
END $$;

-- Create new simplified policies
CREATE POLICY "View organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR auth.email() = 'office@memphisfirebbq.com' -- Steve always has access
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

CREATE POLICY "View organization roles"
  ON organization_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage organization roles"
  ON organization_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = organization_roles.organization_id
      AND owner_id = auth.uid()
    )
    OR auth.email() = 'office@memphisfirebbq.com' -- Steve always has access
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Set up Steve's user account properly
DO $$
DECLARE
  steve_id uuid := '859585ee-05a4-4660-806b-174d6f1cbe45';
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  -- Update Steve's auth user metadata
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
      'firstName', 'Steve',
      'lastName', 'Dev Popp',
      'role', 'dev',
      'system_role', 'dev',
      'organizationId', org_id
    ),
    email = 'office@memphisfirebbq.com',
    email_confirmed_at = now(),
    is_sso_user = false
  WHERE id = steve_id;

  -- Ensure organization exists and Steve owns it
  INSERT INTO organizations (
    id,
    name,
    owner_id,
    settings
  ) VALUES (
    org_id,
    'Memphis Fire Barbeque Company Inc.',
    steve_id,
    jsonb_build_object(
      'business_type', 'restaurant',
      'cuisine_type', 'BBQ',
      'default_timezone', 'America/Toronto',
      'multi_unit', false,
      'currency', 'CAD',
      'date_format', 'MM/DD/YYYY',
      'time_format', '12h'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    owner_id = steve_id,
    updated_at = CURRENT_TIMESTAMP;

  -- Ensure Steve has owner role
  INSERT INTO organization_roles (
    organization_id,
    user_id,
    role
  ) VALUES (
    org_id,
    steve_id,
    'owner'
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE
  SET 
    role = 'owner',
    updated_at = CURRENT_TIMESTAMP;

  -- Update RLS policies for food relationships to always allow Steve access
  DROP POLICY IF EXISTS "Manage food relationships" ON food_category_groups;
  CREATE POLICY "Manage food relationships"
    ON food_category_groups FOR ALL
    TO authenticated
    USING (
      auth.email() = 'office@memphisfirebbq.com'
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'dev'
      )
    );

  -- Repeat for other food relationship tables
  DROP POLICY IF EXISTS "Manage food categories" ON food_categories;
  CREATE POLICY "Manage food categories"
    ON food_categories FOR ALL
    TO authenticated
    USING (
      auth.email() = 'office@memphisfirebbq.com'
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'dev'
      )
    );

  DROP POLICY IF EXISTS "Manage food sub-categories" ON food_sub_categories;
  CREATE POLICY "Manage food sub-categories"
    ON food_sub_categories FOR ALL
    TO authenticated
    USING (
      auth.email() = 'office@memphisfirebbq.com'
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'dev'
      )
    );
END $$;

-- Add helpful comments
COMMENT ON POLICY "View organizations" ON organizations IS 
'Allow all authenticated users to view organizations';

COMMENT ON POLICY "Manage organizations" ON organizations IS 
'Allow organization owners and devs to manage organizations, with special access for Steve';

COMMENT ON POLICY "View organization roles" ON organization_roles IS 
'Allow all authenticated users to view organization roles';

COMMENT ON POLICY "Manage organization roles" ON organization_roles IS 
'Allow organization owners and devs to manage organization roles, with special access for Steve';