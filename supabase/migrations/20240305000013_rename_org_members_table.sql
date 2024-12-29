-- First rename the table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') THEN
    ALTER TABLE organization_members RENAME TO org_role_assignments;
  END IF;

  -- Update any existing foreign key constraints
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_organization_id_fkey') THEN
    ALTER TABLE org_role_assignments 
    RENAME CONSTRAINT organization_members_organization_id_fkey TO org_role_assignments_organization_id_fkey;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_user_id_fkey') THEN
    ALTER TABLE org_role_assignments 
    RENAME CONSTRAINT organization_members_user_id_fkey TO org_role_assignments_user_id_fkey;
  END IF;

  -- Update unique constraint
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_organization_id_user_id_key') THEN
    ALTER TABLE org_role_assignments 
    RENAME CONSTRAINT organization_members_organization_id_user_id_key TO org_role_assignments_organization_id_user_id_key;
  END IF;

  -- Update trigger
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organization_members_updated_at') THEN
    DROP TRIGGER IF EXISTS update_organization_members_updated_at ON org_role_assignments;
    CREATE TRIGGER update_org_role_assignments_updated_at
      BEFORE UPDATE ON org_role_assignments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Ensure table exists with correct structure
CREATE TABLE IF NOT EXISTS org_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE org_role_assignments ENABLE ROW LEVEL SECURITY;