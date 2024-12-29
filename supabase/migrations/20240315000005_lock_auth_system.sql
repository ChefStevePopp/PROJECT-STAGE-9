-- Final auth system lockdown
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Lock down critical auth columns
ALTER TABLE auth.users 
  ALTER COLUMN app_metadata SET NOT NULL,
  ALTER COLUMN raw_app_metadata SET NOT NULL;

-- Re-enable only essential triggers
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created_organization;

-- Add constraints to prevent tampering
ALTER TABLE organizations
  ADD CONSTRAINT organizations_owner_auth_user_fk 
  FOREIGN KEY (owner_id) 
  REFERENCES auth.users(id) 
  ON DELETE RESTRICT;

-- Add validation check for app_metadata
CREATE OR REPLACE FUNCTION validate_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure organizationId exists in app_metadata after organization creation
  IF NEW.raw_app_metadata->>'organizationId' IS NULL AND TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'organizationId is required in app_metadata';
  END IF;

  -- Prevent role tampering
  IF (NEW.raw_app_metadata->>'role' = 'dev' AND OLD.raw_app_metadata->>'role' != 'dev') THEN
    RAISE EXCEPTION 'Cannot self-promote to dev role';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_user_metadata_trigger
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_metadata();

-- Add final security policies
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE organization_roles FORCE ROW LEVEL SECURITY;

REVOKE ALL ON organizations FROM PUBLIC;
REVOKE ALL ON organization_roles FROM PUBLIC;

GRANT SELECT ON organizations TO authenticated;
GRANT SELECT ON organization_roles TO authenticated;

-- Grant specific permissions based on role
CREATE POLICY "Owners can manage their organization"
  ON organizations FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Devs can manage all organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'dev')
  WITH CHECK (auth.jwt()->>'role' = 'dev');

-- Add helpful comments
COMMENT ON TABLE organizations IS 'Organizations table with strict ownership controls';
COMMENT ON TABLE organization_roles IS 'Organization roles with enforced permissions';
COMMENT ON COLUMN auth.users.app_metadata IS 'Protected metadata containing role and organization info';