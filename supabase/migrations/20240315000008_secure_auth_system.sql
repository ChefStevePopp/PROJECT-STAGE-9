-- Create secure function to handle dev role assignment
CREATE OR REPLACE FUNCTION assign_dev_role(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only superadmin can assign dev role
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Only superadmin can assign dev roles';
  END IF;

  -- Update user metadata securely
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'dev',
    'system_role', 'dev'
  )
  WHERE id = user_id;
END;
$$;

-- Create function to handle organization assignment
CREATE OR REPLACE FUNCTION assign_organization(user_id uuid, org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller has permission
  IF NOT EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.id = org_id
    AND (
      o.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'dev'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to assign organization';
  END IF;

  -- Update user metadata securely
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'organizationId', org_id
  )
  WHERE id = user_id;

  -- Create organization role if it doesn't exist
  INSERT INTO organization_roles (
    organization_id,
    user_id,
    role
  )
  VALUES (org_id, user_id, 'member')
  ON CONFLICT (organization_id, user_id) DO NOTHING;
END;
$$;

-- Create function to initialize new user
CREATE OR REPLACE FUNCTION initialize_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Create organization if user doesn't have one
  IF NOT EXISTS (
    SELECT 1 FROM organizations
    WHERE owner_id = NEW.id
  ) THEN
    INSERT INTO organizations (
      name,
      owner_id,
      settings
    )
    VALUES (
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
    )
    VALUES (org_id, NEW.id, 'owner');

    -- Update user metadata with organization ID
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'organizationId', org_id,
      'role', 'owner'
    )
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new user initialization
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_new_user();

-- Add RLS policies for secure access
ALTER TABLE auth.users FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON auth.users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('dev', 'superadmin')
    )
  );

-- Add helpful comments
COMMENT ON FUNCTION assign_dev_role(uuid) IS 
'Securely assigns dev role to a user - requires superadmin privileges';

COMMENT ON FUNCTION assign_organization(uuid, uuid) IS 
'Securely assigns a user to an organization - requires owner or dev privileges';

COMMENT ON FUNCTION initialize_new_user() IS 
'Initializes new user with organization and proper roles';