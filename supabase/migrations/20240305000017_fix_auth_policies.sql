-- Drop all existing policies
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
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.system_role = 'dev'
        OR EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = organization_roles.organization_id
          AND o.owner_id = auth.uid()
        )
      )
    )
  );

-- Update Steve's permissions
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Popp',
  'system_role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';

UPDATE profiles 
SET system_role = 'dev'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'office@memphisfirebbq.com'
);