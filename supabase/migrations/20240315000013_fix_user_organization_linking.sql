-- Create secure function to handle new user initialization
CREATE OR REPLACE FUNCTION initialize_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
  org_name text;
BEGIN
  -- Get organization name from metadata or email
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'organization_name',
    split_part(NEW.email, '@', 1) || '''s Organization'
  );

  -- Create organization
  INSERT INTO organizations (
    name,
    owner_id,
    settings
  ) VALUES (
    org_name,
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

  -- Update user metadata with organization ID and role
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'organizationId', org_id,
    'role', COALESCE(raw_user_meta_data->>'role', 'owner')
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Create trigger for new user initialization
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_new_user();

-- Create function to handle organization role changes
CREATE OR REPLACE FUNCTION handle_organization_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user metadata when role changes
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'role', NEW.role,
    'organizationId', NEW.organization_id
  )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS on_organization_role_change ON organization_roles;
CREATE TRIGGER on_organization_role_change
  AFTER INSERT OR UPDATE ON organization_roles
  FOR EACH ROW
  EXECUTE FUNCTION handle_organization_role_change();

-- Add helpful comments
COMMENT ON FUNCTION initialize_new_user() IS 
'Creates organization and assigns owner role for new users';

COMMENT ON FUNCTION handle_organization_role_change() IS 
'Updates user metadata when organization role changes';