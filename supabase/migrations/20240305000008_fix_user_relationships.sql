-- Consolidate user information and relationships
DO $$
BEGIN
  -- 1. First, enhance profiles table to include all necessary user info
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_type text CHECK (employment_type IN ('full_time', 'part_time', 'seasonal', 'temporary'));
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS punch_id text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS departments text[];
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locations uuid[];
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact jsonb;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb;

  -- 2. Migrate data from organization_team_members to profiles if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_team_members') THEN
    -- Update profiles with data from organization_team_members
    UPDATE profiles p
    SET 
      punch_id = otm.punch_id,
      departments = otm.departments,
      -- Convert locations array using a subquery
      locations = ARRAY(
        SELECT uuid(loc)::uuid 
        FROM unnest(otm.locations) loc 
        WHERE loc IS NOT NULL AND trim(loc) != ''
      ),
      phone = otm.phone,
      emergency_contact = otm.emergency_contact,
      notification_preferences = otm.notification_preferences
    FROM organization_team_members otm
    WHERE p.id = otm.id;

    -- 3. Drop the redundant organization_team_members table
    DROP TABLE organization_team_members;
  END IF;

  -- 4. Rename organization_roles to org_role_assignments if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_roles') THEN
    ALTER TABLE organization_roles RENAME TO org_role_assignments;
  END IF;

  -- 5. Update constraints and indexes
  ALTER TABLE org_role_assignments
    DROP CONSTRAINT IF EXISTS org_role_assignments_user_profile_fk,
    ADD CONSTRAINT org_role_assignments_user_profile_fk 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

  -- 6. Add helpful comments
  COMMENT ON TABLE profiles IS 
  'Central table for all user information, linked directly to auth.users';

  COMMENT ON TABLE org_role_assignments IS 
  'Handles role assignments within organizations, referencing profiles';

  -- 7. Update Steve's profile with organization info
  WITH steve_user AS (
    SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com'
  )
  UPDATE profiles 
  SET 
    organization_id = 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
    status = 'active',
    employment_type = 'full_time',
    updated_at = CURRENT_TIMESTAMP
  FROM steve_user
  WHERE profiles.id = steve_user.id;

END $$;