-- Drop existing policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
END $$;

-- Create simplified non-recursive policies
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
        u.raw_user_meta_data->>'system_role' = 'dev'
        OR u.raw_user_meta_data->>'role' = 'dev'
        OR EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = organization_roles.organization_id
          AND o.owner_id = auth.uid()
        )
      )
    )
  );

-- Update Steve's metadata to ensure dev access
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve - DEV',
  'lastName', 'Popp',
  'system_role', 'dev',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';