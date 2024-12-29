-- Drop all existing policies for organization roles
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organization roles" ON org_role_assignments;
  DROP POLICY IF EXISTS "Manage organization roles" ON org_role_assignments;
END $$;

-- Create simplified, non-recursive policies
CREATE POLICY "Anyone can view roles"
  ON org_role_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners and devs can manage roles"
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

-- Update organization owner relationship
UPDATE organizations
SET owner_id = (
  SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com'
)
WHERE id = 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';