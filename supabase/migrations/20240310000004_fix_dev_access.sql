-- Drop existing policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
END $$;

-- Create new policies that check both metadata locations for dev role
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
      LEFT JOIN profiles p ON p.id = u.id
      WHERE u.id = auth.uid()
      AND (
        -- Check both locations for dev role
        u.raw_user_meta_data->>'system_role' = 'dev'
        OR u.raw_user_meta_data->>'role' = 'dev'
        OR p.system_role = 'dev'
        OR EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = organization_roles.organization_id
          AND o.owner_id = auth.uid()
        )
      )
    )
  );

-- Update Steve's metadata to ensure dev access
DO $$
DECLARE
  steve_id uuid;
BEGIN
  -- Get Steve's user ID
  SELECT id INTO steve_id
  FROM auth.users
  WHERE email = 'office@memphisfirebbq.com';

  IF steve_id IS NOT NULL THEN
    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'firstName', 'Steve',
      'lastName', 'Dev Popp',
      'system_role', 'dev',
      'role', 'dev',
      'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
    )
    WHERE id = steve_id;

    -- Update profile
    UPDATE profiles
    SET 
      first_name = 'Steve',
      last_name = 'Dev Popp',
      system_role = 'dev'
    WHERE id = steve_id;
  END IF;
END $$;