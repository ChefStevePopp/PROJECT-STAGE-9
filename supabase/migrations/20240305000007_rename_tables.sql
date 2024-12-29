-- Rename tables for better clarity and consistency
DO $$
BEGIN
  -- First rename organization_members to organization_roles if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') THEN
    ALTER TABLE organization_members RENAME TO organization_roles;
  END IF;

  -- Update any foreign key constraints that referenced organization_members
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'location_members_user_id_fkey') THEN
    ALTER TABLE location_members
    RENAME CONSTRAINT location_members_user_id_fkey TO location_members_user_id_fkey_new;
  END IF;

  -- Rename team_members to organization_team_members if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
    ALTER TABLE team_members RENAME TO organization_team_members;
  END IF;

  -- Update policies if they exist
  DO $policies$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname = 'Anyone can view organization members'
      AND tablename = 'organization_roles'
    ) THEN
      ALTER POLICY "Anyone can view organization members" 
      ON organization_roles 
      RENAME TO "Anyone can view organization roles";
    END IF;

    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname = 'Owners and admins can manage organization members'
      AND tablename = 'organization_roles'
    ) THEN
      ALTER POLICY "Owners and admins can manage organization members" 
      ON organization_roles 
      RENAME TO "Owners and admins can manage organization roles";
    END IF;
  END $policies$;

  -- Update indexes if they exist
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'organization_members_pkey') THEN
    ALTER INDEX organization_members_pkey RENAME TO organization_roles_pkey;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'organization_members_organization_id_user_id_key') THEN
    ALTER INDEX organization_members_organization_id_user_id_key 
    RENAME TO organization_roles_organization_id_user_id_key;
  END IF;

  -- Drop and recreate trigger
  DROP TRIGGER IF EXISTS update_organization_members_updated_at ON organization_roles;
  CREATE TRIGGER update_organization_roles_updated_at
    BEFORE UPDATE ON organization_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Update sequences if they exist
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'organization_members_id_seq') THEN
    ALTER SEQUENCE organization_members_id_seq RENAME TO organization_roles_id_seq;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'team_members_id_seq') THEN
    ALTER SEQUENCE team_members_id_seq RENAME TO organization_team_members_id_seq;
  END IF;

END $$;

-- Add comments to document the new table purposes
COMMENT ON TABLE organization_roles IS 
'Stores user roles and permissions within an organization';

COMMENT ON TABLE organization_team_members IS 
'Stores detailed information about staff members within an organization';