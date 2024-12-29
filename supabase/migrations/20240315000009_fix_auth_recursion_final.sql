-- Drop existing policies to prevent recursion
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
  USING (
    id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

CREATE POLICY "Manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid()
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
    user_id = auth.uid()
    OR organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_roles_user_id ON organization_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_org_id ON organization_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_owner_id ON organizations(owner_id);