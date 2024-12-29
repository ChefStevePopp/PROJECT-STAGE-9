-- Drop all existing policies for organization roles
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view roles" ON org_role_assignments;
  DROP POLICY IF EXISTS "Owners and devs can manage roles" ON org_role_assignments;
END $$;

-- Create new simplified policies without recursion
CREATE POLICY "View roles"
  ON org_role_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage roles"
  ON org_role_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM organizations WHERE id = organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND system_role = 'dev'
    )
  );

CREATE POLICY "Update roles"
  ON org_role_assignments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT owner_id FROM organizations WHERE id = organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND system_role = 'dev'
    )
  );

CREATE POLICY "Delete roles"
  ON org_role_assignments FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT owner_id FROM organizations WHERE id = organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND system_role = 'dev'
    )
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
    -- Update organization owner
    UPDATE organizations
    SET owner_id = steve_id
    WHERE id = org_id;

    -- Update Steve's profile
    UPDATE profiles
    SET 
      system_role = 'dev',
      organization_id = org_id
    WHERE id = steve_id;

    -- Ensure Steve has owner role assignment
    INSERT INTO org_role_assignments (
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