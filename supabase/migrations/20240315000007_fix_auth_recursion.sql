-- Drop existing policies to prevent conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organizations" ON organizations;
  DROP POLICY IF EXISTS "Manage organizations" ON organizations;
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
END $$;

-- Create new non-recursive policies
CREATE POLICY "View organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    EXISTS (
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
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (
        -- Check if user is dev
        u.raw_user_meta_data->>'role' = 'dev'
        OR
        -- Check if user is organization owner
        EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = organization_roles.organization_id
          AND o.owner_id = u.id
        )
      )
    )
  );

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
COMMENT ON POLICY "View organizations" ON organizations IS 
'Allow all authenticated users to view organizations';

COMMENT ON POLICY "Manage organizations" ON organizations IS 
'Allow only organization owners and devs to manage organizations';

COMMENT ON POLICY "View organization roles" ON organization_roles IS 
'Allow all authenticated users to view organization roles';

COMMENT ON POLICY "Manage organization roles" ON organization_roles IS 
'Allow only organization owners and devs to manage organization roles';