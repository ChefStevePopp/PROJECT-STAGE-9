-- Drop all existing policies first
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organizations" ON organizations;
  DROP POLICY IF EXISTS "Manage organizations" ON organizations;
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
  DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;
  DROP POLICY IF EXISTS "Users can view organization members" ON organization_roles;
  DROP POLICY IF EXISTS "Admins can manage organization members" ON organization_roles;
END $$;

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
    EXISTS (
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
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

CREATE POLICY "View organization roles"
  ON organization_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = organization_roles.organization_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM organization_roles
          WHERE organization_id = organizations.id
          AND user_id = auth.uid()
        )
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

CREATE POLICY "Manage organization roles"
  ON organization_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = organization_roles.organization_id
      AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Create function to handle new user organization setup
CREATE OR REPLACE FUNCTION handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Create organization for new user if they don't have one
  IF NOT EXISTS (
    SELECT 1 FROM organizations 
    WHERE owner_id = NEW.id
  ) THEN
    INSERT INTO organizations (
      name,
      owner_id,
      settings
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'organization_name', split_part(NEW.email, '@', 1) || '''s Organization'),
      NEW.id,
      jsonb_build_object(
        'business_type', 'restaurant',
        'default_timezone', 'America/Toronto',
        'multi_unit', false,
        'currency', 'CAD',
        'date_format', 'MM/DD/YYYY',
        'time_format', '12h'
      )
    )
    RETURNING id INTO org_id;

    -- Create owner role
    INSERT INTO organization_roles (
      organization_id,
      user_id,
      role
    ) VALUES (
      org_id,
      NEW.id,
      'owner'
    );

    -- Update user's metadata with organization ID
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('organizationId', org_id)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;
CREATE TRIGGER on_auth_user_created_organization
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_organization();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON organizations TO authenticated;
GRANT SELECT, INSERT ON organization_roles TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION handle_new_user_organization() IS 
'Creates organization and role for new users, updates user metadata';

COMMENT ON POLICY "View organizations" ON organizations IS 
'Allow users to view organizations they belong to or if they are a dev';

COMMENT ON POLICY "Manage organizations" ON organizations IS 
'Allow organization owners and devs to manage organizations';

COMMENT ON POLICY "View organization roles" ON organization_roles IS 
'Allow users to view roles in organizations they belong to';

COMMENT ON POLICY "Manage organization roles" ON organization_roles IS 
'Allow organization owners and devs to manage roles';