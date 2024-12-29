-- Drop existing policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "View organizations" ON organizations;
  DROP POLICY IF EXISTS "Manage organizations" ON organizations;
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
END $$;

-- Create new simplified non-recursive policies
CREATE POLICY "View organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND user_metadata->>'role' = 'dev'
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
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = organization_roles.organization_id
      AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND user_metadata->>'role' = 'dev'
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
      COALESCE(NEW.user_metadata->>'organization_name', split_part(NEW.email, '@', 1) || '''s Organization'),
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
    SET user_metadata = user_metadata || jsonb_build_object('organizationId', org_id)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;
CREATE TRIGGER on_auth_user_created_organization
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_organization();

-- Update Steve's metadata to ensure dev access
UPDATE auth.users
SET user_metadata = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Dev Popp',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';

-- Add helpful comments
COMMENT ON POLICY "View organizations" ON organizations IS 
'Allow all authenticated users to view organizations';

COMMENT ON POLICY "Manage organizations" ON organizations IS 
'Allow only organization owners and devs to manage organizations';

COMMENT ON POLICY "View organization roles" ON organization_roles IS 
'Allow all authenticated users to view organization roles';

COMMENT ON POLICY "Manage organization roles" ON organization_roles IS 
'Allow only organization owners and devs to manage organization roles';