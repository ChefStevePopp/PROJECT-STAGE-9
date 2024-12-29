-- Add function to handle new user organization setup
CREATE OR REPLACE FUNCTION handle_new_user_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Create organization for new user
  INSERT INTO organizations (
    name,
    owner_id,
    settings
  ) VALUES (
    COALESCE(NEW.raw_app_metadata->>'organization_name', split_part(NEW.email, '@', 1) || '''s Organization'),
    NEW.id,
    jsonb_build_object(
      'business_type', 'restaurant',
      'default_timezone', 'America/Toronto',
      'multi_unit', false,
      'currency', 'CAD',
      'date_format', 'MM/DD/YYYY',
      'time_format', '12h'
    )
  );

  -- Create owner role
  INSERT INTO organization_roles (
    organization_id,
    user_id,
    role
  )
  SELECT 
    id,
    NEW.id,
    'owner'
  FROM organizations
  WHERE owner_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;
CREATE TRIGGER on_auth_user_created_organization
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_organization();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT, INSERT ON organizations TO authenticated;
GRANT SELECT, INSERT ON organization_roles TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION handle_new_user_organization() IS 
'Automatically creates an organization and owner role for new users';