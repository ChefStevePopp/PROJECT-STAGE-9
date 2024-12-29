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
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'system_role' = 'dev'
      OR raw_user_meta_data->>'role' = 'dev'
    )
    OR
    auth.uid() IN (
      SELECT owner_id FROM organizations 
      WHERE id = organization_roles.organization_id
    )
  );

-- Update Steve's metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve - Dev',
  'lastName', 'Popp',
  'system_role', 'dev',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';