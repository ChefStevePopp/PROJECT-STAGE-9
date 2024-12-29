-- Add system_role to auth.users metadata
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS system_role TEXT CHECK (system_role IN ('dev', 'user'));

-- Create function to check if user is a dev
CREATE OR REPLACE FUNCTION is_dev()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'system_role' = 'dev' OR
    auth.jwt() ->> 'role' = 'service_role'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing policies to allow dev access

-- Organizations
CREATE OR REPLACE POLICY "Devs can access all organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    is_dev() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
  );

-- Locations
CREATE OR REPLACE POLICY "Devs can access all locations"
  ON locations FOR ALL
  TO authenticated
  USING (
    is_dev() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = locations.organization_id
      AND user_id = auth.uid()
    )
  );

-- Organization Members
CREATE OR REPLACE POLICY "Devs can manage all organization members"
  ON organization_members FOR ALL
  TO authenticated
  USING (
    is_dev() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Location Members
CREATE OR REPLACE POLICY "Devs can manage all location members"
  ON location_members FOR ALL
  TO authenticated
  USING (
    is_dev() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = (
        SELECT organization_id 
        FROM locations 
        WHERE id = location_members.location_id
      )
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Team Members
CREATE OR REPLACE POLICY "Devs can manage all team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    is_dev() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = team_members.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Invitations
CREATE OR REPLACE POLICY "Devs can manage all invitations"
  ON invitations FOR ALL
  TO authenticated
  USING (
    is_dev() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = invitations.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );