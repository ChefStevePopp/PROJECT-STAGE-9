-- Drop existing policies to prevent recursion
DO $$
BEGIN
  -- Drop all policies for org_role_assignments
  DROP POLICY IF EXISTS "Anyone can view organization roles" ON org_role_assignments;
  DROP POLICY IF EXISTS "Owners and admins can manage organization roles" ON org_role_assignments;
END $$;

-- Create new non-recursive policies
CREATE POLICY "View organization roles"
  ON org_role_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage organization roles"
  ON org_role_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.system_role = 'dev'
        OR EXISTS (
          SELECT 1 FROM organizations o
          WHERE o.id = org_role_assignments.organization_id
          AND o.owner_id = auth.uid()
        )
      )
    )
  );

-- Update Steve's role to ensure access
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
    -- Ensure Steve is the organization owner
    UPDATE organizations
    SET owner_id = steve_id
    WHERE id = org_id;

    -- Update Steve's profile
    UPDATE profiles
    SET 
      system_role = 'dev',
      organization_id = org_id
    WHERE id = steve_id;
  END IF;
END $$;