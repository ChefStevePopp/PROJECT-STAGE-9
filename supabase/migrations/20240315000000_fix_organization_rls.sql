-- Drop existing policies
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;

-- Create new simplified policies
CREATE POLICY "View organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
    OR
    owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
      )
    )
  );

CREATE POLICY "Manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
      )
    )
  );

-- Create policy for organization roles
CREATE POLICY "Manage organization roles"
  ON organization_roles FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT owner_id FROM organizations 
      WHERE id = organization_roles.organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
      )
    )
  );

-- Add helpful comments
COMMENT ON POLICY "View organizations" ON organizations IS 
'Allow users to view organizations they belong to or if they are a dev';

COMMENT ON POLICY "Manage organizations" ON organizations IS 
'Allow organization owners and devs to manage organizations';

COMMENT ON POLICY "Manage organization roles" ON organization_roles IS 
'Allow organization owners and devs to manage organization roles';