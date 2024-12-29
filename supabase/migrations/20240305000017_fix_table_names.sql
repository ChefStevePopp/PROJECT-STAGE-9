-- First rename organization_members to organization_roles if it exists
DO $$
BEGIN
  -- First rename the table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') THEN
    ALTER TABLE organization_members RENAME TO organization_roles;
  END IF;

  -- Update any existing foreign key constraints
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_organization_id_fkey') THEN
    ALTER TABLE organization_roles 
    RENAME CONSTRAINT organization_members_organization_id_fkey TO organization_roles_organization_id_fkey;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_user_id_fkey') THEN
    ALTER TABLE organization_roles 
    RENAME CONSTRAINT organization_members_user_id_fkey TO organization_roles_user_id_fkey;
  END IF;

  -- Update unique constraint
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_organization_id_user_id_key') THEN
    ALTER TABLE organization_roles 
    RENAME CONSTRAINT organization_members_organization_id_user_id_key TO organization_roles_organization_id_user_id_key;
  END IF;

  -- Update trigger
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organization_members_updated_at') THEN
    DROP TRIGGER IF EXISTS update_organization_members_updated_at ON organization_roles;
    CREATE TRIGGER update_organization_roles_updated_at
      BEFORE UPDATE ON organization_roles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Ensure table exists with correct structure
CREATE TABLE IF NOT EXISTS organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;