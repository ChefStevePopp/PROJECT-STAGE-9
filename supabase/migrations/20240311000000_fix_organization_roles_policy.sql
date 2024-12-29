-- Drop existing policies to prevent recursion
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
END $$;

-- Create new simplified policies without recursion
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
        OR EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = organization_roles.organization_id
          AND o.owner_id = auth.uid()
        )
      )
    )
  );

-- Ensure Steve has the correct permissions
DO $$
DECLARE
  steve_id uuid := '859585ee-05a4-4660-806b-174d6f1cbe45';
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  -- Update Steve's metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'firstName', 'Steve',
    'lastName', 'Dev Popp',
    'system_role', 'dev',
    'organizationId', org_id
  )
  WHERE id = steve_id;

  -- Ensure Steve is organization owner
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
END $$;